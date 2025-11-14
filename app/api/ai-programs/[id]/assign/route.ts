import { NextRequest, NextResponse } from 'next/server';
import { updateAIProgram } from '@/lib/services/ai-program-service';

/**
 * POST /api/ai-programs/[id]/assign
 * Assign a program to a client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { client_id } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    // Update program with client assignment and set to active
    const { data: updatedProgram, error } = await updateAIProgram(id, {
      client_profile_id: client_id,
      status: 'active',
    });

    if (error || !updatedProgram) {
      console.error('Error assigning program:', error);
      return NextResponse.json(
        { error: 'Failed to assign program', details: error?.message },
        { status: 500 }
      );
    }

    // TODO: Send email notification to client

    return NextResponse.json({
      program: updatedProgram,
      message: 'Program assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning program:', error);
    return NextResponse.json(
      { error: 'Failed to assign program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
