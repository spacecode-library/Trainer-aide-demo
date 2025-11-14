import { AIWorkout, AIExercise } from '@/lib/types/ai-program';
import { SessionBlock, SessionExercise } from '@/lib/types';

/**
 * Converts an AI workout to session blocks format
 * This allows AI-generated workouts to be used in training sessions
 */
export function convertAIWorkoutToSessionBlocks(workout: AIWorkout): SessionBlock[] {
  if (!workout.exercises || workout.exercises.length === 0) {
    return [];
  }

  // Group exercises by block number (AI workouts may have exercises in different blocks)
  const exercisesByBlock = workout.exercises.reduce((acc, exercise) => {
    const blockNum = exercise.block_number || 1;
    if (!acc[blockNum]) {
      acc[blockNum] = [];
    }
    acc[blockNum].push(exercise);
    return acc;
  }, {} as Record<number, AIExercise[]>);

  // Convert to session blocks
  const blocks: SessionBlock[] = Object.entries(exercisesByBlock)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([blockNum, exercises]) => {
      const sortedExercises = exercises.sort((a, b) => (a.exercise_order || 0) - (b.exercise_order || 0));

      return {
        id: `ai_block_${workout.id}_${blockNum}`,
        blockNumber: Number(blockNum),
        name: `Block ${blockNum}`,
        exercises: sortedExercises.map((exercise, index) =>
          convertAIExerciseToSessionExercise(exercise, index + 1)
        ),
        rpe: undefined,
        completed: false,
      };
    });

  return blocks;
}

/**
 * Converts an AI exercise to session exercise format
 */
export function convertAIExerciseToSessionExercise(
  aiExercise: AIExercise,
  position: number
): SessionExercise {
  // Determine muscle group from exercise name or default to 'other'
  const muscleGroup = determineMuscleGroup(aiExercise.exercise_name);

  // Determine resistance type based on AI exercise data
  const resistanceType = aiExercise.load_type === 'bodyweight'
    ? 'bodyweight'
    : 'weight';

  // Parse reps from AI format (e.g., "10-12" or "10")
  const { repsMin, repsMax } = parseReps(aiExercise.reps || '0');

  return {
    id: `ai_ex_${aiExercise.id}`,
    exerciseId: aiExercise.exercise_id || `custom_${aiExercise.id}`,
    position,
    muscleGroup,
    resistanceType,
    resistanceValue: parseFloat(aiExercise.load_amount || '0'),
    repsMin,
    repsMax,
    sets: aiExercise.sets || 1,
    cardioDuration: undefined, // AI exercises don't typically have cardio duration
    cardioIntensity: undefined,
    completed: false,
    actualResistance: undefined,
    actualReps: undefined,
    actualDuration: undefined,
    rpe: undefined,
    // Store AI-specific fields in a way that can be accessed during the session
    tempo: aiExercise.tempo,
    restSeconds: aiExercise.rest_seconds,
    rir: aiExercise.rir,
    coachingCues: aiExercise.coaching_cues,
    notes: aiExercise.notes,
  };
}

/**
 * Determines muscle group from exercise name
 * This is a simple heuristic - in production you'd want a proper mapping
 */
function determineMuscleGroup(exerciseName: string): string {
  const name = exerciseName.toLowerCase();

  if (name.includes('chest') || name.includes('press') || name.includes('pushup')) {
    return 'chest';
  }
  if (name.includes('back') || name.includes('row') || name.includes('pulldown') || name.includes('pull-up')) {
    return 'back';
  }
  if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) {
    return 'legs';
  }
  if (name.includes('shoulder') || name.includes('lateral') || name.includes('overhead')) {
    return 'shoulders';
  }
  if (name.includes('bicep') || name.includes('curl')) {
    return 'biceps';
  }
  if (name.includes('tricep') || name.includes('extension')) {
    return 'triceps';
  }
  if (name.includes('core') || name.includes('plank') || name.includes('crunch') || name.includes('ab')) {
    return 'core';
  }
  if (name.includes('cardio') || name.includes('run') || name.includes('bike') || name.includes('row')) {
    return 'cardio';
  }
  if (name.includes('stretch')) {
    return 'stretch';
  }

  return 'other';
}

/**
 * Parses reps string (e.g., "10-12" or "10") into min/max values
 */
function parseReps(reps: string): { repsMin: number; repsMax: number } {
  if (reps.includes('-')) {
    const [min, max] = reps.split('-').map(s => parseInt(s.trim(), 10));
    return { repsMin: min || 0, repsMax: max || 0 };
  }

  const repCount = parseInt(reps, 10) || 0;
  return { repsMin: repCount, repsMax: repCount };
}

/**
 * Gets a descriptive name for a session created from an AI workout
 */
export function getAIWorkoutSessionName(
  workout: AIWorkout,
  clientName?: string
): string {
  const workoutName = workout.workout_name || `Week ${workout.week_number} Day ${workout.day_number}`;

  if (clientName) {
    return `${workoutName} with ${clientName}`;
  }

  return workoutName;
}
