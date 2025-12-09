/**
 * Individual Contact API Route
 *
 * GET /api/contacts/[id] - Fetch single contact with details
 * PUT /api/contacts/[id] - Update contact information
 * DELETE /api/contacts/[id] - Delete contact
 * Story: 2.4 - Contact Detail View & Edit Modal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface UpdateContactRequest {
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  email?: string;
  company?: string;
  position?: string;
  connected_on?: string;
  source?: string;
  notes?: string;
  owner_id?: string;
  campaign_ids?: string[];
}

/**
 * GET /api/contacts/[id]
 * Fetch a single contact with campaign associations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Fetch contact with campaign data
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select(`
        *,
        campaigns:campaign_contacts(
          campaign:campaigns(id, name, status)
        )
      `)
      .eq('id', id)
      .single();

    if (contactError) {
      if (contactError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching contact:', contactError);
      return NextResponse.json(
        { error: 'Failed to fetch contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Unexpected error in contact GET API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contacts/[id]
 * Update contact information and campaign associations
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const body: UpdateContactRequest = await request.json();

    // Extract campaign_ids separately
    const { campaign_ids, ...contactData } = body;

    // Validate LinkedIn URL format if provided
    if (contactData.linkedin_url) {
      const linkedInPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
      if (!linkedInPattern.test(contactData.linkedin_url)) {
        return NextResponse.json(
          { error: 'Invalid LinkedIn URL format' },
          { status: 400 }
        );
      }
    }

    // Update contact
    const { data: updatedContact, error: updateError } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contact' },
        { status: 500 }
      );
    }

    // Update campaign associations if provided
    if (campaign_ids !== undefined) {
      // Delete existing associations
      const { error: deleteError } = await supabase
        .from('campaign_contacts')
        .delete()
        .eq('contact_id', id);

      if (deleteError) {
        console.error('Error deleting campaign associations:', deleteError);
        return NextResponse.json(
          { error: 'Failed to update campaign associations' },
          { status: 500 }
        );
      }

      // Insert new associations
      if (campaign_ids.length > 0) {
        const campaignInserts = campaign_ids.map(campaignId => ({
          contact_id: id,
          campaign_id: campaignId,
        }));

        const { error: insertError } = await supabase
          .from('campaign_contacts')
          .insert(campaignInserts);

        if (insertError) {
          console.error('Error inserting campaign associations:', insertError);
          return NextResponse.json(
            { error: 'Failed to update campaign associations' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      contact: updatedContact
    });
  } catch (error) {
    console.error('Unexpected error in contact PUT API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[id]
 * Delete contact (cascade deletes campaign_contacts)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Delete contact (campaign_contacts will cascade delete)
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting contact:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in contact DELETE API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
