import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LinkedInContact } from '@/lib/csv-parser';

interface ImportRequest {
  selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>;
  overwriteIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { selectedContacts, overwriteIds } = body;

    if (!selectedContacts || selectedContacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts provided' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const errors: string[] = [];
    let imported = 0;
    let overwritten = 0;

    // LinkedIn URL validation regex
    const linkedInUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;

    for (const { contact, campaignIds } of selectedContacts) {
      try {
        // Validate LinkedIn URL
        if (!linkedInUrlPattern.test(contact.url)) {
          errors.push(`Invalid LinkedIn URL: ${contact.url}`);
          continue;
        }

        // Check if this contact should be overwritten
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .or(`linkedin_url.eq.${contact.url},and(first_name.ilike.${contact.firstName},last_name.ilike.${contact.lastName})`)
          .single();

        if (existingContact && overwriteIds.includes(existingContact.id)) {
          // Update existing contact
          const { error: updateError } = await supabase
            .from('contacts')
            .update({
              first_name: contact.firstName,
              last_name: contact.lastName,
              linkedin_url: contact.url,
              email: contact.email || null,
              company: contact.company || null,
              position: contact.position || null,
              connected_on: contact.connectedOn ? parseConnectedOn(contact.connectedOn) : null,
              source: 'CSV Import',
            })
            .eq('id', existingContact.id);

          if (updateError) {
            errors.push(`Failed to update ${contact.firstName} ${contact.lastName}: ${updateError.message}`);
            continue;
          }

          // Associate with campaigns
          await associateWithCampaigns(supabase, existingContact.id, campaignIds);
          overwritten++;
        } else if (!existingContact) {
          // Insert new contact
          const { data: newContact, error: insertError } = await supabase
            .from('contacts')
            .insert({
              first_name: contact.firstName,
              last_name: contact.lastName,
              linkedin_url: contact.url,
              email: contact.email || null,
              company: contact.company || null,
              position: contact.position || null,
              connected_on: contact.connectedOn ? parseConnectedOn(contact.connectedOn) : null,
              source: 'CSV Import',
              owner_id: null, // Unassigned
            })
            .select('id')
            .single();

          if (insertError) {
            errors.push(`Failed to insert ${contact.firstName} ${contact.lastName}: ${insertError.message}`);
            continue;
          }

          if (newContact) {
            // Associate with campaigns
            await associateWithCampaigns(supabase, newContact.id, campaignIds);
            imported++;
          }
        }
        // If existingContact but not in overwriteIds, skip (user chose not to overwrite)
      } catch (error) {
        console.error('Error processing contact:', error);
        errors.push(`Error processing ${contact.firstName} ${contact.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      imported,
      overwritten,
      errors,
    });
  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function associateWithCampaigns(
  supabase: any,
  contactId: string,
  campaignIds: string[]
) {
  for (const campaignId of campaignIds) {
    // Use upsert to avoid duplicate errors if association already exists
    const { error } = await supabase
      .from('campaign_contacts')
      .upsert({
        campaign_id: campaignId,
        contact_id: contactId,
      }, {
        onConflict: 'campaign_id,contact_id',
        ignoreDuplicates: true,
      });

    if (error) {
      console.error('Error associating with campaign:', error);
    }
  }
}

function parseConnectedOn(dateString: string): string | null {
  try {
    // LinkedIn format: "07 Dec 2025"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    // Return in YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}
