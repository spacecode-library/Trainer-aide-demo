/**
 * AI Workout Program Generation API
 *
 * POST /api/ai/generate-program
 *
 * Creates a program record and triggers background generation via worker endpoint.
 * Returns immediately with program_id to avoid timeout issues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIProgram } from '@/lib/services/ai-program-service';
import { getClientProfileById } from '@/lib/services/client-profile-service';
import { extractWorkoutConstraints, GoalType, ExperienceLevel } from '@/lib/types/client-profile';

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

export async function POST(request: NextRequest) {
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

    // Get generation parameters
    let programName: string;
    let primaryGoal: string;
    let experienceLevel: string;

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
      programName = body.program_name || `${clientProfile.first_name}'s Training Program`;
      primaryGoal = constraints.primaryGoal;
      experienceLevel = constraints.experienceLevel;
    } else {
      // Use provided parameters (manual mode)
      if (!body.primary_goal || !body.experience_level || !body.available_equipment) {
        return NextResponse.json(
          { error: 'If client_profile_id not provided, must include primary_goal, experience_level, and available_equipment' },
          { status: 400 }
        );
      }

      programName = body.program_name || 'AI-Generated Training Program';
      primaryGoal = body.primary_goal;
      experienceLevel = body.experience_level;
    }

    console.log('🤖 Creating program record...');
    console.log(`   Duration: ${body.total_weeks} weeks x ${body.sessions_per_week} sessions/week`);

    // Create master program record with "generating" status
    const { data: savedProgram, error: programError } = await createAIProgram({
      client_profile_id: body.client_profile_id || null,
      trainer_id: body.trainer_id,
      created_by: body.trainer_id,
      program_name: programName,
      description: 'Generating AI workout program...',
      total_weeks: body.total_weeks,
      sessions_per_week: body.sessions_per_week,
      session_duration_minutes: body.session_duration_minutes,
      primary_goal: primaryGoal,
      secondary_goals: [],
      experience_level: experienceLevel,
      ai_model: 'claude-sonnet-4-5-20250929',
      ai_rationale: null,
      movement_balance_summary: null,
      status: 'draft',
      is_template: false,
      is_published: false,
      allow_client_modifications: false,
      generation_status: 'generating', // Set to generating
      generation_error: null,
    });

    if (programError || !savedProgram) {
      console.error('❌ Failed to create program:', programError);
      return NextResponse.json(
        { error: 'Failed to create program record', details: programError?.message },
        { status: 500 }
      );
    }

    console.log(`✅ Program created: ${savedProgram.id}`);
    console.log('🚀 Triggering background worker...');

    // Trigger background worker (fire-and-forget)
    const workerUrl = new URL('/api/ai/generate-program/worker', request.url);

    fetch(workerUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        program_id: savedProgram.id,
        client_profile_id: body.client_profile_id,
        trainer_id: body.trainer_id,
        total_weeks: body.total_weeks,
        sessions_per_week: body.sessions_per_week,
        session_duration_minutes: body.session_duration_minutes,
        include_nutrition: body.include_nutrition,
        primary_goal: primaryGoal,
        experience_level: experienceLevel,
        available_equipment: body.available_equipment,
        injuries: body.injuries,
        exercise_aversions: body.exercise_aversions,
      }),
    }).catch((error) => {
      console.error('❌ Failed to trigger worker:', error);
      // Don't fail the request - worker will try anyway
    });

    // Return immediately with program ID
    return NextResponse.json({
      success: true,
      program_id: savedProgram.id,
      program: savedProgram,
      message: 'Program generation started. Poll /api/ai-programs/{id} to check status.',
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
