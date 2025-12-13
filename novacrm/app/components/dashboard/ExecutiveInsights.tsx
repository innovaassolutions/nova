'use client'

/**
 * ExecutiveInsights Component
 * Story 6.5: Executive Read-Only Dashboard View
 *
 * Displays team performance and forecast metrics for executive users
 */

import { useEffect, useState } from 'react'
import { TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface TeamMember {
  id: string
  name: string
  deal_count: number
  total_value: number
  weighted_value: number
}

interface ForecastData {
  expected_closes: number
  weighted_value: number
  average_probability: number
}

interface ExecutiveInsightsData {
  team_performance: TeamMember[]
  forecast: ForecastData
}

interface ExecutiveInsightsProps {
  filters?: {
    owner_id?: string
    campaign_id?: string
    start_date?: string
    end_date?: string
  }
}

export default function ExecutiveInsights({ filters }: ExecutiveInsightsProps) {
  const [data, setData] = useState<ExecutiveInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExecutiveInsights()
  }, [filters])

  const fetchExecutiveInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params with filters
      const params = new URLSearchParams()
      if (filters?.owner_id) params.append('owner_id', filters.owner_id)
      if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id)
      if (filters?.start_date) params.append('start_date', filters.start_date)
      if (filters?.end_date) params.append('end_date', filters.end_date)

      const queryString = params.toString()
      const url = `/api/dashboard/executive-insights${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch executive insights')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching executive insights:', err)
      setError('Failed to load executive insights')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-8">
        <div className="flex items-center justify-center">
          <div className="text-[#a6adc8]">Loading executive insights...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-8">
        <div className="text-center text-red-400">{error || 'Failed to load executive insights'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Performance Section */}
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-4 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <TrophyIcon className="h-6 w-6 text-[#F25C05]" />
          <div>
            <h2 className="text-2xl font-bold text-[#cdd6f4]">Team Performance</h2>
            <p className="text-sm text-[#a6adc8]">Deal pipeline by team member</p>
          </div>
        </div>

        {data.team_performance.length === 0 ? (
          <p className="text-center text-[#6c7086]">No team performance data available</p>
        ) : (
          <div className="space-y-3">
            {data.team_performance.map((member) => {
              const weightedPercentage =
                member.total_value > 0
                  ? Math.round((member.weighted_value / member.total_value) * 100)
                  : 0

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-2 rounded-lg border border-[#313244] bg-[#1e1e2e] p-4 transition-all hover:bg-[#313244] md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#cdd6f4]">{member.name}</p>
                    <p className="text-sm text-[#a6adc8]">
                      {member.deal_count} {member.deal_count === 1 ? 'deal' : 'deals'}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-1 md:items-end">
                    <p className="font-bold text-[#F25C05]">
                      {formatCurrency(member.total_value)}
                    </p>
                    <p className="text-sm text-[#a6adc8]">
                      {formatCurrency(member.weighted_value)} weighted ({weightedPercentage}%)
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Forecast Section */}
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-4 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <ChartBarIcon className="h-6 w-6 text-[#F25C05]" />
          <div>
            <h2 className="text-2xl font-bold text-[#cdd6f4]">Forecast (Next 30 Days)</h2>
            <p className="text-sm text-[#a6adc8]">Expected deal closures and revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Expected Closes */}
          <div className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-4">
            <p className="mb-2 text-sm font-medium text-[#a6adc8]">Expected Closes</p>
            <p className="text-3xl font-bold text-[#cdd6f4]">{data.forecast.expected_closes}</p>
            <p className="mt-1 text-xs text-[#6c7086]">
              {data.forecast.expected_closes === 1 ? 'deal' : 'deals'}
            </p>
          </div>

          {/* Weighted Value */}
          <div className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-4">
            <p className="mb-2 text-sm font-medium text-[#a6adc8]">Weighted Value</p>
            <p className="text-3xl font-bold text-[#F25C05]">
              {formatCurrency(data.forecast.weighted_value)}
            </p>
            <p className="mt-1 text-xs text-[#6c7086]">Probability-adjusted</p>
          </div>

          {/* Average Probability */}
          <div className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-4">
            <p className="mb-2 text-sm font-medium text-[#a6adc8]">Win Probability</p>
            <p className="text-3xl font-bold text-[#cdd6f4]">
              {Math.round(data.forecast.average_probability)}%
            </p>
            <p className="mt-1 text-xs text-[#6c7086]">Average across deals</p>
          </div>
        </div>
      </div>
    </div>
  )
}
