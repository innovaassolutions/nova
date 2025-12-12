/**
 * Individual Company API Route
 *
 * GET /api/companies/[id] - Get company detail with contacts and deals
 * PUT /api/companies/[id] - Update a company
 * DELETE /api/companies/[id] - Delete a company
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

interface CompanyRequest {
  name?: string;
  industry?: string;
  size?: string;
  website?: string;
  notes?: string;
}

/**
 * GET /api/companies/[id]
 * Fetch a single company with its contacts and deals
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
    const companyId = params.id;

    // Fetch company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch contacts for this company
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email, position, linkedin_url')
      .eq('company_id', companyId)
      .order('last_name', { ascending: true });

    // Fetch deals for this company (through contacts)
    const { data: deals } = await supabase
      .from('deals')
      .select('id, title, value, status, stage_id, contacts!inner(company_id)')
      .eq('contacts.company_id', companyId)
      .order('created_at', { ascending: false });

    // Calculate total deal value
    const totalDealValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;

    return NextResponse.json({
      company: {
        ...company,
        contacts: contacts || [],
        deals: deals || [],
        contacts_count: contacts?.length || 0,
        deal_value: totalDealValue,
      }
    });
  } catch (error) {
    console.error('Unexpected error in companies GET [id] API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/[id]
 * Update a company
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
    const companyId = params.id;
    const body: CompanyRequest = await request.json();

    // Validate required fields
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name && body.name.length > 200) {
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

    // Validate size
    if (body.size && body.size !== '' && !['Startup', 'SMB', 'Enterprise'].includes(body.size)) {
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

    // Check if company exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .single();

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current company)
    if (body.name) {
      const { data: duplicateCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', body.name)
        .neq('id', companyId)
        .single();

      if (duplicateCompany) {
        return NextResponse.json(
          { error: 'A company with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the company
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.industry !== undefined) updateData.industry = body.industry.trim() || null;
    if (body.size !== undefined) updateData.size = body.size || null;
    if (body.website !== undefined) updateData.website = body.website.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes.trim() || null;

    const { data: company, error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating company:', updateError);
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('Unexpected error in companies PUT API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[id]
 * Delete a company (contacts.company_id will be set to NULL by FK constraint)
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
    const companyId = params.id;

    // Check if company exists
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Delete the company (FK constraint will set contacts.company_id to NULL)
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (deleteError) {
      console.error('Error deleting company:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete company' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${company.name} deleted successfully`,
    });
  } catch (error) {
    console.error('Unexpected error in companies DELETE API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
