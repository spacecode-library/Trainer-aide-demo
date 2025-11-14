# Phase 2 Backend Complete: Client Profile System ✅

**Date:** 2025-11-14
**Status:** ✅ BACKEND COMPLETE (UI Pending)
**Progress:** Database + Service Layer Done

---

## Summary

Phase 2 backend successfully implements the **client profile system** with all data needed for AI workout generation. The system captures comprehensive client information including goals, experience, injuries, equipment, preferences, and lifestyle factors.

---

## What Was Built

### 1. Supabase Migration (`migrations/001_create_client_profiles.sql`)

**261 lines** of production-ready SQL

**Custom ENUM Types Created:**
```sql
goal_type: 10 options
  - fat_loss, muscle_gain, strength, endurance, hypertrophy, mobility,
    general_fitness, athletic_performance, rehab, recomp

experience_level: 5 levels
  - complete_beginner, beginner, intermediate, advanced, elite

activity_level: 5 levels
  - sedentary, lightly_active, moderately_active, very_active, extremely_active
```

**Table Structure:**
- **40+ fields** capturing all client data
- **JSONB fields** for structured data (injuries, measurements, strength baselines)
- **Array fields** for multi-select data (goals, equipment, limitations)
- **Automatic timestamps** with updated_at trigger
- **6 indexes** for performance
- **Row-Level Security (RLS)** - trainers see only their assigned clients

**Key Field Categories:**
1. **Basic Info** (8 fields): name, email, DOB, gender, height, weight
2. **Fitness Background** (3 fields): experience, training history, activity level
3. **Goals** (4 fields): primary/secondary goals, deadline, motivation
4. **Training Preferences** (6 fields): frequency, duration, days, times, equipment, location
5. **Health & Limitations** (6 fields): injuries, conditions, medications, limitations, doctor clearance
6. **Exercise Preferences** (3 fields): preferred types, aversions, movement patterns
7. **Lifestyle** (5 fields): sleep, stress, occupation, recovery capacity
8. **Nutrition** (4 fields): restrictions, preferences, calorie/macro targets
9. **Progress Tracking** (3 fields): baseline measurements, baseline strength, assessment notes
10. **Metadata** (7 fields): created_by, trainer, studio, active status, timestamps

---

### 2. TypeScript Types (`lib/types/client-profile.ts`)

**462 lines** of comprehensive type definitions

**Main Interfaces:**

```typescript
// Complete client profile (matches database schema)
interface ClientProfile {
  id: string
  client_id?: string | null
  email: string
  first_name: string
  last_name: string

  // ... 40+ fields total

  primary_goal: GoalType
  experience_level: ExperienceLevel
  injuries: Injury[]
  available_equipment: string[]
  // etc.
}

// Structured injury data
interface Injury {
  body_part: string
  description: string
  date?: string
  restrictions: string[]
  severity?: 'mild' | 'moderate' | 'severe'
}

// Workout generation constraints (extracted from profile)
interface WorkoutGenerationConstraints {
  experienceLevel: ExperienceLevel
  primaryGoal: GoalType
  availableEquipment: string[]
  injuries: Injury[]
  exerciseAversions: string[]
  sessionsPerWeek: number
  sessionDurationMinutes: number
  // ... recovery factors, preferences, etc.
}
```

**Wizard Step Interfaces** (for multi-step form):
- `ClientProfileBasics` - Step 1: Name, email, DOB, gender
- `ClientProfilePhysical` - Step 2: Height, weight, experience, activity level
- `ClientProfileGoals` - Step 3: Goals, deadline, motivation
- `ClientProfileTraining` - Step 4: Frequency, duration, equipment, location
- `ClientProfileHealth` - Step 5: Injuries, conditions, limitations, aversions
- `ClientProfileLifestyle` - Step 6: Sleep, stress, occupation, diet

**Helper Functions:**
```typescript
extractWorkoutConstraints(profile): WorkoutGenerationConstraints
getGoalLabel(goal): string  // "fat_loss" → "Fat Loss"
getExperienceLevelLabel(level): string
getActivityLevelLabel(level): string
getClientFullName(profile): string
getClientAge(profile): number | null
getBMI(profile): number | null
```

---

### 3. Client Profile Service (`lib/services/client-profile-service.ts`)

**417 lines** of Supabase operations

**CREATE Operations:**
```typescript
createClientProfile(input): Promise<{data, error}>
```

**READ Operations:**
```typescript
getAllClientProfiles(): Promise<ClientProfile[]>
getClientProfileById(id): Promise<ClientProfile | null>
getClientProfileByEmail(email): Promise<ClientProfile | null>
getClientProfilesByTrainer(trainerId): Promise<ClientProfile[]>
searchClientProfiles(searchTerm): Promise<ClientProfile[]>
```

**UPDATE Operations:**
```typescript
updateClientProfile(id, updates): Promise<{data, error}>
updateClientInjuries(id, injuries): Promise<{success, error}>
updateClientGoals(id, primaryGoal, secondaryGoals): Promise<{success, error}>
```

**DELETE Operations:**
```typescript
deactivateClientProfile(id): Promise<{success, error}>  // Soft delete
deleteClientProfile(id): Promise<{success, error}>  // Hard delete
```

**FILTERING & ANALYTICS:**
```typescript
getClientProfilesByGoal(goal): Promise<ClientProfile[]>
getClientProfilesByExperience(level): Promise<ClientProfile[]>
getActiveClientCount(): Promise<number>
getClientProfileStats(): Promise<{total, byGoal, byExperience}>
```

**VALIDATION:**
```typescript
isEmailTaken(email, excludeId?): Promise<boolean>
validateClientProfile(input): {isValid, errors}
```

---

## Database Schema Details

### Core Fields for AI Workout Generation

| Category | Fields | Purpose |
|----------|--------|---------|
| **Goals** | primary_goal, secondary_goals, goal_deadline | Determines workout style, volume, intensity |
| **Experience** | experience_level, training_history, activity_level | Sets exercise difficulty, complexity |
| **Equipment** | available_equipment[], training_location | Filters exercise selection |
| **Health** | injuries[], physical_limitations[], medical_conditions[] | Prevents injury conflicts |
| **Preferences** | preferred_exercise_types[], exercise_aversions[], preferred_movement_patterns[] | Personalizes selections |
| **Training** | preferred_training_frequency, preferred_session_duration_minutes | Structures program |
| **Recovery** | average_sleep_hours, stress_level, recovery_capacity | Adjusts volume/intensity |

### JSONB Structured Fields

**Injuries:**
```json
[
  {
    "body_part": "shoulder",
    "description": "Rotator cuff strain",
    "date": "2024-01-15",
    "restrictions": ["no overhead press", "limit shoulder rotation"],
    "severity": "moderate"
  }
]
```

**Baseline Measurements:**
```json
{
  "chest_cm": 100,
  "waist_cm": 85,
  "hips_cm": 95,
  "bicep_cm": 35,
  "body_fat_percentage": 18.5
}
```

**Baseline Strength:**
```json
{
  "bench_press_kg": 60,
  "squat_kg": 100,
  "deadlift_kg": 120,
  "overhead_press_kg": 40,
  "pull_ups": 8,
  "plank_seconds": 90
}
```

---

## Files Created

1. ✅ `migrations/001_create_client_profiles.sql` (261 lines)
2. ✅ `lib/types/client-profile.ts` (462 lines)
3. ✅ `lib/services/client-profile-service.ts` (417 lines)

**Total:** 1,140 lines of backend code

---

## Integration with AI System

The `extractWorkoutConstraints()` function prepares client data for AI:

```typescript
const profile = await getClientProfileById(clientId);
const constraints = extractWorkoutConstraints(profile);

// constraints now contains:
// - experienceLevel: 'beginner'
// - primaryGoal: 'muscle_gain'
// - availableEquipment: ['dumbbells', 'bench', 'bodyweight']
// - injuries: [{body_part: 'shoulder', restrictions: ['no overhead press']}]
// - exerciseAversions: ['burpees']
// - sessionsPerWeek: 3
// - sessionDurationMinutes: 60
// - sleepHours: 7
// - stressLevel: 3
// - recoveryCapacity: 4

// Pass to AI workout generator
const program = await generateWorkoutProgram(constraints);
```

---

## Row-Level Security (RLS) Policies

Implemented 4 policies for data protection:

1. **SELECT**: Trainers can view profiles they're assigned to or created
2. **INSERT**: Trainers can create profiles
3. **UPDATE**: Trainers can update their assigned profiles
4. **DELETE**: Trainers can delete profiles they created

**Authentication:** Uses Supabase `auth.uid()` for automatic user identification

---

## Validation Rules

**Required Fields:**
- ✅ email (valid format)
- ✅ first_name
- ✅ last_name
- ✅ primary_goal
- ✅ experience_level

**Constraints:**
- preferred_training_frequency: 1-7 days/week
- preferred_session_duration_minutes: 15-180 minutes
- sleep_quality, stress_level, recovery_capacity: 1-5 scale
- Unique email per profile

---

## What's Next: Phase 2 UI

Now that the backend is complete, we need to build:

### Client Intake Wizard UI
- **6-step wizard** for collecting client data
- **Progress indicator** showing current step
- **Form validation** with error messages
- **Equipment selector** with checkboxes
- **Injury manager** (add/remove/edit injuries)
- **Goal selector** with descriptions
- **Preview & submit** final step

**Estimated Time:** 4-5 hours

---

## Success Metrics

✅ All Phase 2 Backend goals achieved:
- [x] Supabase migration created with 40+ fields
- [x] Custom ENUM types for goals, experience, activity
- [x] JSONB fields for structured data
- [x] Row-Level Security policies implemented
- [x] Complete TypeScript type system
- [x] Full CRUD service layer
- [x] Validation helpers
- [x] Analytics functions
- [x] AI constraint extraction helper

**Phase 2 Backend: COMPLETE** 🎉

**Next:** Phase 2 UI (Client Intake Wizard) or Phase 3 (AI Program Tables)?
