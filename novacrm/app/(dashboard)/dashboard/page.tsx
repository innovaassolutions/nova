/**
 * Dashboard Page
 * Story 6.1: Dashboard Page with Four Key Stat Cards
 * Story 6.2: Pipeline Funnel Visualization by Stage
 * Story 6.3: Deals at Risk Identification & List
 * AC1, AC2: Dashboard route, page header structure
 *
 * Protected route - requires authentication.
 * Displays four key pipeline metrics, funnel visualization, and at-risk deals.
 *
 * Features Catppuccin Mocha dark theme with NovaCRM branding.
 * Protection: Middleware redirects unauthenticated users to /login
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardStats from '@/app/components/dashboard/DashboardStats'
import PipelineFunnel from '@/app/components/dashboard/PipelineFunnel'
import DealsAtRisk from '@/app/components/dashboard/DealsAtRisk'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // AC1: Double-check authentication (middleware should handle this)
  if (!user) {
    redirect('/login')
  }

  // AC1, AC9: Fetch dashboard stats directly from database
  let statsData = null
  let error = null

  try {
    // Fetch all deals with single optimized query (uses idx_deals_status)
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('value, probability, status, expected_close_date, closed_at')
      .in('status', ['Open', 'Won', 'Lost'])

    if (dealsError) {
      console.error('Error fetching deals for dashboard stats:', dealsError)
      error = 'Failed to load dashboard statistics'
    } else {
      // Calculate metrics (same logic as API endpoint)
      const openDeals = deals.filter((d) => d.status === 'Open')
      const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0)

      const weightedPipelineValue = openDeals.reduce(
        (sum, d) => sum + (d.value || 0) * ((d.probability || 0) / 100),
        0
      )

      const dealsWithProbability = openDeals.filter(
        (d) => d.probability !== null && d.probability !== undefined
      )
      const averageProbability =
        dealsWithProbability.length > 0
          ? dealsWithProbability.reduce((sum, d) => sum + d.probability!, 0) /
            dealsWithProbability.length
          : 0

      const openDealsCount = openDeals.length

      // Calculate closing soon (within 7 days)
      const today = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const closingSoonCount = openDeals.filter((deal) => {
        if (!deal.expected_close_date) return false
        const closeDate = new Date(deal.expected_close_date)
        return closeDate >= today && closeDate <= sevenDaysFromNow
      }).length

      // Calculate win rate (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentlyClosedDeals = deals.filter((d) => {
        if (!d.closed_at) return false
        const closedDate = new Date(d.closed_at)
        return closedDate >= thirtyDaysAgo && (d.status === 'Won' || d.status === 'Lost')
      })

      const wonCount = recentlyClosedDeals.filter((d) => d.status === 'Won').length
      const lostCount = recentlyClosedDeals.filter((d) => d.status === 'Lost').length
      const totalClosed = wonCount + lostCount
      const winRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0

      statsData = {
        total_pipeline_value: totalPipelineValue,
        total_pipeline_trend: '↑ 12%', // Placeholder
        weighted_pipeline_value: weightedPipelineValue,
        average_probability: averageProbability,
        open_deals_count: openDealsCount,
        closing_soon_count: closingSoonCount,
        win_rate: winRate,
        won_count: wonCount,
        lost_count: lostCount,
      }
    }
  } catch (err) {
    console.error('Error calculating dashboard stats:', err)
    error = 'An error occurred while loading dashboard statistics'
  }

  return (
    <div className="w-full">
      {/* AC2: Page Header Structure */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Title and subtitle */}
          <div>
            <h1 className="text-[2rem] font-extrabold text-[#cdd6f4]">Dashboard</h1>
            <p className="text-base text-[#a6adc8]">Your sales pipeline at a glance</p>
          </div>

          {/* Right side: Last updated + Filter bar placeholder */}
          <div className="flex items-center gap-4">
            {/* AC2: Last updated indicator (static for MVP) */}
            <p className="text-sm text-[#6c7086]">Updated 2 minutes ago</p>

            {/* AC2: Filter bar placeholder (Story 6.4 will populate) */}
            <div className="text-sm text-[#6c7086]">
              {/* Filters will be added in Story 6.4 */}
            </div>
          </div>
        </div>
      </div>

      {/* AC3: Four Stat Cards Grid */}
      <DashboardStats data={statsData || undefined} error={error || undefined} />

      {/* Story 6.2: Pipeline Funnel Visualization */}
      <div className="mt-8">
        <PipelineFunnel />
      </div>

      {/* Story 6.3: Deals at Risk */}
      <div className="mt-8">
        <DealsAtRisk />
      </div>
    </div>
  )
}
