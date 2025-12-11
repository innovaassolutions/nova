import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/deals
 * Fetch deals with optional filtering, sorting, and pagination
 */
export async function GET(request: Request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const stageId = searchParams.get('stage_id')
    const status = searchParams.get('status')
    const ownerId = searchParams.get('owner_id')
    const contactId = searchParams.get('contact_id')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'expected_close_date'
    const order = searchParams.get('order') || 'asc'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, company),
        stage:pipeline_stages(id, name, order_num),
        owner:users(id, full_name)
      `, { count: 'exact' })

    // Apply filters
    if (stageId) {
      query = query.eq('stage_id', stageId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (ownerId) {
      if (ownerId === 'me') {
        query = query.eq('owner_id', user.id)
      } else {
        query = query.eq('owner_id', ownerId)
      }
    }

    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    // Apply search
    if (search) {
      query = query.or(`title.ilike.%${search}%,contact.first_name.ilike.%${search}%,contact.last_name.ilike.%${search}%,contact.company.ilike.%${search}%`)
    }

    // Apply sorting
    const sortColumn = sort === 'value' ? 'value' :
                      sort === 'updated_at' ? 'updated_at' :
                      'expected_close_date'
    const sortOrder = order === 'desc' ? { ascending: false } : { ascending: true }

    query = query.order(sortColumn, sortOrder)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: deals, error: dealsError, count } = await query

    if (dealsError) {
      console.error('Error fetching deals:', dealsError)
      return NextResponse.json(
        { error: dealsError.message },
        { status: 500 }
      )
    }

    // Calculate stage counts for tabs
    const { data: allDeals } = await supabase
      .from('deals')
      .select('stage_id')

    const stageCounts: Record<string, number> = {}
    if (allDeals) {
      allDeals.forEach((deal) => {
        if (deal.stage_id) {
          stageCounts[deal.stage_id] = (stageCounts[deal.stage_id] || 0) + 1
        }
      })
    }

    return NextResponse.json(
      {
        deals: deals || [],
        total: count || 0,
        stage_counts: stageCounts,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error fetching deals:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const {
      contact_id,
      title,
      value,
      probability,
      stage_id,
      expected_close_date,
      notes
    } = body

    // Validate required fields
    if (!contact_id || !title || !stage_id) {
      return NextResponse.json(
        { error: 'Missing required fields: contact_id, title, and stage_id are required' },
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

    // Insert deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        contact_id,
        title,
        value: value || null,
        probability: probability || null,
        stage_id,
        expected_close_date: expected_close_date || null,
        notes: notes || null,
        owner_id: user.id,
        status: 'Open'
      })
      .select()
      .single()

    if (dealError) {
      console.error('Error creating deal:', dealError)
      return NextResponse.json(
        { error: dealError.message },
        { status: 500 }
      )
    }

    // Create initial stage history entry
    const { error: historyError } = await supabase
      .from('deal_stage_history')
      .insert({
        deal_id: deal.id,
        from_stage_id: null,
        to_stage_id: stage_id,
        changed_by: user.id,
        notes: 'Deal created'
      })

    if (historyError) {
      console.error('Error creating stage history:', historyError)
      // Don't fail the request if history creation fails
      // The deal is already created
    }

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Unexpected error creating deal:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
