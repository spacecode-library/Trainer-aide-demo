/**
 * AI Workout Program Generation API
 *
 * POST /api/ai/generate-program
 *
 * Generates a complete periodized workout program using Claude AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/ai/anthropic-client';
import { generateWorkoutPrompt } from '@/lib/ai/prompts/workout-generator-prompt';
import { filterExercisesForClient } from '@/lib/ai/utils/exercise-filter';
import {
  createAIProgram,
  createAIWorkouts,
  createAIWorkoutExercises,
  createAINutritionPlan,
  logAIGeneration,
  createProgramRevision,
} from '@/lib/services/ai-program-service';
import { getClientProfileById } from '@/lib/services/client-profile-service';
import { extractWorkoutConstraints } from '@/lib/types/client-profile';
import type { GenerateProgramRequest } from '@/lib/types/ai-program';

/**
 * AI Program Generation Request
 */
interface GenerateProgramAPIRequest {
  client_profile_id?: string;
  trainer_id: string;
  program_name?: string;
  total_weeks: number;
  sessions_per_week: number;
  session_duration_minutes: number;
  include_nutrition?: boolean;

  // Optional overrides (if no client profile provided)
  primary_goal?: string;
  experience_level?: string;
  available_equipment?: string[];
  injuries?: Array<{ body_part: string; restrictions: string[] }>;
  exercise_aversions?: string[];
}

/**
 * AI Response Structure (matches prompt output)
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: GenerateProgramAPIRequest = await request.json();

    // Validate required fields
    if (!body.trainer_id) {
      return NextResponse.json(
        { error: 'trainer_id is required' },
        { status: 400 }
      );
    }

    if (!body.total_weeks || body.total_weeks < 1 || body.total_weeks > 52) {
      return NextResponse.json(
        { error: 'total_weeks must be between 1 and 52' },
        { status: 400 }
      );
    }

    if (!body.sessions_per_week || body.sessions_per_week < 1 || body.sessions_per_week > 7) {
      return NextResponse.json(
        { error: 'sessions_per_week must be between 1 and 7' },
        { status: 400 }
      );
    }

    // Build generation request
    let generationRequest: GenerateProgramRequest;

    if (body.client_profile_id) {
      // Fetch client profile from database
      const clientProfile = await getClientProfileById(body.client_profile_id);
      if (!clientProfile) {
        return NextResponse.json(
          { error: 'Client profile not found' },
          { status: 404 }
        );
      }

      // Extract workout constraints from profile
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
      // Use provided parameters (manual mode)
      if (!body.primary_goal || !body.experience_level || !body.available_equipment) {
        return NextResponse.json(
          { error: 'If client_profile_id not provided, must include primary_goal, experience_level, and available_equipment' },
          { status: 400 }
        );
      }

      generationRequest = {
        trainer_id: body.trainer_id,
        total_weeks: body.total_weeks,
        sessions_per_week: body.sessions_per_week,
        session_duration_minutes: body.session_duration_minutes,
        primary_goal: body.primary_goal,
        experience_level: body.experience_level,
        available_equipment: body.available_equipment,
        injuries: body.injuries,
        exercise_aversions: body.exercise_aversions,
        training_location: 'home', // default
      };
    }

    console.log('🤖 Starting AI program generation...');
    console.log(`   Client: ${body.client_profile_id || 'Manual'}`);
    console.log(`   Duration: ${body.total_weeks} weeks x ${body.sessions_per_week} sessions/week`);
    console.log(`   Goal: ${generationRequest.primary_goal}`);
    console.log(`   Experience: ${generationRequest.experience_level}`);

    // Step 1: Filter exercises based on constraints
    console.log('\n📋 Filtering exercises...');
    const { exercises: filteredExercises, stats } = await filterExercisesForClient(generationRequest);

    if (filteredExercises.length < body.sessions_per_week * 4) {
      return NextResponse.json(
        {
          error: 'Insufficient exercises available',
          details: `Only ${filteredExercises.length} exercises match constraints. Need at least ${body.sessions_per_week * 4}.`,
          suggestions: [
            'Add more equipment options',
            'Reduce injury restrictions if safe',
            'Consider increasing experience level if appropriate'
          ],
          stats
        },
        { status: 400 }
      );
    }

    console.log(`✅ ${filteredExercises.length} exercises available after filtering`);

    // Step 2: Generate AI prompts
    console.log('\n📝 Generating AI prompts...');
    const { system: systemPrompt, user: userPrompt } = generateWorkoutPrompt(
      generationRequest,
      filteredExercises
    );

    // Step 3: Call Claude API
    console.log('\n🧠 Calling Claude API...');
    const { data: aiProgram, error: aiError, raw } = await callClaudeJSON<AIGeneratedProgram>({
      systemPrompt,
      userPrompt,
      model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 - Latest and smartest
      maxTokens: 8192, // Large programs need more tokens
      temperature: 0.7, // Some creativity, but not too much
    });

    if (aiError || !aiProgram) {
      console.error('❌ Claude API error:', aiError);
      return NextResponse.json(
        { error: 'AI generation failed', details: aiError?.message },
        { status: 500 }
      );
    }

    // Check if AI returned an error response
    if (aiProgram.error) {
      console.error('❌ AI returned error:', aiProgram.error);
      return NextResponse.json(
        {
          error: 'AI could not generate program',
          details: aiProgram.error,
          suggestions: aiProgram.suggestions || []
        },
        { status: 400 }
      );
    }

    console.log('✅ AI generation successful');
    console.log(`   Program: ${aiProgram.program_name}`);
    console.log(`   Total workouts: ${aiProgram.weekly_structure.reduce((sum, week) => sum + week.workouts.length, 0)}`);

    // Step 4: Validate AI output
    console.log('\n✅ Validating AI output...');
    const validation = validateAIProgram(aiProgram, filteredExercises);
    if (!validation.valid) {
      console.error('❌ AI output validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Generated program failed validation',
          details: validation.errors
        },
        { status: 500 }
      );
    }

    // Step 5: Save program to database
    console.log('\n💾 Saving program to database...');

    // Create master program record
    const { data: savedProgram, error: programError } = await createAIProgram({
      client_profile_id: body.client_profile_id || null,
      trainer_id: body.trainer_id,
      created_by: body.trainer_id,
      program_name: body.program_name || aiProgram.program_name,
      description: aiProgram.description,
      total_weeks: aiProgram.total_weeks,
      sessions_per_week: aiProgram.sessions_per_week,
      session_duration_minutes: body.session_duration_minutes,
      primary_goal: generationRequest.primary_goal,
      experience_level: generationRequest.experience_level,
      ai_model: raw?.model || 'claude-sonnet-4-5-20250929',
      ai_rationale: aiProgram.ai_rationale,
      movement_balance_summary: aiProgram.movement_balance_summary,
      status: 'draft',
    });

    if (programError || !savedProgram) {
      console.error('❌ Failed to save program:', programError);
      return NextResponse.json(
        { error: 'Failed to save program', details: programError?.message },
        { status: 500 }
      );
    }

    console.log(`✅ Program saved: ${savedProgram.id}`);

    // Create workouts
    const workoutsToCreate = aiProgram.weekly_structure.flatMap((week) =>
      week.workouts.map((workout) => ({
        program_id: savedProgram.id,
        week_number: week.week_number,
        day_number: workout.day_number,
        workout_name: workout.workout_name,
        workout_focus: workout.workout_focus,
        session_type: workout.session_type,
        movement_patterns_covered: workout.movement_patterns_covered,
        planes_of_motion_covered: workout.planes_of_motion_covered,
        ai_rationale: workout.ai_rationale,
      }))
    );

    const { data: savedWorkouts, error: workoutsError } = await createAIWorkouts(workoutsToCreate);

    if (workoutsError || !savedWorkouts) {
      console.error('❌ Failed to save workouts:', workoutsError);
      return NextResponse.json(
        { error: 'Failed to save workouts', details: workoutsError?.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${savedWorkouts.length} workouts saved`);

    // Create workout exercises
    let totalExercises = 0;
    for (let weekIdx = 0; weekIdx < aiProgram.weekly_structure.length; weekIdx++) {
      const week = aiProgram.weekly_structure[weekIdx];

      for (let workoutIdx = 0; workoutIdx < week.workouts.length; workoutIdx++) {
        const workout = week.workouts[workoutIdx];

        // Find matching saved workout
        const savedWorkout = savedWorkouts.find(
          (w) => w.week_number === week.week_number && w.day_number === workout.day_number
        );

        if (!savedWorkout) {
          console.error(`❌ Could not find saved workout for week ${week.week_number}, day ${workout.day_number}`);
          continue;
        }

        // Create exercises for this workout
        const exercisesToCreate = workout.exercises.map((ex) => ({
          workout_id: savedWorkout.id,
          exercise_id: ex.exercise_id,
          exercise_order: ex.exercise_order,
          block_label: ex.block_label || null,
          sets: ex.sets,
          reps_target: ex.reps_target,
          target_rpe: ex.target_rpe,
          tempo: ex.tempo,
          rest_seconds: ex.rest_seconds,
          coaching_cues: ex.coaching_cues,
          modifications: ex.modifications || [],
        }));

        const { data: savedExercises, error: exercisesError } = await createAIWorkoutExercises(exercisesToCreate);

        if (exercisesError || !savedExercises) {
          console.error(`❌ Failed to save exercises for workout ${savedWorkout.id}:`, exercisesError);
          continue;
        }

        totalExercises += savedExercises.length;
      }
    }

    console.log(`✅ ${totalExercises} exercises saved`);

    // Step 6: Create nutrition plan (if requested)
    if (body.include_nutrition && body.client_profile_id) {
      console.log('\n🍎 Creating nutrition plan...');

      // TODO: Generate nutrition plan with AI
      // For now, just create placeholder
      const { data: nutritionPlan, error: nutritionError } = await createAINutritionPlan({
        program_id: savedProgram.id,
        daily_calories: null,
        macros_json: {},
        meal_timing_recommendations: [],
        supplement_recommendations: [],
        hydration_guidelines: 'Drink at least 2-3 liters of water daily',
        ai_rationale: 'Nutrition plan to be customized based on client goals',
      });

      if (nutritionError) {
        console.warn('⚠️ Failed to create nutrition plan:', nutritionError);
      } else {
        console.log('✅ Nutrition plan created');
      }
    }

    // Step 7: Log AI generation
    const generationLog = {
      entity_id: savedProgram.id,
      entity_type: 'ai_program',
      model_name: raw?.model || 'claude-sonnet-4-5-20250929',
      prompt_version: 'v1.0.0',
      input_tokens: raw?.usage.input_tokens || 0,
      output_tokens: raw?.usage.output_tokens || 0,
      total_cost_usd: raw ? estimateCost(raw) : 0,
      latency_ms: Date.now() - startTime,
      success: true,
      metadata: {
        total_weeks: body.total_weeks,
        sessions_per_week: body.sessions_per_week,
        exercises_filtered: stats,
      },
    };

    await logAIGeneration(generationLog);

    // Step 8: Create initial program revision
    await createProgramRevision({
      program_id: savedProgram.id,
      revision_number: 1,
      program_snapshot: aiProgram,
      change_description: 'Initial AI-generated program',
      revised_by: body.trainer_id,
    });

    // Step 9: Return success response
    const totalLatency = Date.now() - startTime;

    console.log('\n✅ Program generation complete!');
    console.log(`   Total time: ${totalLatency}ms`);
    console.log(`   Cost: $${generationLog.total_cost_usd.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      program_id: savedProgram.id,
      program: savedProgram,
      workouts_count: savedWorkouts.length,
      exercises_count: totalExercises,
      generation_log: {
        tokens_used: generationLog.input_tokens + generationLog.output_tokens,
        input_tokens: generationLog.input_tokens,
        output_tokens: generationLog.output_tokens,
        cost_usd: generationLog.total_cost_usd,
        latency_ms: totalLatency,
      },
      filtering_stats: stats,
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Validate AI-generated program structure
 */
function validateAIProgram(
  program: AIGeneratedProgram,
  availableExercises: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!program.program_name) errors.push('Missing program_name');
  if (!program.total_weeks) errors.push('Missing total_weeks');
  if (!program.sessions_per_week) errors.push('Missing sessions_per_week');
  if (!program.weekly_structure || program.weekly_structure.length === 0) {
    errors.push('Missing or empty weekly_structure');
  }

  // Validate week numbering
  if (program.weekly_structure) {
    const expectedWeeks = program.total_weeks;
    if (program.weekly_structure.length !== expectedWeeks) {
      errors.push(`Expected ${expectedWeeks} weeks, got ${program.weekly_structure.length}`);
    }

    // Check week numbers are sequential
    for (let i = 0; i < program.weekly_structure.length; i++) {
      if (program.weekly_structure[i].week_number !== i + 1) {
        errors.push(`Week numbering incorrect at index ${i}`);
        break;
      }
    }

    // Validate workouts
    const exerciseIds = new Set(availableExercises.map(ex => ex.id));

    for (const week of program.weekly_structure) {
      if (!week.workouts || week.workouts.length === 0) {
        errors.push(`Week ${week.week_number} has no workouts`);
        continue;
      }

      for (const workout of week.workouts) {
        if (!workout.exercises || workout.exercises.length === 0) {
          errors.push(`Week ${week.week_number}, day ${workout.day_number} has no exercises`);
          continue;
        }

        // Validate exercise IDs
        for (const exercise of workout.exercises) {
          if (!exerciseIds.has(exercise.exercise_id)) {
            errors.push(`Invalid exercise_id: ${exercise.exercise_id} in week ${week.week_number}, day ${workout.day_number}`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate cost from Claude response
 */
function estimateCost(response: any): number {
  const costs = {
    input: 3.0,  // $3 per million input tokens
    output: 15.0,  // $15 per million output tokens
  };

  const inputCost = (response.usage.input_tokens / 1_000_000) * costs.input;
  const outputCost = (response.usage.output_tokens / 1_000_000) * costs.output;

  return inputCost + outputCost;
}
