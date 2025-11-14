import { NextRequest, NextResponse } from 'next/server';
import { getCompleteProgramData, createAIProgram, createAIWorkout, createAIWorkoutExercises } from '@/lib/services/ai-program-service';

/**
 * POST /api/ai-programs/[id]/duplicate
 * Duplicate an AI program with all its workouts and exercises
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Fetch the original program with all its workouts and exercises
    const { program: originalProgram, workouts, exercises } = await getCompleteProgramData(id);

    if (!originalProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Create new program (copy of original)
    const { data: newProgram, error: programError } = await createAIProgram({
      trainer_id: originalProgram.trainer_id,
      created_by: originalProgram.created_by,
      client_profile_id: null, // Don't copy client assignment
      program_name: `${originalProgram.program_name} (Copy)`,
      description: originalProgram.description,
      total_weeks: originalProgram.total_weeks,
      sessions_per_week: originalProgram.sessions_per_week,
      session_duration_minutes: originalProgram.session_duration_minutes,
      primary_goal: originalProgram.primary_goal,
      secondary_goals: originalProgram.secondary_goals,
      experience_level: originalProgram.experience_level,
      ai_model: originalProgram.ai_model,
      ai_rationale: originalProgram.ai_rationale,
      movement_balance_summary: originalProgram.movement_balance_summary,
      status: 'draft', // New copy starts as draft
      is_template: false, // Duplicate is not a template
      is_published: false, // New copy is not published
      allow_client_modifications: originalProgram.allow_client_modifications,
    });

    if (programError || !newProgram) {
      console.error('Error duplicating program:', programError);
      return NextResponse.json(
        { error: 'Failed to duplicate program', details: programError?.message },
        { status: 500 }
      );
    }

    // Copy all workouts
    const workoutIdMap = new Map<string, string>(); // Map old workout ID to new workout ID

    if (workouts && workouts.length > 0) {
      for (const workout of workouts) {
        const { data: newWorkout, error: workoutError } = await createAIWorkout({
          program_id: newProgram.id,
          week_number: workout.week_number,
          day_number: workout.day_number,
          session_order: workout.session_order,
          workout_name: workout.workout_name,
          workout_focus: workout.workout_focus,
          session_type: workout.session_type,
          scheduled_date: workout.scheduled_date,
          planned_duration_minutes: workout.planned_duration_minutes,
          movement_patterns_covered: workout.movement_patterns_covered,
          planes_of_motion_covered: workout.planes_of_motion_covered,
          primary_muscle_groups: workout.primary_muscle_groups,
          ai_rationale: workout.ai_rationale,
          exercise_selection_criteria: workout.exercise_selection_criteria,
          overall_rpe: workout.overall_rpe,
          trainer_notes: workout.trainer_notes,
          client_feedback: workout.client_feedback,
        });

        if (workoutError || !newWorkout) {
          console.error('Error duplicating workout:', workoutError);
          continue;
        }

        workoutIdMap.set(workout.id, newWorkout.id);
      }
    }

    // Copy all exercises
    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises
        .filter(exercise => workoutIdMap.has(exercise.workout_id))
        .map(exercise => ({
          workout_id: workoutIdMap.get(exercise.workout_id)!,
          exercise_id: exercise.exercise_id,
          exercise_order: exercise.exercise_order,
          block_label: exercise.block_label,
          sets: exercise.sets,
          reps_min: exercise.reps_min,
          reps_max: exercise.reps_max,
          reps_target: exercise.reps_target,
          target_load_kg: exercise.target_load_kg,
          target_load_percentage: exercise.target_load_percentage,
          target_rpe: exercise.target_rpe,
          target_rir: exercise.target_rir,
          tempo: exercise.tempo,
          rest_seconds: exercise.rest_seconds,
          target_duration_seconds: exercise.target_duration_seconds,
          target_distance_meters: exercise.target_distance_meters,
          is_unilateral: exercise.is_unilateral,
          is_bodyweight: exercise.is_bodyweight,
          is_timed: exercise.is_timed,
          coaching_cues: exercise.coaching_cues,
          common_mistakes: exercise.common_mistakes,
          modifications: exercise.modifications,
          actual_sets: exercise.actual_sets,
          actual_reps: exercise.actual_reps,
          actual_load_kg: exercise.actual_load_kg,
          actual_rpe: exercise.actual_rpe,
          actual_duration_seconds: exercise.actual_duration_seconds,
          actual_distance_meters: exercise.actual_distance_meters,
          performance_notes: exercise.performance_notes,
          skip_reason: exercise.skip_reason,
        }));

      if (exercisesToInsert.length > 0) {
        const { error: exercisesError } = await createAIWorkoutExercises(exercisesToInsert);

        if (exercisesError) {
          console.error('Error duplicating exercises:', exercisesError);
        }
      }
    }

    // Fetch the complete duplicated program
    const { program: completeDuplicate } = await getCompleteProgramData(newProgram.id);

    return NextResponse.json({
      program: completeDuplicate,
      message: 'Program duplicated successfully'
    });
  } catch (error) {
    console.error('Error duplicating program:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
