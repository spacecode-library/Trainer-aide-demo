/**
 * AI Program Service
 *
 * Supabase operations for AI-generated workout programs
 */

import { supabaseServer as supabase } from '../supabase-server';
import type {
  AIProgram,
  AIWorkout,
  AIWorkoutExercise,
  AINutritionPlan,
  AIGeneration,
  AIProgramRevision,
  CreateAIProgramInput,
  UpdateAIProgramInput,
  CreateAIWorkoutInput,
  CreateAIWorkoutExerciseInput,
  ProgramStatus,
} from '../types/ai-program';

// ========================================
// AI PROGRAMS (Master Records)
// ========================================

/**
 * Create new AI program
 */
export async function createAIProgram(
  input: CreateAIProgramInput
): Promise<{ data: AIProgram | null; error: Error | null }> {
  try {
    console.log('🔍 DEBUG - createAIProgram called with input:', {
      trainer_id: input.trainer_id,
      client_profile_id: input.client_profile_id,
      program_name: input.program_name,
      total_weeks: input.total_weeks,
      sessions_per_week: input.sessions_per_week,
      generation_status: input.generation_status,
    });

    console.log('🔍 DEBUG - Supabase client available:', !!supabase);
    console.log('🔍 DEBUG - About to insert into ai_programs table...');

    const { data, error } = await supabase
      .from('ai_programs')
      .insert(input)
      .select()
      .single();

    console.log('🔍 DEBUG - Insert result:', {
      hasData: !!data,
      hasError: !!error,
      dataId: data?.id,
    });

    if (error) {
      console.error('❌ ERROR creating AI program:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
      return { data: null, error: new Error(error.message) };
    }

    console.log('✅ Program created successfully:', data?.id);
    return { data, error: null };
  } catch (err: any) {
    console.error('❌ EXCEPTION creating AI program:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      fullError: JSON.stringify(err, null, 2),
    });
    return { data: null, error: err };
  }
}

/**
 * Get AI program by ID
 */
export async function getAIProgramById(id: string): Promise<AIProgram | null> {
  const { data, error } = await supabase
    .from('ai_programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching AI program:', error);
    return null;
  }

  return data;
}

/**
 * Get all AI programs for a trainer
 */
export async function getAIProgramsByTrainer(trainerId: string): Promise<AIProgram[]> {
  const { data, error } = await supabase
    .from('ai_programs')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching trainer programs:', error);
    throw new Error(`Failed to fetch programs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get AI programs by client
 */
export async function getAIProgramsByClient(clientProfileId: string): Promise<AIProgram[]> {
  const { data, error } = await supabase
    .from('ai_programs')
    .select('*')
    .eq('client_profile_id', clientProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client programs:', error);
    throw new Error(`Failed to fetch programs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get AI program templates (is_template = true)
 */
export async function getAIProgramTemplates(): Promise<AIProgram[]> {
  const { data, error } = await supabase
    .from('ai_programs')
    .select('*')
    .eq('is_template', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching AI templates:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  return data || [];
}

/**
 * Update AI program
 */
export async function updateAIProgram(
  id: string,
  updates: UpdateAIProgramInput
): Promise<{ data: AIProgram | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating AI program:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception updating AI program:', err);
    return { data: null, error: err };
  }
}

/**
 * Update program status
 */
export async function updateProgramStatus(
  id: string,
  status: ProgramStatus
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('ai_programs')
      .update({ status })
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Delete AI program (cascade deletes workouts, exercises)
 */
export async function deleteAIProgram(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('ai_programs')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

// ========================================
// AI WORKOUTS (Individual Sessions)
// ========================================

/**
 * Create AI workout
 */
export async function createAIWorkout(
  input: CreateAIWorkoutInput
): Promise<{ data: AIWorkout | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_workouts')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating AI workout:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating AI workout:', err);
    return { data: null, error: err };
  }
}

/**
 * Create multiple AI workouts (batch)
 * Uses upsert to handle duplicates (idempotent for retries/regeneration)
 */
export async function createAIWorkouts(
  inputs: CreateAIWorkoutInput[]
): Promise<{ data: AIWorkout[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_workouts')
      .upsert(inputs, {
        onConflict: 'program_id,week_number,day_number',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error creating AI workouts:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating AI workouts:', err);
    return { data: null, error: err };
  }
}

/**
 * Get AI workout by ID
 */
export async function getAIWorkoutById(id: string): Promise<AIWorkout | null> {
  const { data, error } = await supabase
    .from('ai_workouts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching AI workout:', error);
    return null;
  }

  return data;
}

/**
 * Get all workouts for a program
 */
export async function getAIWorkoutsByProgram(programId: string): Promise<AIWorkout[]> {
  const { data, error } = await supabase
    .from('ai_workouts')
    .select('*')
    .eq('program_id', programId)
    .order('week_number', { ascending: true })
    .order('day_number', { ascending: true });

  if (error) {
    console.error('Error fetching program workouts:', error);
    throw new Error(`Failed to fetch workouts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get workouts for specific week
 */
export async function getAIWorkoutsByWeek(
  programId: string,
  weekNumber: number
): Promise<AIWorkout[]> {
  const { data, error } = await supabase
    .from('ai_workouts')
    .select('*')
    .eq('program_id', programId)
    .eq('week_number', weekNumber)
    .order('day_number', { ascending: true });

  if (error) {
    console.error('Error fetching week workouts:', error);
    throw new Error(`Failed to fetch workouts: ${error.message}`);
  }

  return data || [];
}

/**
 * Delete all workouts for a program (exercises cascade delete)
 * Used for cleanup before regenerating workouts
 */
export async function deleteAIWorkoutsByProgram(
  programId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('ai_workouts')
      .delete()
      .eq('program_id', programId);

    if (error) {
      console.error('Error deleting AI workouts:', error);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception deleting AI workouts:', err);
    return { success: false, error: err };
  }
}

// ========================================
// AI WORKOUT EXERCISES (Prescriptions)
// ========================================

/**
 * Create AI workout exercise
 */
export async function createAIWorkoutExercise(
  input: CreateAIWorkoutExerciseInput
): Promise<{ data: AIWorkoutExercise | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_workout_exercises')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating AI workout exercise:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating AI workout exercise:', err);
    return { data: null, error: err };
  }
}

/**
 * Create multiple AI workout exercises (batch)
 */
export async function createAIWorkoutExercises(
  inputs: CreateAIWorkoutExerciseInput[]
): Promise<{ data: AIWorkoutExercise[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_workout_exercises')
      .insert(inputs)
      .select();

    if (error) {
      console.error('Error creating AI workout exercises:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating AI workout exercises:', err);
    return { data: null, error: err };
  }
}

/**
 * Get exercises for a workout
 */
export async function getAIWorkoutExercisesByWorkout(workoutId: string): Promise<AIWorkoutExercise[]> {
  const { data, error } = await supabase
    .from('ai_workout_exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('exercise_order', { ascending: true });

  if (error) {
    console.error('Error fetching workout exercises:', error);
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }

  return data || [];
}

// ========================================
// AI NUTRITION PLANS
// ========================================

/**
 * Create AI nutrition plan
 */
export async function createAINutritionPlan(
  input: Omit<AINutritionPlan, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: AINutritionPlan | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_nutrition_plans')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating AI nutrition plan:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating AI nutrition plan:', err);
    return { data: null, error: err };
  }
}

/**
 * Get nutrition plan by program
 */
export async function getAINutritionPlanByProgram(programId: string): Promise<AINutritionPlan | null> {
  const { data, error } = await supabase
    .from('ai_nutrition_plans')
    .select('*')
    .eq('program_id', programId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching nutrition plan:', error);
    return null;
  }

  return data;
}

// ========================================
// AI GENERATION LOGGING
// ========================================

/**
 * Log AI generation
 */
export async function logAIGeneration(
  input: Omit<AIGeneration, 'id' | 'created_at'>
): Promise<{ data: AIGeneration | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_generations')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error logging AI generation:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception logging AI generation:', err);
    return { data: null, error: err };
  }
}

/**
 * Get AI generations for an entity
 */
export async function getAIGenerationsByEntity(
  entityId: string,
  entityType: string
): Promise<AIGeneration[]> {
  const { data, error } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('entity_id', entityId)
    .eq('entity_type', entityType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI generations:', error);
    throw new Error(`Failed to fetch generations: ${error.message}`);
  }

  return data || [];
}

// ========================================
// PROGRAM REVISIONS (Version History)
// ========================================

/**
 * Create program revision
 */
export async function createProgramRevision(
  input: Omit<AIProgramRevision, 'id' | 'created_at'>
): Promise<{ data: AIProgramRevision | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_program_revisions')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating program revision:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating program revision:', err);
    return { data: null, error: err };
  }
}

/**
 * Get all revisions for a program
 */
export async function getProgramRevisions(programId: string): Promise<AIProgramRevision[]> {
  const { data, error } = await supabase
    .from('ai_program_revisions')
    .select('*')
    .eq('program_id', programId)
    .order('revision_number', { ascending: false });

  if (error) {
    console.error('Error fetching program revisions:', error);
    throw new Error(`Failed to fetch revisions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get latest program revision
 */
export async function getLatestProgramRevision(programId: string): Promise<AIProgramRevision | null> {
  const { data, error } = await supabase
    .from('ai_program_revisions')
    .select('*')
    .eq('program_id', programId)
    .order('revision_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching latest revision:', error);
    return null;
  }

  return data;
}

// ========================================
// COMPLEX QUERIES
// ========================================

/**
 * Get complete program with all workouts and exercises
 */
export async function getCompleteProgramData(programId: string): Promise<{
  program: AIProgram | null;
  workouts: AIWorkout[];
  exercises: AIWorkoutExercise[];
  nutrition: AINutritionPlan | null;
}> {
  const program = await getAIProgramById(programId);
  if (!program) {
    return { program: null, workouts: [], exercises: [], nutrition: null };
  }

  const workouts = await getAIWorkoutsByProgram(programId);

  // Get all exercises for all workouts
  const exercisesPromises = workouts.map((w) => getAIWorkoutExercisesByWorkout(w.id));
  const exercisesArrays = await Promise.all(exercisesPromises);
  const exercises = exercisesArrays.flat();

  const nutrition = await getAINutritionPlanByProgram(programId);

  return { program, workouts, exercises, nutrition };
}

/**
 * Get program statistics
 */
export async function getProgramStats(programId: string): Promise<{
  total_workouts: number;
  total_exercises: number;
  completed_workouts: number;
  completion_percentage: number;
}> {
  const workouts = await getAIWorkoutsByProgram(programId);
  const completedWorkouts = workouts.filter((w) => w.is_completed).length;

  const exercisesPromises = workouts.map((w) => getAIWorkoutExercisesByWorkout(w.id));
  const exercisesArrays = await Promise.all(exercisesPromises);
  const totalExercises = exercisesArrays.flat().length;

  return {
    total_workouts: workouts.length,
    total_exercises: totalExercises,
    completed_workouts: completedWorkouts,
    completion_percentage: workouts.length > 0 ? Math.round((completedWorkouts / workouts.length) * 100) : 0,
  };
}
