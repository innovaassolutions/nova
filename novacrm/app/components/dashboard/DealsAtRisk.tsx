'use client'

/**
 * DealsAtRisk Component
 * Story 6.3: Deals at Risk Identification & List
 *
 * Shows deals that are stalling or at risk with proactive alerts
 * and quick action buttons for follow-up
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface AtRiskDeal {
  id: string
  title: string
  value: number | null
  contact: {
    id: string
    first_name: string
    last_name: string
    companies: {
      name: string
    } | null
  }
  stage: {
    id: string
    name: string
  }
  owner: {
    id: string
    name: string
  }
  updated_at: string
  risk_reasons: string[]
  risk_severity: number
}

interface DealsAtRiskData {
  at_risk_deals: AtRiskDeal[]
  total_at_risk: number
}

interface DealsAtRiskProps {
  filters?: {
    owner_id?: string
    campaign_id?: string
    start_date?: string
    end_date?: string
  }
}

export default function DealsAtRisk({ filters }: DealsAtRiskProps) {
  const router = useRouter()
  const [data, setData] = useState<DealsAtRiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAtRiskDeals()
  }, [filters])

  const fetchAtRiskDeals = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params with filters
      const params = new URLSearchParams({ limit: '5' })
      if (filters?.owner_id) params.append('owner_id', filters.owner_id)
      if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id)
      if (filters?.start_date) params.append('start_date', filters.start_date)
      if (filters?.end_date) params.append('end_date', filters.end_date)

      const queryString = params.toString()
      const url = `/api/dashboard/deals-at-risk${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch at-risk deals')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching at-risk deals:', err)
      setError('Failed to load at-risk deals')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A'
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleViewDeal = (dealId: string) => {
    router.push(`/deals?id=${dealId}`)
  }

  const handleViewAll = () => {
    router.push('/deals?filter=at-risk')
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-8">
        <div className="flex items-center justify-center">
          <div className="text-[#a6adc8]">Loading at-risk deals...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-8">
        <div className="text-center text-red-400">{error || 'Failed to load at-risk deals'}</div>
      </div>
    )
  }

  // Success state: No deals at risk
  if (data.at_risk_deals.length === 0) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-green-400">Great work! No deals at risk.</h3>
            <p className="mt-2 text-sm text-[#a6adc8]">
              All deals have recent activity and are on track.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#313244] bg-[#181825] p-4 md:p-6">
      {/* Section Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-[#f38ba8]" />
          <div>
            <h2 className="text-2xl font-bold text-[#f38ba8]">Deals at Risk</h2>
            <p className="text-sm text-[#a6adc8]">
              {data.total_at_risk} {data.total_at_risk === 1 ? 'deal needs' : 'deals need'} attention
            </p>
          </div>
        </div>

        {/* View All Link */}
        {data.total_at_risk > 5 && (
          <button
            onClick={handleViewAll}
            className="text-sm font-medium text-[#F25C05] transition-colors hover:text-[#ff6b1a]"
          >
            View All ({data.total_at_risk})
          </button>
        )}
      </div>

      {/* At-Risk Deals List */}
      <div className="space-y-3">
        {data.at_risk_deals.map((deal) => (
          <div
            key={deal.id}
            className="rounded-lg border-l-4 border-[#f38ba8] bg-[#f38ba8]/10 p-4 transition-all hover:bg-[#f38ba8]/15"
          >
            {/* Deal Header */}
            <div className="mb-3 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
              <div className="flex flex-1 items-start gap-2">
                <ExclamationTriangleIcon className="mt-1 h-5 w-5 flex-shrink-0 text-[#f38ba8]" />
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-bold text-[#cdd6f4]">{deal.title}</h3>
                  <p className="mt-1 break-words text-sm text-[#a6adc8]">
                    {deal.contact.first_name} {deal.contact.last_name}
                    {deal.contact.companies && (
                      <> • {deal.contact.companies.name}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="whitespace-nowrap font-bold text-[#F25C05]">
                  {formatCurrency(deal.value)}
                </p>
              </div>
            </div>

            {/* Risk Reasons */}
            <div className="mb-3 space-y-1">
              {deal.risk_reasons.map((reason, index) => (
                <p key={index} className="text-sm font-semibold text-[#f38ba8]">
                  Reason: {reason}
                </p>
              ))}
            </div>

            {/* Last Activity */}
            <p className="mb-3 text-xs text-[#a6adc8]">
              Last activity: {formatDate(deal.updated_at)} by {deal.owner.name}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleViewDeal(deal.id)}
                className="flex items-center gap-2 rounded-lg border border-[#313244] bg-[#313244] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-all hover:bg-[#45475a] active:scale-95"
              >
                <EyeIcon className="h-4 w-4" />
                View Deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
