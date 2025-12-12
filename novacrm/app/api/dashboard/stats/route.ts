import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard/stats
 * Calculate dashboard statistics including pipeline metrics and win rate
 *
 * Story: 6.1 - Dashboard Page with Four Key Stat Cards
 * Acceptance Criteria: AC9 - API Endpoint specification
 *
 * Response includes:
 * - Total Pipeline Value (sum of Open deals)
 * - Weighted Pipeline Value (probability-adjusted)
 * - Average Probability
 * - Open Deals Count
 * - Closing Soon Count (within 7 days)
 * - Win Rate (last 30 days)
 * - Won/Lost counts
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // AC9: Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // AC9: Single optimized query - fetch all deals at once (uses idx_deals_status)
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('value, probability, status, expected_close_date, closed_at')
      .in('status', ['Open', 'Won', 'Lost'])

    if (dealsError) {
      console.error('Error fetching deals for dashboard stats:', dealsError)
      return NextResponse.json({ error: dealsError.message }, { status: 500 })
    }

    // AC4: Calculate Total Pipeline Value
    const openDeals = deals.filter((d) => d.status === 'Open')
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0)

    // TODO: Calculate trend (↑ 12% vs last month) - placeholder for now
    const totalPipelineTrend = '↑ 12%'

    // AC5: Calculate Weighted Pipeline Value
    const weightedPipelineValue = openDeals.reduce(
      (sum, d) => sum + (d.value || 0) * ((d.probability || 0) / 100),
      0
    )

    // AC5: Calculate Average Probability
    const dealsWithProbability = openDeals.filter(
      (d) => d.probability !== null && d.probability !== undefined
    )
    const averageProbability =
      dealsWithProbability.length > 0
        ? dealsWithProbability.reduce((sum, d) => sum + d.probability!, 0) /
          dealsWithProbability.length
        : 0

    // AC6: Calculate Open Deals Count
    const openDealsCount = openDeals.length

    // AC6: Calculate Closing Soon Count (within 7 days)
    const today = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)

    const closingSoonCount = openDeals.filter((deal) => {
      if (!deal.expected_close_date) return false
      const closeDate = new Date(deal.expected_close_date)
      return closeDate >= today && closeDate <= sevenDaysFromNow
    }).length

    // AC7: Calculate Win Rate (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Filter deals closed in last 30 days using closed_at field
    const recentlyClosedDeals = deals.filter((d) => {
      if (!d.closed_at) return false
      const closedDate = new Date(d.closed_at)
      return closedDate >= thirtyDaysAgo && (d.status === 'Won' || d.status === 'Lost')
    })

    const wonCount = recentlyClosedDeals.filter((d) => d.status === 'Won').length
    const lostCount = recentlyClosedDeals.filter((d) => d.status === 'Lost').length
    const totalClosed = wonCount + lostCount

    // AC7: Handle division by zero
    const winRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0

    // AC9: Return JSON response
    return NextResponse.json(
      {
        total_pipeline_value: totalPipelineValue,
        total_pipeline_trend: totalPipelineTrend,

        weighted_pipeline_value: weightedPipelineValue,
        average_probability: averageProbability,

        open_deals_count: openDealsCount,
        closing_soon_count: closingSoonCount,

        win_rate: winRate,
        won_count: wonCount,
        lost_count: lostCount,

        last_updated: new Date().toISOString(),
      },
      {
        status: 200,
        // AC9: Cache-Control for MVP (always fresh data)
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error('Unexpected error calculating dashboard stats:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
