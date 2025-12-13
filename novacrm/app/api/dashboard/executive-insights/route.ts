import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard/executive-insights
 * Story 6.5: Executive Read-Only Dashboard View
 *
 * Provides team performance breakdown and forecast metrics for executives
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

    // Parse query parameters (filters)
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const campaignId = searchParams.get('campaign_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Calculate date threshold for forecast (next 30 days)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    // Build deals query with filters
    let dealsQuery = supabase
      .from('deals')
      .select('value, probability, expected_close_date, status, owner_id, contact:contacts(campaign_id), owner:users(id, name)')
      .eq('status', 'Open')

    // Apply owner filter
    if (ownerId) {
      dealsQuery = dealsQuery.eq('owner_id', ownerId)
    }

    // Apply date range filter (for created_at)
    if (startDate) {
      dealsQuery = dealsQuery.gte('created_at', startDate)
    }
    if (endDate) {
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      dealsQuery = dealsQuery.lte('created_at', endOfDay.toISOString())
    }

    const { data: deals, error: dealsError } = await dealsQuery

    if (dealsError) {
      console.error('Error fetching deals for executive insights:', dealsError)
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      )
    }

    // Apply campaign filter (client-side since it's nested)
    let filteredDeals = deals || []
    if (campaignId) {
      filteredDeals = (deals || []).filter((deal: any) => deal.contact?.campaign_id === campaignId)
    }

    // Calculate team performance (group by owner)
    const teamPerformanceMap = new Map<string, {
      id: string
      name: string
      deal_count: number
      total_value: number
      weighted_value: number
    }>()

    filteredDeals.forEach((deal: any) => {
      if (!deal.owner) return // Skip deals without owner

      const ownerId = deal.owner.id
      const ownerName = deal.owner.name

      if (!teamPerformanceMap.has(ownerId)) {
        teamPerformanceMap.set(ownerId, {
          id: ownerId,
          name: ownerName,
          deal_count: 0,
          total_value: 0,
          weighted_value: 0,
        })
      }

      const member = teamPerformanceMap.get(ownerId)!
      member.deal_count++
      member.total_value += deal.value || 0
      member.weighted_value += (deal.value || 0) * ((deal.probability || 0) / 100)
    })

    // Convert map to array and sort by total value (desc)
    const teamPerformance = Array.from(teamPerformanceMap.values())
      .sort((a, b) => b.total_value - a.total_value)

    // Calculate forecast (deals expected to close in next 30 days)
    const forecastDeals = filteredDeals.filter((deal: any) => {
      if (!deal.expected_close_date) return false
      const closeDate = new Date(deal.expected_close_date)
      return closeDate >= today && closeDate <= thirtyDaysFromNow
    })

    const expectedCloses = forecastDeals.length
    const weightedValue = forecastDeals.reduce(
      (sum: number, deal: any) => sum + (deal.value || 0) * ((deal.probability || 0) / 100),
      0
    )

    const dealsWithProbability = forecastDeals.filter(
      (deal: any) => deal.probability !== null && deal.probability !== undefined
    )
    const averageProbability =
      dealsWithProbability.length > 0
        ? dealsWithProbability.reduce((sum: number, deal: any) => sum + deal.probability, 0) /
          dealsWithProbability.length
        : 0

    return NextResponse.json(
      {
        team_performance: teamPerformance,
        forecast: {
          expected_closes: expectedCloses,
          weighted_value: weightedValue,
          average_probability: averageProbability,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in executive-insights API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
