import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/deals/[id]
 * Fetch a single deal with all related data and stage history
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dealId = params.id

    // Fetch deal with joined data
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, company),
        stage:pipeline_stages(id, name, order_num),
        owner:users(id, email, full_name)
      `)
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Fetch stage history
    const { data: history, error: historyError } = await supabase
      .from('deal_stage_history')
      .select(`
        *,
        from_stage:pipeline_stages!from_stage_id(name),
        to_stage:pipeline_stages!to_stage_id(name),
        changed_by_user:users(full_name)
      `)
      .eq('deal_id', dealId)
      .order('changed_at', { ascending: false })

    if (historyError) {
      console.error('Error fetching stage history:', historyError)
      // Don't fail if history fails, just return empty array
    }

    return NextResponse.json(
      { deal, history: history || [] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error fetching deal:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/deals/[id]
 * Update a deal with optional stage change tracking
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dealId = params.id
    const body = await request.json()

    const {
      title,
      value,
      probability,
      stage_id,
      expected_close_date,
      notes,
      status,
      stage_change_notes
    } = body

    // Validate required fields
    if (!title || !stage_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: title, stage_id, and status are required' },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    // Validate value
    if (value !== null && value !== undefined) {
      if (typeof value !== 'number' || value < 0 || value > 99999999.99) {
        return NextResponse.json(
          { error: 'Value must be a positive number less than 99,999,999.99' },
          { status: 400 }
        )
      }
    }

    // Validate probability
    if (probability !== null && probability !== undefined) {
      if (typeof probability !== 'number' || probability < 0 || probability > 100) {
        return NextResponse.json(
          { error: 'Probability must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    // Validate status
    if (!['Open', 'Won', 'Lost'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be Open, Won, or Lost' },
        { status: 400 }
      )
    }

    // Fetch original deal to check for stage change
    const { data: originalDeal, error: fetchError } = await supabase
      .from('deals')
      .select('stage_id, status')
      .eq('id', dealId)
      .single()

    if (fetchError || !originalDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Determine closed_at based on status
    let closed_at = null
    if (status === 'Won' || status === 'Lost') {
      // If transitioning to Won/Lost, set closed_at to now
      if (originalDeal.status === 'Open') {
        closed_at = new Date().toISOString()
      } else {
        // Keep existing closed_at if already closed
        const { data: existingDeal } = await supabase
          .from('deals')
          .select('closed_at')
          .eq('id', dealId)
          .single()
        closed_at = existingDeal?.closed_at || new Date().toISOString()
      }
    }

    // Update deal
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update({
        title,
        value: value || null,
        probability: probability || null,
        stage_id,
        expected_close_date: expected_close_date || null,
        notes: notes || null,
        status,
        closed_at
      })
      .eq('id', dealId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating deal:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Create stage history entry if stage changed
    if (stage_id !== originalDeal.stage_id) {
      const { error: historyError } = await supabase
        .from('deal_stage_history')
        .insert({
          deal_id: dealId,
          from_stage_id: originalDeal.stage_id,
          to_stage_id: stage_id,
          changed_by: user.id,
          notes: stage_change_notes || null
        })

      if (historyError) {
        console.error('Error creating stage history:', historyError)
        // Don't fail the request if history creation fails
      }
    }

    return NextResponse.json(updatedDeal, { status: 200 })
  } catch (error) {
    console.error('Unexpected error updating deal:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/deals/[id]
 * Delete a deal (cascade deletes stage history)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dealId = params.id

    // Delete deal (CASCADE will delete deal_stage_history automatically)
    const { error: deleteError } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId)

    if (deleteError) {
      console.error('Error deleting deal:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Deal deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error deleting deal:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
