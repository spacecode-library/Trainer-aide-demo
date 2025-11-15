/**
 * AI Program Generation Worker
 *
 * POST /api/ai/generate-program/worker
 *
 * Background worker that performs the actual AI program generation.
 * This endpoint is called internally and can run beyond the 10s timeout.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/ai/anthropic-client';
import { generateWorkoutPrompt } from '@/lib/ai/prompts/workout-generator-prompt';
import { filterExercisesForClient } from '@/lib/ai/utils/exercise-filter';
import {
  createAIWorkouts,
  createAIWorkoutExercises,
  createAINutritionPlan,
  logAIGeneration,
  createProgramRevision,
  getCompleteProgramData,
  updateAIProgram,
} from '@/lib/services/ai-program-service';
import { getClientProfileById } from '@/lib/services/client-profile-service';
import { extractWorkoutConstraints, GoalType, ExperienceLevel } from '@/lib/types/client-profile';
import type { GenerateProgramRequest, SessionType } from '@/lib/types/ai-program';

/**
 * Worker Request (includes program_id and generation params)
 */
interface WorkerRequest {
  program_id: string;
  client_profile_id?: string;
  trainer_id: string;
  total_weeks: number;
  sessions_per_week: number;
  session_duration_minutes: number;
  include_nutrition?: boolean;
  primary_goal?: string;
  experience_level?: string;
  available_equipment?: string[];
  injuries?: Array<{ body_part: string; restrictions: string[] }>;
  exercise_aversions?: string[];
}

/**
 * AI Response Structure
 */
interface AIGeneratedProgram {
  program_name: string;
  description: string;
  total_weeks: number;
  sessions_per_week: number;
  ai_rationale: string;
  movement_balance_summary: Record<string, number>;
  weekly_structure: Array<{
    week_number: number;
    workouts: Array<{
      day_number: number;
      workout_name: string;
      workout_focus: string;
      session_type: string;
      movement_patterns_covered: string[];
      planes_of_motion_covered: string[];
      ai_rationale: string;
      exercises: Array<{
        exercise_id: string;
        exercise_order: number;
        block_label?: string;
        sets: number;
        reps_target: string;
        target_rpe: number;
        tempo: string;
        rest_seconds: number;
        coaching_cues: string[];
        modifications?: string[];
      }>;
    }>;
  }>;
  error?: string;
  suggestions?: string[];
}

// Configure maximum duration for this API route
// Vercel Pro: max 60s, Vercel Enterprise: max 300s
// Railway/other platforms: Configure via platform settings
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body!: WorkerRequest;  // Non-null assertion - will be assigned in try block

  try {
    body = await request.json();

    console.log(`🤖 Starting background generation for program ${body.program_id}...`);

    // Build generation request
    let generationRequest: GenerateProgramRequest;

    if (body.client_profile_id) {
      const clientProfile = await getClientProfileById(body.client_profile_id);
      if (!clientProfile) {
        await updateAIProgram(body.program_id, {
          generation_status: 'failed',
          generation_error: 'Client profile not found',
        });
        return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
      }

      const constraints = extractWorkoutConstraints(clientProfile);
      generationRequest = {
        client_profile_id: body.client_profile_id,
        trainer_id: body.trainer_id,
        total_weeks: body.total_weeks,
        sessions_per_week: body.sessions_per_week,
        session_duration_minutes: body.session_duration_minutes,
        primary_goal: constraints.primaryGoal,
        secondary_goals: constraints.secondaryGoals,
        experience_level: constraints.experienceLevel,
        available_equipment: constraints.availableEquipment,
        training_location: constraints.trainingLocation,
        injuries: constraints.injuries,
        physical_limitations: constraints.physicalLimitations,
        exercise_aversions: constraints.exerciseAversions,
        preferred_exercise_types: constraints.preferredExerciseTypes,
        preferred_movement_patterns: constraints.preferredMovementPatterns,
      };
    } else {
      generationRequest = {
        trainer_id: body.trainer_id,
        total_weeks: body.total_weeks,
        sessions_per_week: body.sessions_per_week,
        session_duration_minutes: body.session_duration_minutes,
        primary_goal: body.primary_goal as GoalType,
        experience_level: body.experience_level as ExperienceLevel,
        available_equipment: body.available_equipment || [],
        injuries: body.injuries,
        exercise_aversions: body.exercise_aversions,
        training_location: 'home',
      };
    }

    // Step 1: Filter exercises
    console.log('📋 Filtering exercises...');

    // Calculate total steps for progress tracking
    const totalStepsEstimate = 2 + (body.total_weeks * 2) + 3; // Filter + Prompts + (Before+After each week) + Validate + Save + Complete

    await updateAIProgram(body.program_id, {
      progress_message: `Filtering exercises from library...`,
      current_step: 1,
      total_steps: totalStepsEstimate,
      progress_percentage: 5,
    });

    const { exercises: filteredExercises, stats } = await filterExercisesForClient(generationRequest);

    if (filteredExercises.length < body.sessions_per_week * 4) {
      await updateAIProgram(body.program_id, {
        generation_status: 'failed',
        generation_error: `Insufficient exercises: only ${filteredExercises.length} available (need at least ${body.sessions_per_week * 4})`,
      });
      return NextResponse.json({ error: 'Insufficient exercises' }, { status: 400 });
    }

    console.log(`✅ ${filteredExercises.length} exercises available`);

    await updateAIProgram(body.program_id, {
      progress_message: `✅ Filtered to ${filteredExercises.length} exercises`,
      current_step: 2,
      progress_percentage: 10,
    });

    // Step 2: Generate prompts
    console.log('📝 Generating prompts...');
    const { system: systemPrompt, user: userPrompt } = generateWorkoutPrompt(
      generationRequest,
      filteredExercises
    );

    // Step 3: Generate program in chunks to avoid token limits
    console.log('🧠 Generating program in chunks to avoid token limits...');

    const totalWeeks = body.total_weeks;

    // Dynamic chunk sizing based on program length for optimal performance:
    // - Small programs (1-3 weeks): Single chunk is faster despite longer processing time
    // - Medium programs (4-8 weeks): 2-week chunks balance speed and quality
    // - Large programs (9+ weeks): 2-week chunks to stay within token/timeout limits
    const CHUNK_SIZE = totalWeeks <= 3 ? totalWeeks : 2;
    const chunks = Math.ceil(totalWeeks / CHUNK_SIZE);

    console.log(`📊 Will generate ${chunks} chunks (${CHUNK_SIZE} week${CHUNK_SIZE > 1 ? 's' : ''} per chunk)`);

    let combinedProgram: AIGeneratedProgram | null = null;
    let totalTokensUsed = 0;

    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
      const startWeek = chunkIndex * CHUNK_SIZE + 1;
      const endWeek = Math.min((chunkIndex + 1) * CHUNK_SIZE, totalWeeks);
      const weeksInChunk = endWeek - startWeek + 1;

      console.log(`\n🔄 Generating chunk ${chunkIndex + 1}/${chunks}: Weeks ${startWeek}-${endWeek}...`);

      // Update progress: Starting chunk generation
      const currentStep = 2 + (chunkIndex * 2) + 1;
      const progressPercentage = Math.round(10 + ((chunkIndex / chunks) * 75)); // 10% to 85%

      await updateAIProgram(body.program_id, {
        progress_message: `Generating week ${startWeek}${endWeek > startWeek ? `-${endWeek}` : ''} (chunk ${chunkIndex + 1}/${chunks})...`,
        current_step: currentStep,
        total_steps: totalStepsEstimate,
        progress_percentage: progressPercentage,
      });

      // Modify the user prompt to request specific weeks with progressive context
      // Use single value for single-week chunks to avoid AI generating duplicates
      const weeksSpec = startWeek === endWeek
        ? `${startWeek}` // Single week: "generate_weeks": 1
        : `[${startWeek}, ${endWeek}]`; // Range: "generate_weeks": [1, 3]

      let chunkUserPrompt = userPrompt.replace(
        `"total_weeks": ${totalWeeks}`,
        `"total_weeks": ${totalWeeks}, "generate_weeks": ${weeksSpec}`
      );

      // For chunks after the first, provide context from previous weeks to ensure progression
      if (chunkIndex > 0 && combinedProgram?.weekly_structure) {
        // Get the last 1-2 weeks as context (to show progression pattern)
        const contextWeeks = combinedProgram.weekly_structure.slice(-Math.min(2, combinedProgram.weekly_structure.length));
        const contextSummary = contextWeeks.map(week => ({
          week_number: week.week_number,
          workouts: week.workouts.map(w => ({
            workout_name: w.workout_name,
            workout_focus: w.workout_focus,
            exercise_count: w.exercises?.length || 0,
            sample_exercises: w.exercises?.slice(0, 3).map(ex => ex.exercise_id) || []
          }))
        }));

        chunkUserPrompt += `\n\nPREVIOUS WEEKS CONTEXT:
${JSON.stringify(contextSummary, null, 2)}

IMPORTANT: Generate weeks ${startWeek} through ${endWeek} as the NEXT progression phase after the weeks above.
- Progress from previous weeks (increase intensity, volume, or complexity)
- Vary exercises to avoid repetition - do NOT use the exact same exercises in the same order
- Maintain movement pattern balance but introduce variety
- Ensure clear progression from previous phase`;
      } else {
        chunkUserPrompt += `\n\nIMPORTANT: Generate weeks ${startWeek} through ${endWeek} of the ${totalWeeks}-week program as the FOUNDATION phase. Include ${body.sessions_per_week} sessions per week.`;
      }

      // Estimate tokens for this chunk
      const estimatedTokens = 5000 + (weeksInChunk * body.sessions_per_week * 6 * 180);
      const maxTokens = Math.min(16384, Math.max(10000, estimatedTokens));

      console.log(`   Token allocation: ${maxTokens} (estimated: ${estimatedTokens})`);

      const { data: chunkProgram, error: chunkError, raw: chunkRaw } = await callClaudeJSON<AIGeneratedProgram>({
        systemPrompt,
        userPrompt: chunkUserPrompt,
        model: 'claude-sonnet-4-5-20250929',
        maxTokens,
        temperature: 0.7,
      });

      if (chunkError || !chunkProgram) {
        const errorMsg = chunkError?.message || 'Failed to generate chunk';
        await updateAIProgram(body.program_id, {
          generation_status: 'failed',
          generation_error: `Chunk ${chunkIndex + 1} failed: ${errorMsg}`,
        });
        return NextResponse.json({ error: errorMsg }, { status: 500 });
      }

      totalTokensUsed += (chunkRaw?.usage.output_tokens || 0);
      console.log(`   ✅ Chunk generated: ${chunkRaw?.usage.output_tokens || 0} tokens`);

      // Log what weeks this chunk returned
      const chunkWeeks = chunkProgram.weekly_structure?.map(w => w.week_number) || [];
      console.log(`   📋 Chunk returned ${chunkWeeks.length} weeks: [${chunkWeeks.join(', ')}]`);

      // Combine chunks
      if (!combinedProgram) {
        // First chunk - use as base
        combinedProgram = chunkProgram;
      } else {
        // Append workouts from this chunk to the combined program
        if (chunkProgram.weekly_structure) {
          combinedProgram.weekly_structure.push(...chunkProgram.weekly_structure);
        }
      }

      // Update progress: Chunk completed
      const completedStep = 2 + (chunkIndex * 2) + 2;
      const completedPercentage = Math.round(10 + (((chunkIndex + 1) / chunks) * 75)); // 10% to 85%

      await updateAIProgram(body.program_id, {
        progress_message: `✅ Week ${startWeek}${endWeek > startWeek ? `-${endWeek}` : ''} complete`,
        current_step: completedStep,
        total_steps: totalStepsEstimate,
        progress_percentage: completedPercentage,
      });
    }

    if (!combinedProgram) {
      await updateAIProgram(body.program_id, {
        generation_status: 'failed',
        generation_error: 'No program data generated',
      });
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }

    console.log(`\n✅ All chunks combined: ${totalTokensUsed} total tokens`);

    const aiProgram = combinedProgram;
    const raw = { usage: { input_tokens: 0, output_tokens: totalTokensUsed }, model: 'claude-sonnet-4-5-20250929' };

    if (!aiProgram || aiProgram.error) {
      const errorMsg = aiProgram?.error || 'Unknown AI error';
      await updateAIProgram(body.program_id, {
        generation_status: 'failed',
        generation_error: errorMsg,
      });
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    console.log('✅ AI generation successful (chunked)');

    // Update progress: Validating
    await updateAIProgram(body.program_id, {
      progress_message: 'Validating program structure...',
      current_step: totalStepsEstimate - 2,
      progress_percentage: 87,
    });

    // Step 4: Validate output
    const validation = validateAIProgram(aiProgram, filteredExercises);
    if (!validation.valid) {
      await updateAIProgram(body.program_id, {
        generation_status: 'failed',
        generation_error: `Validation failed: ${validation.errors.join(', ')}`,
      });
      return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }

    console.log('✅ Validation passed');

    // Step 5: Update program with AI data
    console.log('💾 Updating program...');
    await updateAIProgram(body.program_id, {
      description: aiProgram.description,
      ai_rationale: aiProgram.ai_rationale,
      movement_balance_summary: aiProgram.movement_balance_summary,
      ai_model: raw?.model || 'claude-sonnet-4-5-20250929',
    });

    // Step 5.5: Deduplicate weeks (defensive against AI returning duplicates)
    const originalWeekCount = aiProgram.weekly_structure.length;
    const uniqueWeeksMap = new Map();

    for (const week of aiProgram.weekly_structure) {
      if (!uniqueWeeksMap.has(week.week_number)) {
        uniqueWeeksMap.set(week.week_number, week);
      }
    }

    aiProgram.weekly_structure = Array.from(uniqueWeeksMap.values()).sort((a, b) => a.week_number - b.week_number);

    if (originalWeekCount !== aiProgram.weekly_structure.length) {
      console.warn(`⚠️  Removed ${originalWeekCount - aiProgram.weekly_structure.length} duplicate weeks`);
    }

    console.log(`📊 Final structure: ${aiProgram.weekly_structure.length} unique weeks (${aiProgram.weekly_structure.map(w => w.week_number).join(', ')})`);

    // Step 6: Create workouts (using upsert for idempotent operation)
    const workoutsToCreate = aiProgram.weekly_structure.flatMap((week) =>
      week.workouts.map((workout, index) => ({
        program_id: body.program_id,
        week_number: week.week_number,
        day_number: workout.day_number,
        session_order: index + 1,
        workout_name: workout.workout_name,
        workout_focus: workout.workout_focus,
        session_type: workout.session_type as SessionType,
        scheduled_date: null,
        planned_duration_minutes: body.session_duration_minutes,
        movement_patterns_covered: workout.movement_patterns_covered,
        planes_of_motion_covered: workout.planes_of_motion_covered,
        primary_muscle_groups: [],
        ai_rationale: workout.ai_rationale,
        exercise_selection_criteria: null,
        overall_rpe: null,
        trainer_notes: null,
        client_feedback: null,
      }))
    );

    // Log workout creation details
    const workoutsByWeek = workoutsToCreate.reduce((acc, w) => {
      acc[w.week_number] = (acc[w.week_number] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log(`📝 Creating ${workoutsToCreate.length} workouts:`,
      Object.entries(workoutsByWeek).map(([week, count]) => `Week ${week}: ${count}`).join(', '));

    const { data: savedWorkouts, error: workoutsError } = await createAIWorkouts(workoutsToCreate);

    if (workoutsError || !savedWorkouts) {
      await updateAIProgram(body.program_id, {
        generation_status: 'failed',
        generation_error: `Failed to create workouts: ${workoutsError?.message}`,
      });
      return NextResponse.json({ error: 'Failed to save workouts' }, { status: 500 });
    }

    console.log(`✅ ${savedWorkouts.length} workouts saved`);

    // Update progress: Saving workouts
    await updateAIProgram(body.program_id, {
      progress_message: `Saving ${savedWorkouts.length} workouts and exercises...`,
      current_step: totalStepsEstimate - 1,
      progress_percentage: 93,
    });

    // Step 7: Create exercises
    let totalExercises = 0;
    for (const week of aiProgram.weekly_structure) {
      for (const workout of week.workouts) {
        const savedWorkout = savedWorkouts.find(
          (w) => w.week_number === week.week_number && w.day_number === workout.day_number
        );

        if (!savedWorkout) continue;

        const exercisesToCreate = workout.exercises.map((ex) => ({
          workout_id: savedWorkout.id,
          exercise_id: ex.exercise_id,
          exercise_order: ex.exercise_order,
          block_label: ex.block_label || null,
          sets: ex.sets,
          reps_min: null,
          reps_max: null,
          reps_target: ex.reps_target,
          target_load_kg: null,
          target_load_percentage: null,
          target_rpe: ex.target_rpe,
          target_rir: null,
          tempo: ex.tempo,
          rest_seconds: ex.rest_seconds,
          target_duration_seconds: null,
          target_distance_meters: null,
          is_unilateral: false,
          is_bodyweight: false,
          is_timed: false,
          coaching_cues: ex.coaching_cues,
          common_mistakes: [],
          modifications: ex.modifications || [],
          actual_sets: null,
          actual_reps: null,
          actual_load_kg: null,
          actual_rpe: null,
          actual_duration_seconds: null,
          actual_distance_meters: null,
          performance_notes: null,
          skip_reason: null,
        }));

        const { data: savedExercises } = await createAIWorkoutExercises(exercisesToCreate);
        if (savedExercises) totalExercises += savedExercises.length;
      }
    }

    console.log(`✅ ${totalExercises} exercises created`);

    // Step 8: Nutrition plan (if requested)
    if (body.include_nutrition && body.client_profile_id) {
      await createAINutritionPlan({
        program_id: body.program_id,
        daily_calories: null,
        protein_grams: null,
        carbs_grams: null,
        fats_grams: null,
        fiber_grams: null,
        calculation_method: null,
        tdee_estimated: null,
        calorie_adjustment_percentage: null,
        meals_per_day: null,
        meal_timing_notes: null,
        pre_workout_nutrition: null,
        post_workout_nutrition: null,
        meal_templates: null,
        daily_water_liters: null,
        supplement_recommendations: [],
        dietary_restrictions: [],
        dietary_preferences: [],
        ai_rationale: 'Nutrition plan to be customized',
        generated_at: null,
        disclaimer: 'AI-generated - review with a nutritionist before implementation',
      });
    }

    // Step 9: Log generation
    await logAIGeneration({
      entity_id: body.program_id,
      entity_type: 'ai_program',
      status: 'completed',
      ai_model: raw?.model || 'claude-sonnet-4-5-20250929',
      generation_type: 'program',
      ai_provider: 'anthropic',
      prompt_version: 'v1.0.0',
      input_tokens: raw?.usage.input_tokens || 0,
      output_tokens: raw?.usage.output_tokens || 0,
      estimated_cost_usd: raw ? estimateCost(raw) : 0,
      latency_ms: Date.now() - startTime,
      retry_count: 0,
    });

    // Step 10: Create revision
    const { program, workouts, exercises } = await getCompleteProgramData(body.program_id);
    await createProgramRevision({
      program_id: body.program_id,
      revision_number: 1,
      program_snapshot: {
        program: program!,
        workouts: workouts || [],
        exercises: exercises || [],
      },
      change_description: 'Initial AI-generated program',
      created_by: body.trainer_id,
    });

    // Step 11: Mark as completed
    await updateAIProgram(body.program_id, {
      generation_status: 'completed',
      generation_error: null,
      progress_message: '✅ Program generation complete!',
      current_step: totalStepsEstimate,
      progress_percentage: 100,
    });

    console.log(`✅ Generation complete! Time: ${Date.now() - startTime}ms`);

    return NextResponse.json({ success: true, program_id: body.program_id });

  } catch (error: any) {
    console.error('❌ Worker error:', error);

    if (body?.program_id) {
      await updateAIProgram(body.program_id, {
        generation_status: 'failed',
        generation_error: error.message || 'Internal server error',
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function validateAIProgram(
  program: AIGeneratedProgram,
  availableExercises: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!program.program_name) errors.push('Missing program_name');
  if (!program.total_weeks) errors.push('Missing total_weeks');
  if (!program.weekly_structure?.length) errors.push('Missing weekly_structure');

  const exerciseIds = new Set(availableExercises.map(ex => ex.id));

  for (const week of program.weekly_structure || []) {
    if (!week.workouts?.length) {
      errors.push(`Week ${week.week_number} has no workouts`);
      continue;
    }

    for (const workout of week.workouts) {
      if (!workout.exercises?.length) {
        errors.push(`Week ${week.week_number}, day ${workout.day_number} has no exercises`);
        continue;
      }

      for (const exercise of workout.exercises) {
        if (!exerciseIds.has(exercise.exercise_id)) {
          errors.push(`Invalid exercise_id: ${exercise.exercise_id}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function estimateCost(response: any): number {
  const costs = { input: 3.0, output: 15.0 };
  const inputCost = (response.usage.input_tokens / 1_000_000) * costs.input;
  const outputCost = (response.usage.output_tokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}
