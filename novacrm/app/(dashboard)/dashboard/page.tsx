'use client'

/**
 * Dashboard Page
 * Story 6.1: Dashboard Page with Four Key Stat Cards
 * Story 6.2: Pipeline Funnel Visualization by Stage
 * Story 6.3: Deals at Risk Identification & List
 * Story 6.4: Dashboard Filters (Date Range, Owner, Campaign)
 * AC1, AC2: Dashboard route, page header structure
 *
 * Protected route - requires authentication.
 * Displays four key pipeline metrics, funnel visualization, and at-risk deals.
 *
 * Features Catppuccin Mocha dark theme with NovaCRM branding.
 * Protection: Middleware redirects unauthenticated users to /login
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardStats from '@/app/components/dashboard/DashboardStats'
import PipelineFunnel from '@/app/components/dashboard/PipelineFunnel'
import DealsAtRisk from '@/app/components/dashboard/DealsAtRisk'
import DashboardFilters from '@/app/components/dashboard/DashboardFilters'
import ExecutiveInsights from '@/app/components/dashboard/ExecutiveInsights'
import { useUserRole } from '@/lib/hooks/useUserRole'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { isExecutive, loading: roleLoading } = useUserRole()

  const [statsData, setStatsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{
    owner_id?: string
    campaign_id?: string
    start_date?: string
    end_date?: string
  }>({})

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [filters])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    }
  }

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query with filters
      let dealsQuery = supabase
        .from('deals')
        .select('value, probability, status, expected_close_date, closed_at, owner_id, contact:contacts(campaign_id), created_at')
        .in('status', ['Open', 'Won', 'Lost'])

      // Apply owner filter
      if (filters.owner_id) {
        dealsQuery = dealsQuery.eq('owner_id', filters.owner_id)
      }

      // Apply date range filter (for created_at)
      if (filters.start_date) {
        dealsQuery = dealsQuery.gte('created_at', filters.start_date)
      }
      if (filters.end_date) {
        const endOfDay = new Date(filters.end_date)
        endOfDay.setHours(23, 59, 59, 999)
        dealsQuery = dealsQuery.lte('created_at', endOfDay.toISOString())
      }

      const { data: deals, error: dealsError } = await dealsQuery

      if (dealsError) {
        console.error('Error fetching deals for dashboard stats:', dealsError)
        setError('Failed to load dashboard statistics')
        setLoading(false)
        return
      }

      // Apply campaign filter (client-side since it's nested)
      let filteredDeals = deals
      if (filters.campaign_id) {
        filteredDeals = deals.filter((d: any) => d.contact?.campaign_id === filters.campaign_id)
      }

      // Calculate metrics (same logic as before)
      const openDeals = filteredDeals.filter((d: any) => d.status === 'Open')
      const totalPipelineValue = openDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0)

      const weightedPipelineValue = openDeals.reduce(
        (sum: number, d: any) => sum + (d.value || 0) * ((d.probability || 0) / 100),
        0
      )

      const dealsWithProbability = openDeals.filter(
        (d: any) => d.probability !== null && d.probability !== undefined
      )
      const averageProbability =
        dealsWithProbability.length > 0
          ? dealsWithProbability.reduce((sum: number, d: any) => sum + d.probability, 0) /
            dealsWithProbability.length
          : 0

      const openDealsCount = openDeals.length

      // Calculate closing soon (within 7 days)
      const today = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const closingSoonCount = openDeals.filter((deal: any) => {
        if (!deal.expected_close_date) return false
        const closeDate = new Date(deal.expected_close_date)
        return closeDate >= today && closeDate <= sevenDaysFromNow
      }).length

      // Calculate win rate (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentlyClosedDeals = filteredDeals.filter((d: any) => {
        if (!d.closed_at) return false
        const closedDate = new Date(d.closed_at)
        return closedDate >= thirtyDaysAgo && (d.status === 'Won' || d.status === 'Lost')
      })

      const wonCount = recentlyClosedDeals.filter((d: any) => d.status === 'Won').length
      const lostCount = recentlyClosedDeals.filter((d: any) => d.status === 'Lost').length
      const totalClosed = wonCount + lostCount
      const winRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0

      setStatsData({
        total_pipeline_value: totalPipelineValue,
        total_pipeline_trend: '↑ 12%', // Placeholder
        weighted_pipeline_value: weightedPipelineValue,
        average_probability: averageProbability,
        open_deals_count: openDealsCount,
        closing_soon_count: closingSoonCount,
        win_rate: winRate,
        won_count: wonCount,
        lost_count: lostCount,
      })
    } catch (err) {
      console.error('Error calculating dashboard stats:', err)
      setError('An error occurred while loading dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: {
    owner_id?: string
    campaign_id?: string
    start_date?: string
    end_date?: string
  }) => {
    setFilters(newFilters)
  }

  if (loading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-[#a6adc8]">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* AC2: Page Header Structure */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4">
          {/* Title and subtitle */}
          <div>
            <h1 className="text-[2rem] font-extrabold text-[#cdd6f4]">Dashboard</h1>
            <p className="text-base text-[#a6adc8]">
              {isExecutive ? 'Executive pipeline overview' : 'Your sales pipeline at a glance'}
            </p>
          </div>

          {/* Story 6.4: Dashboard Filters */}
          <div className="w-full">
            <DashboardFilters onFiltersChange={handleFiltersChange} />
          </div>
        </div>
      </div>

      {/* AC3: Four Stat Cards Grid */}
      <DashboardStats data={statsData || undefined} error={error || undefined} />

      {/* Story 6.2: Pipeline Funnel Visualization */}
      <div className="mt-8">
        <PipelineFunnel filters={filters} />
      </div>

      {/* Story 6.3: Deals at Risk */}
      <div className="mt-8">
        <DealsAtRisk filters={filters} readOnly={isExecutive} />
      </div>

      {/* Story 6.5: Executive Insights (only for executives) */}
      {isExecutive && (
        <div className="mt-8">
          <ExecutiveInsights filters={filters} />
        </div>
      )}
    </div>
  )
}
