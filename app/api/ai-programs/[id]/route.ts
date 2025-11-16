import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { updateAIProgram, deleteAIProgram, getAIProgramById } from '@/lib/services/ai-program-service';
import { getUserById } from '@/lib/mock-data/users';

/**
 * GET /api/ai-programs/[id]
 * Fetch a single AI program with its workouts and exercises
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const program = await getAIProgramById(id);

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai-programs/[id]
 * Update an AI program
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Role-based access control: Verify program belongs to a solo practitioner
    const existingProgram = await getAIProgramById(id);
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const user = getUserById(existingProgram.trainer_id);
    if (!user || user.role !== 'solo_practitioner') {
      return NextResponse.json(
        { error: 'Unauthorized: AI Programs are only available to solo practitioners' },
        { status: 403 }
      );
    }

    // Update program metadata
    const { data: updatedProgram, error } = await updateAIProgram(id, {
      program_name: body.program_name,
      description: body.description,
      total_weeks: body.total_weeks,
      sessions_per_week: body.sessions_per_week,
      session_duration_minutes: body.session_duration_minutes,
      status: body.status,
    });

    if (error || !updatedProgram) {
      console.error('Error updating program:', error);
      return NextResponse.json(
        { error: 'Failed to update program', details: error?.message },
        { status: 500 }
      );
    }

    // Update workouts if provided
    if (body.workouts && Array.isArray(body.workouts)) {
      for (const workout of body.workouts) {
        await supabaseServer
          .from('ai_workouts')
          .update({
            workout_name: workout.workout_name,
            notes: workout.notes,
          })
          .eq('id', workout.id);

        // Update exercises if provided
        if (workout.exercises && Array.isArray(workout.exercises)) {
          for (const exercise of workout.exercises) {
            await supabaseServer
              .from('ai_workout_exercises')
              .update({
                exercise_name: exercise.exercise_name,
                sets: exercise.sets,
                reps: exercise.reps,
                tempo: exercise.tempo,
                rest_seconds: exercise.rest_seconds,
                rir: exercise.rir,
                movement_pattern: exercise.movement_pattern,
                primary_muscles: exercise.primary_muscles,
                coaching_cues: exercise.coaching_cues,
                notes: exercise.notes,
                order_index: exercise.order_index,
              })
              .eq('id', exercise.id);
          }
        }
      }
    }

    // Fetch updated program with all relations
    const fullProgram = await getAIProgramById(id);

    return NextResponse.json({
      program: fullProgram,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-programs/[id]
 * Delete an AI program
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Role-based access control: Verify program belongs to a solo practitioner
    const existingProgram = await getAIProgramById(id);
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const user = getUserById(existingProgram.trainer_id);
    if (!user || user.role !== 'solo_practitioner') {
      return NextResponse.json(
        { error: 'Unauthorized: AI Programs are only available to solo practitioners' },
        { status: 403 }
      );
    }

    const { success, error } = await deleteAIProgram(id);

    if (!success || error) {
      console.error('Error deleting program:', error);
      return NextResponse.json(
        { error: 'Failed to delete program', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
