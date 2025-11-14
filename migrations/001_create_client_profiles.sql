-- =====================================================
-- Migration: Client Profiles for AI Workout Generation
-- =====================================================
-- This table extends the basic client info with fitness data
-- needed for intelligent AI workout generation
--
-- Run this in Supabase SQL Editor

-- Create ENUM types for client profiles
DO $$ BEGIN
  CREATE TYPE goal_type AS ENUM (
    'fat_loss',
    'muscle_gain',
    'strength',
    'endurance',
    'hypertrophy',
    'mobility',
    'general_fitness',
    'athletic_performance',
    'rehab',
    'recomp'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experience_level AS ENUM (
    'complete_beginner',
    'beginner',
    'intermediate',
    'advanced',
    'elite'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_level AS ENUM (
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extremely_active'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to existing client (if you have a clients table)
  -- Otherwise, use this as the primary client record
  client_id UUID UNIQUE,  -- Can be NULL if this is the primary record

  -- Basic Info
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,  -- 'male', 'female', 'other', 'prefer_not_to_say'

  -- Physical Profile
  height_cm NUMERIC(5, 2),  -- e.g., 175.50
  current_weight_kg NUMERIC(6, 2),  -- e.g., 80.50
  target_weight_kg NUMERIC(6, 2),

  -- Fitness Background
  experience_level experience_level DEFAULT 'beginner',
  training_history TEXT,  -- Free text: "Played soccer for 5 years, new to gym"
  current_activity_level activity_level DEFAULT 'lightly_active',

  -- Goals
  primary_goal goal_type NOT NULL,
  secondary_goals goal_type[] DEFAULT '{}',  -- Array of goals
  goal_deadline DATE,  -- Target date for goal achievement
  motivation_notes TEXT,  -- Why they want to achieve this goal

  -- Training Preferences
  preferred_training_frequency INT CHECK (preferred_training_frequency BETWEEN 1 AND 7),  -- sessions per week
  preferred_session_duration_minutes INT CHECK (preferred_session_duration_minutes > 0),  -- 30, 45, 60, etc.
  preferred_training_days TEXT[] DEFAULT '{}',  -- ['monday', 'wednesday', 'friday']
  preferred_training_times TEXT[] DEFAULT '{}',  -- ['morning', 'afternoon', 'evening']

  -- Equipment Access
  available_equipment TEXT[] DEFAULT '{}',  -- ['barbell', 'dumbbells', 'bench', 'cables', 'bodyweight']
  training_location TEXT,  -- 'gym', 'home', 'studio', 'outdoor', etc.

  -- Health & Limitations
  injuries JSONB DEFAULT '[]',  -- [{body_part: 'shoulder', description: 'rotator cuff strain', date: '2024-01-15', restrictions: ['no overhead press']}]
  medical_conditions TEXT[] DEFAULT '{}',  -- ['asthma', 'high blood pressure']
  medications TEXT[] DEFAULT '{}',  -- Medications that might affect exercise
  physical_limitations TEXT[] DEFAULT '{}',  -- ['limited hip mobility', 'knee pain on deep squat']
  doctor_clearance BOOLEAN DEFAULT false,  -- Has doctor cleared them for exercise?

  -- Exercise Preferences & Aversions
  preferred_exercise_types TEXT[] DEFAULT '{}',  -- ['strength training', 'HIIT', 'yoga']
  exercise_aversions TEXT[] DEFAULT '{}',  -- ['burpees', 'running', 'overhead press']
  preferred_movement_patterns TEXT[] DEFAULT '{}',  -- From movement_pattern enum

  -- Lifestyle Factors (for recovery planning)
  average_sleep_hours NUMERIC(3, 1),  -- e.g., 7.5
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),  -- 1=poor, 5=excellent
  stress_level INT CHECK (stress_level BETWEEN 1 AND 5),  -- 1=low, 5=high
  occupation_type TEXT,  -- 'desk_job', 'manual_labor', 'active', etc.
  recovery_capacity INT CHECK (recovery_capacity BETWEEN 1 AND 5),  -- Self-assessed

  -- Nutrition (optional, for future nutrition AI)
  dietary_restrictions TEXT[] DEFAULT '{}',  -- ['vegetarian', 'gluten-free', 'dairy-free']
  dietary_preferences TEXT[] DEFAULT '{}',  -- ['high protein', 'low carb']
  daily_calorie_target INT,
  macro_targets JSONB,  -- {protein_g: 150, carbs_g: 200, fats_g: 60}

  -- Progress Tracking
  baseline_measurements JSONB,  -- {chest_cm: 100, waist_cm: 85, bicep_cm: 35, ...}
  baseline_strength JSONB,  -- {bench_press_kg: 60, squat_kg: 100, deadlift_kg: 120, ...}
  fitness_assessment_notes TEXT,

  -- Metadata
  created_by UUID,  -- Trainer who created this profile
  assigned_trainer_id UUID,  -- Current trainer
  studio_id UUID,  -- For multi-tenancy
  is_active BOOLEAN DEFAULT true,
  notes TEXT,  -- General trainer notes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_profiles_email ON client_profiles(email);
CREATE INDEX IF NOT EXISTS idx_client_profiles_client_id ON client_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_trainer ON client_profiles(assigned_trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_studio ON client_profiles(studio_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_active ON client_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_client_profiles_primary_goal ON client_profiles(primary_goal);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Trainers can view profiles they're assigned to
CREATE POLICY "Trainers can view their assigned client profiles"
  ON client_profiles
  FOR SELECT
  USING (
    auth.uid() = assigned_trainer_id
    OR auth.uid() = created_by
  );

-- Policy: Trainers can insert profiles
CREATE POLICY "Trainers can create client profiles"
  ON client_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Trainers can update their assigned client profiles
CREATE POLICY "Trainers can update their assigned client profiles"
  ON client_profiles
  FOR UPDATE
  USING (
    auth.uid() = assigned_trainer_id
    OR auth.uid() = created_by
  )
  WITH CHECK (
    auth.uid() = assigned_trainer_id
    OR auth.uid() = created_by
  );

-- Policy: Trainers can delete profiles they created
CREATE POLICY "Trainers can delete client profiles they created"
  ON client_profiles
  FOR DELETE
  USING (auth.uid() = created_by);

-- Sample data (optional - for testing)
-- COMMENT OUT AFTER TESTING
/*
INSERT INTO client_profiles (
  email, first_name, last_name, date_of_birth, gender,
  height_cm, current_weight_kg, target_weight_kg,
  experience_level, primary_goal, secondary_goals,
  preferred_training_frequency, preferred_session_duration_minutes,
  available_equipment, training_location,
  injuries, physical_limitations
) VALUES (
  'john.doe@example.com',
  'John',
  'Doe',
  '1990-05-15',
  'male',
  180.0,
  85.0,
  80.0,
  'beginner',
  'fat_loss',
  ARRAY['muscle_gain', 'general_fitness']::goal_type[],
  3,
  60,
  ARRAY['dumbbells', 'bench', 'bodyweight'],
  'home',
  '[{"body_part": "shoulder", "description": "Old rotator cuff strain", "restrictions": ["no overhead press", "limit shoulder rotation"]}]'::jsonb,
  ARRAY['limited hip mobility']
);
*/

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify table creation
SELECT
  'client_profiles table created successfully' AS status,
  COUNT(*) AS row_count
FROM client_profiles;
