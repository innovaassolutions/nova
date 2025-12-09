/**
 * Campaigns API Route
 *
 * GET /api/campaigns - Fetch all campaigns for the authenticated user's team
 * Story: 2.2 - Contact Creation Form
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch campaigns (currently no RLS filtering, returns all campaigns)
    // In production, you may want to filter by user's team/organization
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name')
      .order('name', { ascending: true });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaigns: campaigns || []
    });
  } catch (error) {
    console.error('Unexpected error in campaigns API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
