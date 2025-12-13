/**
 * Contacts API Route
 *
 * GET /api/contacts - Fetch contacts with search/filter/sort
 * POST /api/contacts - Create a new contact with LinkedIn capture
 * Story: 2.2 - Contact Creation Form
 * Story: 2.3 - Contacts List with Search & Filter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface ContactRequest {
  first_name: string;
  last_name: string;
  linkedin_url?: string;
  email?: string;
  company_id?: string;
  position?: string;
  connected_on?: string;
  source?: string;
  campaign_ids: string[];
}

/**
 * GET /api/contacts
 * Fetch contacts with search, filter, and sort capabilities
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get user role for role-based filtering
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = userData?.role || 'sales_rep';

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query with campaign data join
    let query = supabase
      .from('contacts')
      .select(`
        *,
        campaigns:campaign_contacts(
          campaign:campaigns(id, name, status)
        )
      `);

    // Apply search filter (case-insensitive search across multiple fields)
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,position.ilike.%${search}%`
      );
    }

    // Apply filter
    if (filter === 'my') {
      query = query.eq('owner_id', user.id);
    } else if (filter === 'unassigned') {
      query = query.is('owner_id', null);
    } else if (filter.startsWith('campaign-')) {
      const campaignId = filter.replace('campaign-', '');
      // For campaign filter, we need to join through campaign_contacts
      query = query.eq('campaign_contacts.campaign_id', campaignId);
    } else if (userRole === 'sales_rep') {
      // Role-based filtering: sales_rep users only see their own contacts
      query = query.eq('owner_id', user.id);
    }

    // Apply sort
    if (sort === 'name-asc') {
      query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });
    } else if (sort === 'name-desc') {
      query = query.order('last_name', { ascending: false }).order('first_name', { ascending: false });
    } else if (sort === 'company') {
      // Note: company sorting removed - contacts.company field no longer exists
      // Company data is now in companies table via company_id foreign key
      query = query.order('created_at', { ascending: false });
    } else {
      // Default: recently added
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contacts: contacts || [],
      pagination: {
        page,
        limit,
        total: contacts?.length || 0,
      }
    });
  } catch (error) {
    console.error('Unexpected error in contacts GET API:', error);
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

    // Validate LinkedIn URL format if provided (optional field)
    if (body.linkedin_url && body.linkedin_url.trim()) {
      // Simple, flexible LinkedIn URL validation - accepts any valid LinkedIn URL
      // Supports: http/https, with/without www, personal/company pages, query parameters
      const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\//;
      if (!linkedInPattern.test(body.linkedin_url)) {
        return NextResponse.json(
          { error: 'Invalid LinkedIn URL format. Must be a valid LinkedIn URL.' },
          { status: 400 }
        );
      }
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
        linkedin_url: body.linkedin_url ? body.linkedin_url.trim() : null,
        email: body.email?.trim() || null,
        company_id: body.company_id || null,
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
