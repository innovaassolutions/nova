'use client'

/**
 * PipelineFunnel Component
 * Story 6.2: Pipeline Funnel Visualization by Stage
 *
 * Visual funnel showing deal count and value at each pipeline stage
 * with conversion rates and interactive navigation to filtered deals
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface StageData {
  stage_id: string
  stage_name: string
  order_num: number
  deal_count: number
  total_value: number
  conversion_rate: number | null
}

interface PipelineFunnelData {
  funnel_data: StageData[]
  total_pipeline_value: number
  total_deals: number
}

interface PipelineFunnelProps {
  filters?: {
    owner_id?: string
    campaign_id?: string
    start_date?: string
    end_date?: string
  }
}

export default function PipelineFunnel({ filters }: PipelineFunnelProps) {
  const router = useRouter()
  const [data, setData] = useState<PipelineFunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'funnel' | 'list'>('funnel')

  useEffect(() => {
    fetchFunnelData()
  }, [filters])

  const fetchFunnelData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params
      const params = new URLSearchParams()
      if (filters?.owner_id) params.append('owner_id', filters.owner_id)
      if (filters?.campaign_id) params.append('campaign_id', filters.campaign_id)
      if (filters?.start_date) params.append('start_date', filters.start_date)
      if (filters?.end_date) params.append('end_date', filters.end_date)

      const queryString = params.toString()
      const url = `/api/dashboard/pipeline-funnel${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch pipeline funnel data')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching funnel data:', err)
      setError('Failed to load pipeline funnel')
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

  const getConversionColor = (rate: number | null) => {
    if (rate === null) return ''
    if (rate >= 50) return 'text-green-400'
    if (rate >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  const handleStageClick = (stageId: string) => {
    router.push(`/deals?stage_id=${stageId}`)
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-8">
        <div className="flex items-center justify-center">
          <div className="text-[#a6adc8]">Loading pipeline funnel...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-8">
        <div className="text-center text-red-400">{error || 'Failed to load funnel'}</div>
      </div>
    )
  }

  // Calculate max value for bar width scaling
  const maxValue = Math.max(...data.funnel_data.map((stage) => stage.total_value), 1)

  return (
    <div className="rounded-xl border border-[#313244] bg-[#181825] p-4 md:p-6">
      {/* Section Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#cdd6f4]">Pipeline by Stage</h2>
          <p className="text-sm text-[#a6adc8]">Deal count and value per stage</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('funnel')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'funnel'
                ? 'bg-[#F25C05] text-white'
                : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
            }`}
          >
            Funnel View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-[#F25C05] text-white'
                : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Funnel View */}
      {viewMode === 'funnel' && (
        <div className="space-y-3">
          {data.funnel_data.map((stage, index) => {
            const widthPercent = maxValue > 0 ? (stage.total_value / maxValue) * 100 : 0
            const indentPx = index * 20 // Funnel narrowing effect
            const pipelinePercent = data.total_pipeline_value > 0
              ? Math.round((stage.total_value / data.total_pipeline_value) * 100)
              : 0

            return (
              <div key={stage.stage_id}>
                {/* Stage Bar */}
                <div
                  className="group relative cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ paddingLeft: `${indentPx}px` }}
                  onClick={() => handleStageClick(stage.stage_id)}
                  title={`${stage.deal_count} deals • ${formatCurrency(stage.total_value)} total • ${pipelinePercent}% of pipeline`}
                >
                  <div
                    className="relative h-12 rounded-lg border border-[#45475a] bg-gradient-to-r from-[#F25C05] to-[#ff6b1a] shadow-md transition-all group-hover:shadow-lg"
                    style={{ width: `${Math.max(widthPercent, 10)}%` }}
                  >
                    {/* Stage Content */}
                    <div className="flex h-full items-center justify-between px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {stage.stage_name}
                        </span>
                        <span className="text-sm text-white/80">
                          ({stage.deal_count} {stage.deal_count === 1 ? 'deal' : 'deals'})
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatCurrency(stage.total_value)}
                      </span>
                    </div>

                    {/* Empty State Overlay */}
                    {stage.deal_count === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#45475a]">
                        <span className="text-sm text-[#6c7086]">0 deals</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversion Rate */}
                {stage.conversion_rate !== null && (
                  <div className="mt-1 text-center text-sm" style={{ paddingLeft: `${indentPx}px` }}>
                    <span className={getConversionColor(stage.conversion_rate)}>
                      {stage.conversion_rate}% →
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#313244]">
                <th className="pb-3 text-left text-sm font-semibold text-[#a6adc8]">Stage</th>
                <th className="pb-3 text-right text-sm font-semibold text-[#a6adc8]">Deals</th>
                <th className="pb-3 text-right text-sm font-semibold text-[#a6adc8]">Value</th>
                <th className="pb-3 text-right text-sm font-semibold text-[#a6adc8]">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.funnel_data.map((stage) => (
                <tr
                  key={stage.stage_id}
                  className="cursor-pointer border-b border-[#313244] transition-colors hover:bg-[#313244]"
                  onClick={() => handleStageClick(stage.stage_id)}
                >
                  <td className="py-3 text-left font-medium text-[#cdd6f4]">
                    {stage.stage_name}
                  </td>
                  <td className="py-3 text-right text-[#cdd6f4]">{stage.deal_count}</td>
                  <td className="py-3 text-right text-[#cdd6f4]">
                    {formatCurrency(stage.total_value)}
                  </td>
                  <td className="py-3 text-right">
                    {stage.conversion_rate !== null ? (
                      <span className={getConversionColor(stage.conversion_rate)}>
                        {stage.conversion_rate}% →
                      </span>
                    ) : (
                      <span className="text-[#6c7086]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
