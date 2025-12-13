'use client'

/**
 * PipelineFunnel Component
 * Story 6.2: Pipeline Funnel Visualization by Stage
 *
 * Stacked horizontal bar chart showing deal distribution across pipeline stages
 * with interactive segments and detailed breakdown
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

// Catppuccin Mocha color palette (muted) for stages
const STAGE_COLORS = [
  '#c6a0f6', // Mauve (muted purple)
  '#8aadf4', // Blue (muted)
  '#7dc4e4', // Sky (muted cyan)
  '#a6da95', // Green (muted)
  '#eed49f', // Yellow (muted)
  '#f5a97f', // Peach (muted)
  '#ed8796', // Maroon (muted red)
  '#f0c6c6', // Flamingo (muted pink)
]

export default function PipelineFunnel({ filters }: PipelineFunnelProps) {
  const router = useRouter()
  const [data, setData] = useState<PipelineFunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)

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

  // Calculate percentages for each stage
  const stagesWithPercentages = data.funnel_data.map((stage, index) => {
    const percentage = data.total_pipeline_value > 0
      ? (stage.total_value / data.total_pipeline_value) * 100
      : 0

    return {
      ...stage,
      percentage,
      color: STAGE_COLORS[index % STAGE_COLORS.length],
    }
  })

  return (
    <div className="rounded-xl border border-[#313244] bg-[#181825] p-4 md:p-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#cdd6f4]">Pipeline by Stage</h2>
        <p className="text-sm text-[#a6adc8]">
          {data.total_deals} {data.total_deals === 1 ? 'deal' : 'deals'} • {formatCurrency(data.total_pipeline_value)} total value
        </p>
      </div>

      {/* Empty State */}
      {data.total_deals === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-[#6c7086]">No deals in pipeline</p>
          <p className="mt-2 text-sm text-[#a6adc8]">Deals will appear here once created</p>
        </div>
      ) : (
        <>
          {/* Stacked Bar Chart */}
          <div className="mb-6">
            <div className="flex h-16 w-full overflow-hidden rounded-lg border border-[#45475a]">
              {stagesWithPercentages.map((stage) => {
                if (stage.percentage === 0) return null

                return (
                  <div
                    key={stage.stage_id}
                    className="relative cursor-pointer transition-all duration-200 hover:brightness-110"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                    onClick={() => handleStageClick(stage.stage_id)}
                    onMouseEnter={() => setHoveredStage(stage.stage_id)}
                    onMouseLeave={() => setHoveredStage(null)}
                    title={`${stage.stage_name}: ${stage.deal_count} deals, ${formatCurrency(stage.total_value)}`}
                  >
                    {/* Show stage name only if segment is wide enough */}
                    {stage.percentage > 10 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                        <span className="text-xs font-bold text-[#1e1e2e] md:text-sm">
                          {stage.deal_count}
                        </span>
                        {stage.percentage > 15 && (
                          <span className="hidden text-[10px] font-medium text-[#1e1e2e] md:block">
                            {formatCurrency(stage.total_value)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stage Legend */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stagesWithPercentages.map((stage) => {
              const isHovered = hoveredStage === stage.stage_id

              return (
                <div
                  key={stage.stage_id}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    isHovered
                      ? 'border-[#F25C05] bg-[#F25C05]/10'
                      : 'border-[#313244] bg-[#1e1e2e] hover:border-[#45475a]'
                  }`}
                  onClick={() => handleStageClick(stage.stage_id)}
                  onMouseEnter={() => setHoveredStage(stage.stage_id)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Color Indicator */}
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-semibold text-[#cdd6f4]">
                      {stage.stage_name}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a6adc8]">Deals</span>
                      <span className="text-sm font-bold text-[#cdd6f4]">
                        {stage.deal_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a6adc8]">Value</span>
                      <span className="text-sm font-bold text-[#cdd6f4]">
                        {formatCurrency(stage.total_value)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a6adc8]">% of Total</span>
                      <span className="text-sm font-bold text-[#F25C05]">
                        {Math.round(stage.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
