// Trainer Aide - TypeScript Type Definitions

// ========================================
// ENUMS & TYPES
// ========================================

// MuscleGroup defines 12 category groups for exercise classification
// NOTE: The imported exercise data currently only contains exercises for 9 of these categories:
//   - Used (9): cardio, chest, back, legs, core, shoulders, biceps, triceps, stretch
//   - Not used (3): full_body, forearms, neck
// The 3 unused categories are defined here for future expansion when additional
// exercises are imported or created for these muscle groups.
export type MuscleGroup =
  | 'cardio'
  | 'chest'
  | 'back'
  | 'legs'
  | 'core'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'full_body'
  | 'stretch'
  | 'forearms'
  | 'neck';

export type ResistanceType = 'bodyweight' | 'weight';

export type SignOffMode = 'full_session' | 'per_block' | 'per_exercise';

export type TemplateType = 'standard' | 'resistance_only';

export type UserRole = 'studio_owner' | 'trainer' | 'client' | 'solo_practitioner';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

// ========================================
// EXERCISE LIBRARY
// ========================================

export interface Exercise {
  id: string;
  exerciseId: string; // Kebab-case ID matching Supabase folder name (e.g., 'ring-dips')
  name: string;
  category: MuscleGroup;
  equipment?: string;
  level: ExerciseLevel;
  instructions: string[];
  modifications?: string[]; // Progressive disclosure: Alternative ways to perform the exercise
  commonMistakes?: string[]; // Progressive disclosure: Common errors to avoid
  primaryMuscles?: string; // Primary muscles worked (for progressive disclosure)
  secondaryMuscles?: string; // Secondary muscles worked (for progressive disclosure)
  imageUrl?: string;
  startImageUrl?: string;
  endImageUrl?: string;
}

// ========================================
// WORKOUT TEMPLATE
// ========================================

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  position: number;
  muscleGroup: MuscleGroup;
  resistanceType: ResistanceType;
  resistanceValue: number;
  repsMin: number;
  repsMax: number;
  sets: number;
  // For cardio
  cardioDuration?: number;  // in seconds
  cardioIntensity?: number; // 1-10 scale
}

export interface WorkoutBlock {
  id: string;
  blockNumber: number;
  name: string;
  exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;  // 'standard' = 3-block with cardio, 'resistance_only' = no cardio required
  createdBy: string;   // user ID
  assignedStudios: string[];
  blocks: WorkoutBlock[];
  defaultSignOffMode?: SignOffMode; // How trainers should sign off sessions using this template
  alertIntervalMinutes?: number; // Alert interval in minutes (e.g., 10 = alert every 10 mins)
  isDefault?: boolean; // Whether this is the default template for the studio
  createdAt: string;
  updatedAt: string;
}

// ========================================
// CLIENT
// ========================================

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
}

// ========================================
// SESSION
// ========================================

export interface SessionExercise {
  id: string;
  exerciseId: string;
  position: number;
  muscleGroup: MuscleGroup;
  resistanceType: ResistanceType;
  resistanceValue: number;
  repsMin: number;
  repsMax: number;
  sets: number;
  // For cardio
  cardioDuration?: number;
  cardioIntensity?: number;
  // Tracking during session
  completed: boolean;
  actualResistance?: number;
  actualReps?: number;
  actualDuration?: number;
  rpe?: number; // Rate of Perceived Exertion for this exercise (1-10)
}

export interface SessionBlock {
  id: string;
  blockNumber: number;
  name: string;
  exercises: SessionExercise[];
  rpe?: number;  // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

export interface Session {
  id: string;
  trainerId: string;
  clientId?: string;
  client?: Client;
  templateId: string;
  template: WorkoutTemplate;
  sessionName: string;
  signOffMode: SignOffMode;
  blocks: SessionBlock[];
  startedAt: string;
  completedAt?: string;
  duration?: number; // in seconds
  overallRpe?: number;
  privateNotes?: string; // Trainer only - not shared with client
  publicNotes?: string; // Shared with client in their dashboard
  recommendations?: string;
  trainerDeclaration: boolean;
  completed: boolean;
}

// ========================================
// USER
// ========================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
}

// ========================================
// STATS & ANALYTICS
// ========================================

export interface DashboardStats {
  totalTemplates?: number;
  activeTemplates?: number;
  totalSessions?: number;
  sessionsToday?: number;
  sessionsThisWeek?: number;
  sessionsThisMonth?: number;
  averageRpe?: number;
  consistencyStreak?: number;
}

// ========================================
// FORM TYPES
// ========================================

export interface CreateTemplateFormData {
  name: string;
  description: string;
  type: TemplateType;
  assignedStudios: string[];
}

export interface StartSessionFormData {
  templateId: string;
  clientId: string;
  signOffMode: SignOffMode;
}

export interface CompleteSessionFormData {
  overallRpe: number;
  privateNotes: string;
  publicNotes: string;
  recommendations?: string;
  trainerDeclaration: boolean;
}
