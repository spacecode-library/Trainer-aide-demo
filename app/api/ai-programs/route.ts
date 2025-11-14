import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/ai-programs
 * Fetch all AI programs for the current trainer
 */
export async function GET(request: NextRequest) {
  try {
    const { data: programs, error } = await supabaseServer
      .from('ai_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI programs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch programs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ programs: programs || [] });
  } catch (error) {
    console.error('Error fetching AI programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
