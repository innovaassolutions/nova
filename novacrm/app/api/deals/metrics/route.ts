import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/deals/metrics
 * Calculate pipeline metrics including total value, weighted value, and deal counts
 *
 * Story: 4.5 - Pipeline Value Calculation & Deal Metrics
 * Acceptance Criteria: AC8, AC9
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // AC8: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role for role-based filtering
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role || 'sales_rep'

    // AC8: Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const stageId = searchParams.get('stage_id')
    const ownerId = searchParams.get('owner_id')
    const status = searchParams.get('status') || 'Open'

    // AC8: Build query with filters
    let query = supabase
      .from('deals')
      .select('*')
      .eq('status', status)

    if (stageId) {
      query = query.eq('stage_id', stageId)
    }

    // Role-based filtering: sales_rep can only see their own deals
    if (ownerId) {
      query = query.eq('owner_id', ownerId)
    } else if (userRole === 'sales_rep') {
      query = query.eq('owner_id', user.id)
    }

    // AC8: Fetch deals
    const { data: deals, error: dealsError } = await query

    if (dealsError) {
      console.error('Error fetching deals for metrics:', dealsError)
      return NextResponse.json(
        { error: dealsError.message },
        { status: 500 }
      )
    }

    // AC8: Calculate total pipeline value (AC2)
    const totalPipelineValue = deals.reduce((sum, deal) => {
      return sum + (deal.value || 0)
    }, 0)

    // AC8: Calculate weighted pipeline value (AC3)
    const weightedPipelineValue = deals.reduce((sum, deal) => {
      return sum + ((deal.value || 0) * (deal.probability || 0) / 100)
    }, 0)

    // AC8: Calculate average probability (AC3)
    const dealsWithProbability = deals.filter(d => d.probability !== null && d.probability !== undefined)
    const averageProbability = dealsWithProbability.length > 0
      ? dealsWithProbability.reduce((sum, d) => sum + d.probability, 0) / dealsWithProbability.length
      : 0

    // AC8: Calculate open deals count (AC4)
    const openDealsCount = deals.length

    // AC8: Calculate closing soon count (AC4)
    const today = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)

    const closingSoonCount = deals.filter(deal => {
      if (!deal.expected_close_date) return false
      const closeDate = new Date(deal.expected_close_date)
      return closeDate >= today && closeDate <= sevenDaysFromNow
    }).length

    // AC8: Calculate average deal value (AC5)
    const dealsWithValue = deals.filter(d => d.value !== null && d.value !== undefined)
    const averageDealValue = dealsWithValue.length > 0
      ? dealsWithValue.reduce((sum, d) => sum + d.value, 0) / dealsWithValue.length
      : 0

    // AC8: Calculate median deal value (AC5)
    const sortedValues = dealsWithValue.map(d => d.value).sort((a, b) => a - b)
    const medianDealValue = sortedValues.length > 0
      ? sortedValues[Math.floor(sortedValues.length / 2)]
      : 0

    // AC8: Return metrics response
    return NextResponse.json(
      {
        total_pipeline_value: totalPipelineValue,
        weighted_pipeline_value: weightedPipelineValue,
        average_probability: averageProbability,
        open_deals_count: openDealsCount,
        closing_soon_count: closingSoonCount,
        average_deal_value: averageDealValue,
        median_deal_value: medianDealValue
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error calculating deal metrics:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
