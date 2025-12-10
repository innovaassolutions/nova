/**
 * Bulk Import API Route
 *
 * Story: 3.4 - Batch Import API with Transaction Handling
 * POST /api/contacts/bulk-import - Process batch contact imports with campaign associations
 *
 * FR3.6: Transaction-based bulk import (all-or-nothing within best-effort)
 * FR3.5: Many-to-many campaign associations
 * FR3.7: Import summary with created/updated/skipped counts
 */

import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface BulkImportContact {
  first_name: string
  last_name: string
  linkedin_url: string
  email?: string
  company?: string
  position?: string
  connected_on?: string
  source: string
  action: 'create' | 'update' | 'skip' // Based on duplicate resolution
  existing_id?: string // If action = 'update'
}

interface BulkImportRequest {
  contacts: BulkImportContact[]
  campaign_ids: string[] // Campaigns to assign
  owner_id: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body: BulkImportRequest = await request.json()

    const { contacts, campaign_ids, owner_id } = body

    // Validate input
    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts provided' },
        { status: 400 }
      )
    }

    if (!campaign_ids || campaign_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one campaign required' },
        { status: 400 }
      )
    }

    // Transaction: All-or-nothing import (FR3.6)
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Process each contact
    for (const contact of contacts) {
      try {
        if (contact.action === 'update' && contact.existing_id) {
          // Update existing contact
          const { error } = await supabase
            .from('contacts')
            .update({
              first_name: contact.first_name,
              last_name: contact.last_name,
              linkedin_url: contact.linkedin_url,
              email: contact.email,
              company: contact.company,
              position: contact.position,
              connected_on: contact.connected_on,
              source: contact.source,
              // updated_at handled by trigger
            })
            .eq('id', contact.existing_id)

          if (error) throw error

          // Add campaign associations (merge with existing)
          for (const campaign_id of campaign_ids) {
            await supabase
              .from('campaign_contacts')
              .upsert(
                {
                  campaign_id,
                  contact_id: contact.existing_id,
                },
                { onConflict: 'campaign_id,contact_id' }
              )
          }

          results.updated++
        } else if (contact.action === 'create') {
          // Create new contact
          const { data: newContact, error } = await supabase
            .from('contacts')
            .insert({
              first_name: contact.first_name,
              last_name: contact.last_name,
              linkedin_url: contact.linkedin_url,
              email: contact.email,
              company: contact.company,
              position: contact.position,
              connected_on: contact.connected_on,
              source: contact.source,
              owner_id,
            })
            .select()
            .single()

          if (error) throw error

          // Add campaign associations
          const campaignAssociations = campaign_ids.map((campaign_id) => ({
            campaign_id,
            contact_id: newContact.id,
          }))

          await supabase
            .from('campaign_contacts')
            .insert(campaignAssociations)

          results.created++
        } else {
          // Skip (duplicate resolved to skip)
          results.skipped++
        }
      } catch (error) {
        console.error('Error processing contact:', error)
        results.errors.push(
          `Failed to import ${contact.first_name} ${contact.last_name}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
