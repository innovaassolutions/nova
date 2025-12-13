/**
 * Companies API Route
 *
 * GET /api/companies - Fetch companies with search/filter/sort
 * POST /api/companies - Create a new company
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface CompanyRequest {
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  notes?: string;
}

/**
 * GET /api/companies
 * Fetch companies with search, filter, sort, and aggregated data (contact count, deal value)
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
    const industry = searchParams.get('industry') || 'all';
    const size = searchParams.get('size') || 'all';
    const sort = searchParams.get('sort') || 'name-asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // For sales_rep users, get company IDs from their contacts
    let allowedCompanyIds: string[] | null = null;
    if (userRole === 'sales_rep') {
      const { data: userContacts } = await supabase
        .from('contacts')
        .select('company_id')
        .eq('owner_id', user.id)
        .not('company_id', 'is', null);

      allowedCompanyIds = [...new Set((userContacts || []).map(c => c.company_id).filter(Boolean))] as string[];

      // If sales_rep has no contacts with companies, return empty
      if (allowedCompanyIds.length === 0) {
        return NextResponse.json({ companies: [], total: 0 }, { status: 200 });
      }
    }

    // Start building the query
    let query = supabase
      .from('companies')
      .select('*');

    // Apply role-based filtering
    if (userRole === 'sales_rep' && allowedCompanyIds) {
      query = query.in('id', allowedCompanyIds);
    }

    // Apply search filter (case-insensitive search on name and industry)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,industry.ilike.%${search}%`
      );
    }

    // Apply industry filter (exact match)
    if (industry !== 'all') {
      query = query.eq('industry', industry);
    }

    // Apply size filter (exact match)
    if (size !== 'all') {
      query = query.eq('size', size);
    }

    // Apply sort
    if (sort === 'name-asc') {
      query = query.order('name', { ascending: true });
    } else if (sort === 'name-desc') {
      query = query.order('name', { ascending: false });
    }
    // For contact count and deal value sorting, we need to fetch all data and sort in memory
    // since these require aggregation

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: companies, error: companiesError } = await query;

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    // For each company, fetch contact count and deal value
    const companiesWithMetrics = await Promise.all(
      (companies || []).map(async (company) => {
        // Get contact count (filtered by owner for sales_rep)
        let contactsQuery = supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        if (userRole === 'sales_rep') {
          contactsQuery = contactsQuery.eq('owner_id', user.id);
        }

        const { count: contactsCount } = await contactsQuery;

        // Get deal value (sum of all deals for contacts in this company, filtered by owner for sales_rep)
        let dealsQuery = supabase
          .from('deals')
          .select('value, owner_id, contacts!inner(company_id)')
          .eq('contacts.company_id', company.id);

        if (userRole === 'sales_rep') {
          dealsQuery = dealsQuery.eq('owner_id', user.id);
        }

        const { data: deals } = await dealsQuery;

        const dealValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;

        return {
          ...company,
          contacts_count: contactsCount || 0,
          deal_value: dealValue,
        };
      })
    );

    // Apply sorting for contact count and deal value (post-fetch)
    let sortedCompanies = companiesWithMetrics;
    if (sort === 'contacts-desc') {
      sortedCompanies = companiesWithMetrics.sort((a, b) =>
        (b.contacts_count || 0) - (a.contacts_count || 0)
      );
    } else if (sort === 'deal-value-desc') {
      sortedCompanies = companiesWithMetrics.sort((a, b) =>
        (b.deal_value || 0) - (a.deal_value || 0)
      );
    }

    return NextResponse.json({
      companies: sortedCompanies,
      pagination: {
        page,
        limit,
        total: sortedCompanies.length,
      }
    });
  } catch (error) {
    console.error('Unexpected error in companies GET API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company
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
    const body: CompanyRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.length > 200) {
      return NextResponse.json(
        { error: 'Company name must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Validate industry length
    if (body.industry && body.industry.length > 100) {
      return NextResponse.json(
        { error: 'Industry must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate size (must be one of the allowed values)
    if (body.size && !['Startup', 'SMB', 'Enterprise'].includes(body.size)) {
      return NextResponse.json(
        { error: 'Size must be one of: Startup, SMB, Enterprise' },
        { status: 400 }
      );
    }

    // Validate notes length
    if (body.notes && body.notes.length > 2000) {
      return NextResponse.json(
        { error: 'Notes must be 2000 characters or less' },
        { status: 400 }
      );
    }

    // Check for duplicate company name (case-insensitive)
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .ilike('name', body.name)
      .single();

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this name already exists' },
        { status: 409 }
      );
    }

    // Create the company
    const { data: company, error: createError } = await supabase
      .from('companies')
      .insert({
        name: body.name.trim(),
        industry: body.industry?.trim() || null,
        size: body.size || null,
        website: body.website?.trim() || null,
        notes: body.notes?.trim() || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating company:', createError);
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company,
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in companies POST API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
