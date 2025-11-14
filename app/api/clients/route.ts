import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/clients
 * Fetches all client profiles for the authenticated trainer
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get trainer_id from authenticated session
    // For now, fetch all clients (will add auth later)
    const { data: clients, error } = await supabaseServer
      .from('client_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients: clients || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
