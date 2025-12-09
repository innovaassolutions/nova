/**
 * Check Duplicate Contact API Route
 *
 * GET /api/contacts/check-duplicate - Check if contact already exists
 * Story: 2.5 - Duplicate Contact Detection & Prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

/**
 * GET /api/contacts/check-duplicate
 * Check for duplicate contacts by LinkedIn URL or Name
 * Query params: linkedin_url, first_name, last_name
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

  try {
    const { searchParams } = new URL(request.url);
    const linkedin_url = searchParams.get('linkedin_url');
    const first_name = searchParams.get('first_name');
    const last_name = searchParams.get('last_name');

    // Need at least LinkedIn URL OR both first and last name
    if (!linkedin_url && (!first_name || !last_name)) {
      return NextResponse.json(
        { error: 'Must provide linkedin_url or both first_name and last_name' },
        { status: 400 }
      );
    }

    // Build duplicate detection query
    // Check: LinkedIn URL match (exact) OR First Name + Last Name match (case-insensitive)
    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, linkedin_url, company, position, email');

    // Build OR condition
    const orConditions: string[] = [];

    if (linkedin_url) {
      orConditions.push(`linkedin_url.eq.${linkedin_url}`);
    }

    if (first_name && last_name) {
      orConditions.push(`and(first_name.ilike.${first_name},last_name.ilike.${last_name})`);
    }

    if (orConditions.length > 0) {
      query = query.or(orConditions.join(','));
    }

    const { data: duplicates, error: queryError } = await query;

    if (queryError) {
      console.error('Error checking for duplicates:', queryError);
      return NextResponse.json(
        { error: 'Failed to check for duplicates' },
        { status: 500 }
      );
    }

    // Return duplicate status and matches
    return NextResponse.json({
      isDuplicate: duplicates && duplicates.length > 0,
      matches: duplicates || [],
      count: duplicates?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error in duplicate check API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
