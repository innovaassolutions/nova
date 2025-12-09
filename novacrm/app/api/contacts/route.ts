/**
 * Contacts API Route
 *
 * POST /api/contacts - Create a new contact with LinkedIn capture
 * Story: 2.2 - Contact Creation Form
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface ContactRequest {
  first_name: string;
  last_name: string;
  linkedin_url: string;
  email?: string;
  company?: string;
  position?: string;
  connected_on?: string;
  source?: string;
  campaign_ids: string[];
}

export async function POST(request: NextRequest) {
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
    const body: ContactRequest = await request.json();

    // Validate required fields
    if (!body.first_name || !body.first_name.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.last_name || !body.last_name.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!body.linkedin_url || !body.linkedin_url.trim()) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL format
    const linkedInPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    if (!linkedInPattern.test(body.linkedin_url)) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL format' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate at least one campaign
    if (!body.campaign_ids || body.campaign_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one campaign is required' },
        { status: 400 }
      );
    }

    // Insert contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        linkedin_url: body.linkedin_url.trim(),
        email: body.email?.trim() || null,
        company: body.company?.trim() || null,
        position: body.position?.trim() || null,
        connected_on: body.connected_on || null,
        source: body.source || 'Manual Entry',
        owner_id: user.id,
      })
      .select('id')
      .single();

    if (contactError) {
      console.error('Error creating contact:', contactError);

      // Handle duplicate LinkedIn URL
      if (contactError.code === '23505') {
        return NextResponse.json(
          { error: 'A contact with this LinkedIn URL already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    // Insert campaign associations
    const campaignInserts = body.campaign_ids.map(campaignId => ({
      contact_id: contact.id,
      campaign_id: campaignId,
    }));

    const { error: campaignError } = await supabase
      .from('campaign_contacts')
      .insert(campaignInserts);

    if (campaignError) {
      console.error('Error creating campaign associations:', campaignError);

      // Rollback: delete the contact if campaign associations fail
      await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);

      return NextResponse.json(
        { error: 'Failed to create campaign associations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contact_id: contact.id,
      message: 'Contact created successfully'
    });

  } catch (error) {
    console.error('Unexpected error in contacts API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
