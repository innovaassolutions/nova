import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard/deals-at-risk
 * Story 6.3: Deals at Risk Identification & List
 *
 * Identify deals that are at risk based on:
 * 1. Stalled: No updates in 14+ days
 * 2. Overdue: Expected close date passed but deal still Open
 * 3. Low probability: <30% and in pipeline >30 days
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
    const limit = parseInt(searchParams.get('limit') || '5')

    // Calculate date thresholds
    const now = new Date()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const today = now.toISOString().split('T')[0]

    // Fetch all open deals with related data
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        value,
        probability,
        expected_close_date,
        created_at,
        updated_at,
        contact:contacts(id, first_name, last_name, companies(name)),
        stage:pipeline_stages(id, name),
        owner:users(id, name)
      `)
      .eq('status', 'Open')
      .order('updated_at', { ascending: true }) // Oldest updates first

    if (dealsError) {
      console.error('Error fetching deals for at-risk analysis:', dealsError)
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      )
    }

    // Analyze each deal for risk factors
    const atRiskDeals = (deals || []).map((deal) => {
      const risks: string[] = []
      let riskSeverity = 0 // Higher = more severe

      // Check 1: Stalled (no updates in 14+ days)
      const updatedAt = new Date(deal.updated_at)
      if (updatedAt < fourteenDaysAgo) {
        const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
        risks.push(`No updates in ${daysSinceUpdate} days`)
        riskSeverity += 2
      }

      // Check 2: Overdue close (expected close date passed)
      if (deal.expected_close_date) {
        const closeDate = new Date(deal.expected_close_date)
        const todayDate = new Date(today)
        if (closeDate < todayDate) {
          const daysOverdue = Math.floor((todayDate.getTime() - closeDate.getTime()) / (1000 * 60 * 60 * 24))
          risks.push(`Close date passed (${daysOverdue} days overdue)`)
          riskSeverity += 3 // Overdue is most severe
        }
      }

      // Check 3: Low probability and in pipeline >30 days
      const createdAt = new Date(deal.created_at)
      if ((deal.probability || 0) < 30 && createdAt < thirtyDaysAgo) {
        const daysInPipeline = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        risks.push(`Low probability (${deal.probability || 0}%) for ${daysInPipeline} days`)
        riskSeverity += 1
      }

      // Only return deals that have at least one risk factor
      if (risks.length === 0) {
        return null
      }

      return {
        id: deal.id,
        title: deal.title,
        value: deal.value,
        contact: deal.contact,
        stage: deal.stage,
        owner: deal.owner,
        updated_at: deal.updated_at,
        risk_reasons: risks,
        risk_severity: riskSeverity,
      }
    }).filter(Boolean) // Remove null entries

    // Sort by risk severity (highest first)
    atRiskDeals.sort((a, b) => {
      if (!a || !b) return 0
      return b.risk_severity - a.risk_severity
    })

    // Limit results for dashboard view
    const limitedDeals = limit > 0 ? atRiskDeals.slice(0, limit) : atRiskDeals

    return NextResponse.json(
      {
        at_risk_deals: limitedDeals,
        total_at_risk: atRiskDeals.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in deals-at-risk API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
