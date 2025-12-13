/**
 * Activities API Route
 *
 * POST /api/activities - Log a new activity
 * Story: 7.2 - Log Activity Modal with Activity Type Selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface ActivityRequest {
  contact_id?: string;
  deal_id?: string;
  activity_type: 'Email' | 'Call' | 'Meeting' | 'LinkedIn Message' | 'WhatsApp' | 'Note';
  subject: string;
  description?: string;
  activity_date: string;
}

/**
 * POST /api/activities
 * Create a new activity
 */
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
    const body: ActivityRequest = await request.json();

    // Validate required fields
    if (!body.activity_type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    if (!body.subject || !body.subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!body.activity_date) {
      return NextResponse.json(
        { error: 'Activity date is required' },
        { status: 400 }
      );
    }

    // Validate that at least one of contact_id or deal_id is provided
    if (!body.contact_id && !body.deal_id) {
      return NextResponse.json(
        { error: 'Either contact_id or deal_id must be provided' },
        { status: 400 }
      );
    }

    // Validate subject length
    if (body.subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Validate description length
    if (body.description && body.description.length > 5000) {
      return NextResponse.json(
        { error: 'Notes must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Validate activity_type
    const validTypes = ['Email', 'Call', 'Meeting', 'LinkedIn Message', 'WhatsApp', 'Note'];
    if (!validTypes.includes(body.activity_type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    // Validate activity_date is not in the future
    const activityDate = new Date(body.activity_date);
    const now = new Date();
    if (activityDate > now) {
      return NextResponse.json(
        { error: 'Activity date cannot be in the future' },
        { status: 400 }
      );
    }

    // Create the activity
    const { data: activity, error: createError } = await supabase
      .from('activities')
      .insert({
        contact_id: body.contact_id || null,
        deal_id: body.deal_id || null,
        activity_type: body.activity_type,
        subject: body.subject.trim(),
        description: body.description?.trim() || null,
        activity_date: body.activity_date,
        logged_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating activity:', createError);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activity,
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in activities POST API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
