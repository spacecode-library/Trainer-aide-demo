/**
 * Extended types for AI Program Editor components
 * These types include denormalized fields from the exercise library for UI purposes
 */

import type { AIProgram, AIWorkout, AIWorkoutExercise } from './ai-program';
import type { Exercise } from './index';

/**
 * AIWorkoutExercise enriched with exercise library details for editor UI
 */
export interface AIWorkoutExerciseWithDetails extends AIWorkoutExercise {
  // Denormalized fields from exercise library
  exercise_name: string;
  movement_pattern?: string | null;
  primary_muscles?: string[];

  // UI convenience field for reps (maps to reps_target or reps_min-reps_max)
  reps?: string;

  // UI convenience field for rir (maps to target_rir)
  rir?: number | null;

  // UI convenience field for notes (maps to performance_notes or coaching_cues)
  notes?: string;
}

/**
 * Enriches an AIWorkoutExercise with exercise library details
 */
export function enrichExerciseWithDetails(
  exercise: AIWorkoutExercise,
  exerciseLibraryData?: Exercise | null
): AIWorkoutExerciseWithDetails {
  // Format reps for display
  let reps = exercise.reps_target || '';
  if (!reps && exercise.reps_min && exercise.reps_max) {
    reps = exercise.reps_min === exercise.reps_max
      ? `${exercise.reps_min}`
      : `${exercise.reps_min}-${exercise.reps_max}`;
  }

  // Ensure primary_muscles is always an array
  const primaryMuscles = exerciseLibraryData?.primaryMuscles
    ? (Array.isArray(exerciseLibraryData.primaryMuscles)
        ? exerciseLibraryData.primaryMuscles
        : [exerciseLibraryData.primaryMuscles])
    : [];

  return {
    ...exercise,
    exercise_name: exerciseLibraryData?.name || `Exercise ${exercise.exercise_id}`,
    movement_pattern: exerciseLibraryData?.movementPattern || null,
    primary_muscles: primaryMuscles,
    reps: reps || undefined,
    rir: exercise.target_rir || undefined,
    notes: exercise.performance_notes || exercise.coaching_cues.join(', ') || undefined,
  };
}

/**
 * Strips enriched fields from AIWorkoutExerciseWithDetails back to AIWorkoutExercise
 */
export function stripEnrichment(
  enrichedExercise: AIWorkoutExerciseWithDetails
): Omit<AIWorkoutExercise, 'id' | 'created_at' | 'updated_at' | 'is_completed' | 'skipped'> {
  // Parse reps back into min/max/target
  let reps_min = enrichedExercise.reps_min;
  let reps_max = enrichedExercise.reps_max;
  let reps_target = enrichedExercise.reps_target;

  if (enrichedExercise.reps) {
    reps_target = enrichedExercise.reps;
    if (enrichedExercise.reps.includes('-')) {
      const [min, max] = enrichedExercise.reps.split('-').map(s => parseInt(s.trim(), 10));
      if (!isNaN(min)) reps_min = min;
      if (!isNaN(max)) reps_max = max;
    } else {
      const val = parseInt(enrichedExercise.reps, 10);
      if (!isNaN(val)) {
        reps_min = val;
        reps_max = val;
      }
    }
  }

  const {
    exercise_name,
    movement_pattern,
    primary_muscles,
    reps,
    rir,
    notes,
    id,
    created_at,
    updated_at,
    is_completed,
    skipped,
    ...baseExercise
  } = enrichedExercise;

  return {
    ...baseExercise,
    reps_min,
    reps_max,
    reps_target,
    target_rir: rir !== undefined ? rir : baseExercise.target_rir,
    performance_notes: notes || baseExercise.performance_notes,
  };
}

/**
 * AIProgram enriched with workouts for editor UI
 */
export interface AIProgramWithWorkouts extends AIProgram {
  workouts?: AIWorkout[];
}
