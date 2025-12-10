/**
 * Campaign API Route (Individual Campaign Operations)
 *
 * GET /api/campaigns/[id] - Get a specific campaign
 * PUT /api/campaigns/[id] - Update a campaign
 * DELETE /api/campaigns/[id] - Delete a campaign
 * Story: 3.5 - Campaign CRUD Interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface CampaignRequest {
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campaignError) {
      if (campaignError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching campaign:', campaignError);
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Unexpected error in campaign GET API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

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

    // Update campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .update({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        status: body.status,
        // updated_at handled by trigger
      })
      .eq('id', id)
      .select()
      .single();

    if (campaignError) {
      console.error('Error updating campaign:', campaignError);

      // Handle unique constraint violation
      if (campaignError.code === '23505') {
        return NextResponse.json(
          { error: 'A campaign with this name already exists' },
          { status: 409 }
        );
      }

      // Handle not found
      if (campaignError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in campaign PUT API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Delete campaign (campaign_contacts will cascade delete automatically)
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting campaign:', deleteError);

      // Handle not found
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in campaign DELETE API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
