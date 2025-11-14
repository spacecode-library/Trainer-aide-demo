import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getAIProgramById, createAIProgram } from '@/lib/services/ai-program-service';

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
    const originalProgram = await getAIProgramById(id);

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
      experience_level: originalProgram.experience_level,
      ai_model: originalProgram.ai_model,
      ai_rationale: originalProgram.ai_rationale,
      movement_balance_summary: originalProgram.movement_balance_summary,
      status: 'draft', // New copy starts as draft
      is_template: false, // Duplicate is not a template
    });

    if (programError || !newProgram) {
      console.error('Error duplicating program:', programError);
      return NextResponse.json(
        { error: 'Failed to duplicate program', details: programError?.message },
        { status: 500 }
      );
    }

    // Copy all workouts
    if (originalProgram.workouts && originalProgram.workouts.length > 0) {
      for (const workout of originalProgram.workouts) {
        const { data: newWorkout, error: workoutError } = await supabaseServer
          .from('ai_workouts')
          .insert({
            ai_program_id: newProgram.id,
            week_number: workout.week_number,
            day_number: workout.day_number,
            workout_name: workout.workout_name,
            notes: workout.notes,
          })
          .select()
          .single();

        if (workoutError || !newWorkout) {
          console.error('Error duplicating workout:', workoutError);
          continue;
        }

        // Copy all exercises for this workout
        if (workout.exercises && workout.exercises.length > 0) {
          const exercisesToInsert = workout.exercises.map(exercise => ({
            ai_workout_id: newWorkout.id,
            exercise_id: exercise.exercise_id,
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
            reps: exercise.reps,
            tempo: exercise.tempo,
            rest_seconds: exercise.rest_seconds,
            rir: exercise.rir,
            movement_pattern: exercise.movement_pattern,
            primary_muscles: exercise.primary_muscles,
            secondary_muscles: exercise.secondary_muscles,
            equipment: exercise.equipment,
            coaching_cues: exercise.coaching_cues,
            notes: exercise.notes,
            order_index: exercise.order_index,
          }));

          const { error: exercisesError } = await supabaseServer
            .from('ai_exercises')
            .insert(exercisesToInsert);

          if (exercisesError) {
            console.error('Error duplicating exercises:', exercisesError);
          }
        }
      }
    }

    // Fetch the complete duplicated program
    const completeDuplicate = await getAIProgramById(newProgram.id);

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
