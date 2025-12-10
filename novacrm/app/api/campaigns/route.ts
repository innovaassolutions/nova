/**
 * Campaigns API Route
 *
 * GET /api/campaigns - Fetch all campaigns with contact counts
 * POST /api/campaigns - Create a new campaign
 * Story: 3.5 - Campaign CRUD Interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface CampaignRequest {
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export async function GET() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch campaigns with contact counts
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        *,
        contact_count:campaign_contacts(count)
      `)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Transform the data to flatten contact_count
    const transformedCampaigns = campaigns?.map(campaign => ({
      ...campaign,
      contact_count: campaign.contact_count?.[0]?.count || 0
    })) || [];

    return NextResponse.json({
      campaigns: transformedCampaigns
    });
  } catch (error) {
    console.error('Unexpected error in campaigns API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body: CampaignRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.length > 100) {
      return NextResponse.json(
        { error: 'Campaign name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (body.description && body.description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Validate status
    if (body.status && !['Active', 'Inactive'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be either Active or Inactive' },
        { status: 400 }
      );
    }

    // Insert campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        status: body.status || 'Active',
        created_by: user.id,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);

      // Handle unique constraint violation
      if (campaignError.code === '23505') {
        return NextResponse.json(
          { error: 'A campaign with this name already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('Unexpected error in campaigns API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
