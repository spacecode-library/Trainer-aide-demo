import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getAIWorkoutsByProgram } from '@/lib/services/ai-program-service';

/**
 * GET /api/ai-programs/[id]/workouts
 * Fetch all workouts for an AI program with their exercises
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch workouts for the program
    const workouts = await getAIWorkoutsByProgram(id);

    // Fetch exercises for each workout with exercise names from library
    const workoutsWithExercises = await Promise.all(
      workouts.map(async (workout) => {
        const { data: exercises, error: exercisesError } = await supabaseServer
          .from('ai_workout_exercises')
          .select(`
            *,
            exercise:ta_exercise_library_original (
              name,
              slug,
              image_folder
            )
          `)
          .eq('workout_id', workout.id)
          .order('exercise_order', { ascending: true });

        if (exercisesError) {
          console.error(`Error fetching exercises for workout ${workout.id}:`, exercisesError);
        }

        // Map exercise data to include exercise_name, slug, and image_folder from the joined table
        const exercisesWithNames = exercises?.map(ex => ({
          ...ex,
          exercise_name: ex.exercise?.name || 'Unknown Exercise',
          exercise_slug: ex.exercise?.slug || null,
          exercise_image_folder: ex.exercise?.image_folder || null,
        })) || [];

        return {
          ...workout,
          exercises: exercisesWithNames,
        };
      })
    );

    return NextResponse.json({ workouts: workoutsWithExercises });
  } catch (error) {
    console.error('Error fetching program workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
