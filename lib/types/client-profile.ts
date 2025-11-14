/**
 * Client Profile Types
 *
 * Types for the client_profiles table used for AI workout generation
 */

// ========================================
// ENUMS
// ========================================

export type GoalType =
  | 'fat_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'hypertrophy'
  | 'mobility'
  | 'general_fitness'
  | 'athletic_performance'
  | 'rehab'
  | 'recomp';

export type ExperienceLevel =
  | 'complete_beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'elite';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type TrainingLocation = 'gym' | 'home' | 'studio' | 'outdoor' | 'mixed';

export type OccupationType = 'desk_job' | 'manual_labor' | 'active' | 'standing' | 'mixed';

// ========================================
// STRUCTURED DATA INTERFACES
// ========================================

export interface Injury {
  body_part: string;
  description: string;
  date?: string;  // ISO date string
  restrictions: string[];  // e.g., ['no overhead press', 'limit ROM']
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface MacroTargets {
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface BaselineMeasurements {
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  thigh_cm?: number;
  bicep_cm?: number;
  calf_cm?: number;
  neck_cm?: number;
  body_fat_percentage?: number;
  [key: string]: number | undefined;  // Allow custom measurements
}

export interface BaselineStrength {
  bench_press_kg?: number;
  squat_kg?: number;
  deadlift_kg?: number;
  overhead_press_kg?: number;
  pull_ups?: number;
  push_ups?: number;
  plank_seconds?: number;
  [key: string]: number | undefined;  // Allow custom exercises
}

// ========================================
// MAIN CLIENT PROFILE INTERFACE
// ========================================

export interface ClientProfile {
  // Identity
  id: string;  // UUID
  client_id?: string | null;  // Link to existing client record
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;  // ISO date string
  gender?: Gender | null;

  // Physical Profile
  height_cm?: number | null;
  current_weight_kg?: number | null;
  target_weight_kg?: number | null;

  // Fitness Background
  experience_level: ExperienceLevel;
  training_history?: string | null;
  current_activity_level: ActivityLevel;

  // Goals
  primary_goal: GoalType;
  secondary_goals: GoalType[];
  goal_deadline?: string | null;  // ISO date string
  motivation_notes?: string | null;

  // Training Preferences
  preferred_training_frequency?: number | null;  // sessions per week (1-7)
  preferred_session_duration_minutes?: number | null;  // 30, 45, 60, 90
  preferred_training_days: string[];  // ['monday', 'wednesday', 'friday']
  preferred_training_times: string[];  // ['morning', 'afternoon', 'evening']

  // Equipment Access
  available_equipment: string[];  // ['barbell', 'dumbbells', 'bench', 'cables']
  training_location?: TrainingLocation | null;

  // Health & Limitations
  injuries: Injury[];
  medical_conditions: string[];
  medications: string[];
  physical_limitations: string[];
  doctor_clearance: boolean;

  // Exercise Preferences & Aversions
  preferred_exercise_types: string[];  // ['strength training', 'HIIT', 'yoga']
  exercise_aversions: string[];  // ['burpees', 'running']
  preferred_movement_patterns: string[];  // From MovementPattern type

  // Lifestyle Factors
  average_sleep_hours?: number | null;  // e.g., 7.5
  sleep_quality?: number | null;  // 1-5 scale
  stress_level?: number | null;  // 1-5 scale
  occupation_type?: OccupationType | null;
  recovery_capacity?: number | null;  // 1-5 scale

  // Nutrition (optional)
  dietary_restrictions: string[];
  dietary_preferences: string[];
  daily_calorie_target?: number | null;
  macro_targets?: MacroTargets | null;

  // Progress Tracking
  baseline_measurements?: BaselineMeasurements | null;
  baseline_strength?: BaselineStrength | null;
  fitness_assessment_notes?: string | null;

  // Metadata
  created_by?: string | null;  // Trainer UUID
  assigned_trainer_id?: string | null;  // Current trainer UUID
  studio_id?: string | null;  // For multi-tenancy
  is_active: boolean;
  notes?: string | null;  // Trainer notes

  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}

// ========================================
// SIMPLIFIED INTERFACES FOR FORMS
// ========================================

/**
 * Minimal client profile for intake wizard (Step 1: Basics)
 */
export interface ClientProfileBasics {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  gender?: Gender;
}

/**
 * Physical profile (Step 2: Physical Info)
 */
export interface ClientProfilePhysical {
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  experience_level: ExperienceLevel;
  current_activity_level: ActivityLevel;
}

/**
 * Goals and motivation (Step 3: Goals)
 */
export interface ClientProfileGoals {
  primary_goal: GoalType;
  secondary_goals: GoalType[];
  goal_deadline?: string;
  motivation_notes?: string;
}

/**
 * Training preferences (Step 4: Training Setup)
 */
export interface ClientProfileTraining {
  preferred_training_frequency: number;
  preferred_session_duration_minutes: number;
  preferred_training_days: string[];
  preferred_training_times: string[];
  available_equipment: string[];
  training_location: TrainingLocation;
}

/**
 * Health and limitations (Step 5: Health Screening)
 */
export interface ClientProfileHealth {
  injuries: Injury[];
  medical_conditions: string[];
  medications: string[];
  physical_limitations: string[];
  doctor_clearance: boolean;
  preferred_exercise_types: string[];
  exercise_aversions: string[];
}

/**
 * Lifestyle factors (Step 6: Lifestyle - Optional)
 */
export interface ClientProfileLifestyle {
  average_sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  occupation_type?: OccupationType;
  recovery_capacity?: number;
  dietary_restrictions: string[];
  dietary_preferences: string[];
}

// ========================================
// CREATE/UPDATE TYPES
// ========================================

/**
 * Data required to create a new client profile
 */
export type CreateClientProfileInput = Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;  // Optional - will be generated if not provided
};

/**
 * Data allowed for updating a client profile
 */
export type UpdateClientProfileInput = Partial<Omit<ClientProfile, 'id' | 'created_at'>>;

// ========================================
// HELPER TYPES FOR AI GENERATION
// ========================================

/**
 * Extracted constraints for AI workout generation
 */
export interface WorkoutGenerationConstraints {
  // From profile
  experienceLevel: ExperienceLevel;
  primaryGoal: GoalType;
  secondaryGoals: GoalType[];
  availableEquipment: string[];
  trainingLocation: TrainingLocation;
  sessionsPerWeek: number;
  sessionDurationMinutes: number;

  // Health constraints
  injuries: Injury[];
  physicalLimitations: string[];
  exerciseAversions: string[];

  // Preferences
  preferredExerciseTypes: string[];
  preferredMovementPatterns: string[];
  preferredTrainingDays: string[];
  preferredTrainingTimes: string[];

  // Recovery factors
  sleepHours?: number;
  sleepQuality?: number;
  stressLevel?: number;
  recoveryCapacity?: number;
  activityLevel: ActivityLevel;
}

/**
 * Extract workout generation constraints from client profile
 */
export function extractWorkoutConstraints(profile: ClientProfile): WorkoutGenerationConstraints {
  return {
    experienceLevel: profile.experience_level,
    primaryGoal: profile.primary_goal,
    secondaryGoals: profile.secondary_goals,
    availableEquipment: profile.available_equipment,
    trainingLocation: profile.training_location || 'gym',
    sessionsPerWeek: profile.preferred_training_frequency || 3,
    sessionDurationMinutes: profile.preferred_session_duration_minutes || 60,
    injuries: profile.injuries,
    physicalLimitations: profile.physical_limitations,
    exerciseAversions: profile.exercise_aversions,
    preferredExerciseTypes: profile.preferred_exercise_types,
    preferredMovementPatterns: profile.preferred_movement_patterns,
    preferredTrainingDays: profile.preferred_training_days,
    preferredTrainingTimes: profile.preferred_training_times,
    sleepHours: profile.average_sleep_hours || undefined,
    sleepQuality: profile.sleep_quality || undefined,
    stressLevel: profile.stress_level || undefined,
    recoveryCapacity: profile.recovery_capacity || undefined,
    activityLevel: profile.current_activity_level,
  };
}

// ========================================
// DISPLAY HELPERS
// ========================================

export function getGoalLabel(goal: GoalType): string {
  const labels: Record<GoalType, string> = {
    fat_loss: 'Fat Loss',
    muscle_gain: 'Muscle Gain',
    strength: 'Strength',
    endurance: 'Endurance',
    hypertrophy: 'Hypertrophy',
    mobility: 'Mobility',
    general_fitness: 'General Fitness',
    athletic_performance: 'Athletic Performance',
    rehab: 'Rehabilitation',
    recomp: 'Body Recomposition',
  };
  return labels[goal] || goal;
}

export function getExperienceLevelLabel(level: ExperienceLevel): string {
  const labels: Record<ExperienceLevel, string> = {
    complete_beginner: 'Complete Beginner',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    elite: 'Elite',
  };
  return labels[level] || level;
}

export function getActivityLevelLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary (Little to no exercise)',
    lightly_active: 'Lightly Active (1-3 days/week)',
    moderately_active: 'Moderately Active (3-5 days/week)',
    very_active: 'Very Active (6-7 days/week)',
    extremely_active: 'Extremely Active (Athlete)',
  };
  return labels[level] || level;
}

export function getClientFullName(profile: ClientProfile): string {
  return `${profile.first_name} ${profile.last_name}`;
}

export function getClientAge(profile: ClientProfile): number | null {
  if (!profile.date_of_birth) return null;

  const today = new Date();
  const birthDate = new Date(profile.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function getBMI(profile: ClientProfile): number | null {
  if (!profile.height_cm || !profile.current_weight_kg) return null;

  const heightM = profile.height_cm / 100;
  return profile.current_weight_kg / (heightM * heightM);
}
