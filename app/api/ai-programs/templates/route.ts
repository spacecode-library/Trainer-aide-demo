import { NextResponse } from 'next/server';
import { getAIProgramTemplates } from '@/lib/services/ai-program-service';

/**
 * GET /api/ai-programs/templates
 * Fetch all AI programs marked as templates
 */
export async function GET() {
  try {
    const templates = await getAIProgramTemplates();

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching AI templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI templates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
