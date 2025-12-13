import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard/pipeline-funnel
 * Story 6.2: Pipeline Funnel Visualization by Stage
 *
 * Fetch pipeline stage data with deal counts and values for funnel visualization
 * Supports filtering by owner, campaign, and date range (Story 6.4)
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

    // Parse query parameters (for Story 6.4 filters)
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const campaignId = searchParams.get('campaign_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Fetch all pipeline stages ordered by order_num
    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('id, name, order_num')
      .order('order_num', { ascending: true })

    if (stagesError) {
      console.error('Error fetching pipeline stages:', stagesError)
      return NextResponse.json(
        { error: 'Failed to fetch pipeline stages' },
        { status: 500 }
      )
    }

    // Build deals query with filters
    let dealsQuery = supabase
      .from('deals')
      .select('stage_id, value, status, created_at, owner_id, contact:contacts(campaign_id)')
      .eq('status', 'Open') // Only count open deals in the funnel

    // Apply filters (Story 6.4)
    if (ownerId) {
      if (ownerId === 'me') {
        dealsQuery = dealsQuery.eq('owner_id', user.id)
      } else {
        dealsQuery = dealsQuery.eq('owner_id', ownerId)
      }
    }

    if (startDate) {
      dealsQuery = dealsQuery.gte('created_at', startDate)
    }

    if (endDate) {
      dealsQuery = dealsQuery.lte('created_at', endDate)
    }

    const { data: deals, error: dealsError } = await dealsQuery

    if (dealsError) {
      console.error('Error fetching deals for funnel:', dealsError)
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      )
    }

    // Filter by campaign if specified (via contact relationship)
    let filteredDeals = deals || []
    if (campaignId && filteredDeals) {
      filteredDeals = filteredDeals.filter(
        (deal) => deal.contact?.campaign_id === campaignId
      )
    }

    // Group deals by stage and calculate metrics
    const stageMetrics = stages.map((stage) => {
      const stageDeals = filteredDeals.filter((deal) => deal.stage_id === stage.id)
      const dealCount = stageDeals.length
      const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

      return {
        stage_id: stage.id,
        stage_name: stage.name,
        order_num: stage.order_num,
        deal_count: dealCount,
        total_value: totalValue,
      }
    })

    // Calculate conversion rates between stages
    const funnelData = stageMetrics.map((stage, index) => {
      let conversionRate = null
      if (index < stageMetrics.length - 1) {
        const currentCount = stage.deal_count
        const nextCount = stageMetrics[index + 1].deal_count
        if (currentCount > 0) {
          conversionRate = Math.round((nextCount / currentCount) * 100)
        }
      }

      return {
        ...stage,
        conversion_rate: conversionRate,
      }
    })

    // Calculate total pipeline value for percentage calculations
    const totalPipelineValue = stageMetrics.reduce(
      (sum, stage) => sum + stage.total_value,
      0
    )

    return NextResponse.json(
      {
        funnel_data: funnelData,
        total_pipeline_value: totalPipelineValue,
        total_deals: filteredDeals.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in pipeline-funnel API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
