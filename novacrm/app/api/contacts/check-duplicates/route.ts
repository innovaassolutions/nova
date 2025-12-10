/**
 * Check Duplicates API Route
 *
 * Story: 3.3 - Duplicate Detection & Resolution Modal
 *
 * Endpoint: POST /api/contacts/check-duplicates
 * Purpose: Check for duplicate contacts during CSV import
 *
 * Duplicate matching logic (FR3.3, Architecture §3.4.2):
 * - LinkedIn URL match (exact, case-insensitive) = High confidence
 * - First Name + Last Name match (both exact, case-insensitive) = Medium confidence
 */

import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

interface ContactToCheck {
  first_name: string;
  last_name: string;
  linkedin_url: string;
  email?: string;
  company?: string;
  position?: string;
  connected_on?: string;
}

interface DuplicateMatch {
  csvContact: ContactToCheck;
  existingContact: {
    id: string;
    first_name: string;
    last_name: string;
    linkedin_url: string;
    email: string | null;
    company: string | null;
    position: string | null;
    connected_on: string | null;
    created_at: string;
  };
  matchType: 'linkedin_url' | 'name';
  confidence: 'high' | 'medium';
  csvIndex: number; // Index in original CSV array
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { contacts } = body as { contacts: ContactToCheck[] };

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts provided' },
        { status: 400 }
      );
    }

    const duplicates: DuplicateMatch[] = [];

    // Check each contact for duplicates
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      // Check for LinkedIn URL match (high confidence)
      const { data: linkedinMatches, error: linkedinError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, linkedin_url, email, company, position, connected_on, created_at')
        .ilike('linkedin_url', contact.linkedin_url)
        .limit(1);

      if (linkedinError) {
        console.error('Error checking LinkedIn URL duplicates:', linkedinError);
        continue;
      }

      if (linkedinMatches && linkedinMatches.length > 0) {
        duplicates.push({
          csvContact: contact,
          existingContact: linkedinMatches[0],
          matchType: 'linkedin_url',
          confidence: 'high',
          csvIndex: i,
        });
        continue; // Skip name check if LinkedIn URL matched
      }

      // Check for name match (medium confidence)
      const { data: nameMatches, error: nameError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, linkedin_url, email, company, position, connected_on, created_at')
        .ilike('first_name', contact.first_name)
        .ilike('last_name', contact.last_name)
        .limit(1);

      if (nameError) {
        console.error('Error checking name duplicates:', nameError);
        continue;
      }

      if (nameMatches && nameMatches.length > 0) {
        duplicates.push({
          csvContact: contact,
          existingContact: nameMatches[0],
          matchType: 'name',
          confidence: 'medium',
          csvIndex: i,
        });
      }
    }

    return NextResponse.json({
      duplicates,
      totalChecked: contacts.length,
      duplicatesFound: duplicates.length,
    });
  } catch (error) {
    console.error('Error in check-duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}
