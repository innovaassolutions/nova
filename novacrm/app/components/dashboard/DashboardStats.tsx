'use client'

/**
 * DashboardStats Component
 * Story 6.1: Dashboard Page with Four Key Stat Cards
 * AC3, AC11, AC12: Stats grid, loading state, error state
 *
 * Displays four stat cards in a responsive grid layout
 * Handles loading and error states
 */

import StatCard from './StatCard'
import SkeletonCard from './SkeletonCard'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BriefcaseIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'

interface DashboardStatsData {
  total_pipeline_value: number
  total_pipeline_trend: string
  weighted_pipeline_value: number
  average_probability: number
  open_deals_count: number
  closing_soon_count: number
  win_rate: number
  won_count: number
  lost_count: number
}

interface DashboardStatsProps {
  data?: DashboardStatsData
  isLoading?: boolean
  error?: string
  onRetry?: () => void
}

export default function DashboardStats({
  data,
  isLoading = false,
  error,
  onRetry,
}: DashboardStatsProps) {
  // AC11: Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  // AC12: Error state - show error message with retry button
  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full rounded-xl border border-[#313244] bg-[#181825] p-8 text-center">
          <p className="mb-4 text-lg text-[#cdd6f4]">Unable to load dashboard statistics</p>
          <p className="mb-6 text-sm text-[#a6adc8]">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-[#F25C05] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D64F04]"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  // AC15: Handle no data case
  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full rounded-xl border border-[#313244] bg-[#181825] p-8 text-center">
          <p className="text-lg text-[#cdd6f4]">No data available</p>
        </div>
      </div>
    )
  }

  // AC3, AC13: Responsive grid layout
  // Desktop (>1024px): 4 columns
  // Tablet (768-1024px): 2×2 grid
  // Mobile (<768px): 1 column
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {/* AC4: Card 1 - Total Pipeline Value */}
      <StatCard
        label="Total Pipeline Value"
        value={formatCurrency(data.total_pipeline_value)}
        trend={data.total_pipeline_trend}
        trendUp={data.total_pipeline_trend.includes('↑')}
        icon={<CurrencyDollarIcon className="size-6" strokeWidth={2} />}
        accentColor="#F25C05" // Innovaas Orange
      />

      {/* AC5: Card 2 - Weighted Pipeline Value */}
      <StatCard
        label="Weighted Value (Probability-Adjusted)"
        value={formatCurrency(data.weighted_pipeline_value)}
        subtext={`${formatPercentage(data.average_probability)} avg probability`}
        icon={<ChartBarIcon className="size-6" strokeWidth={2} />}
        accentColor="#89b4fa" // Mocha Blue
        valueColor="#F25C05" // Orange for emphasis
      />

      {/* AC6: Card 3 - Open Deals Count */}
      <StatCard
        label="Open Deals"
        value={data.open_deals_count.toString()}
        subtext={`${data.closing_soon_count} closing this week`}
        icon={<BriefcaseIcon className="size-6" strokeWidth={2} />}
        accentColor="#94e2d5" // Mocha Teal
      />

      {/* AC7: Card 4 - Win Rate */}
      <StatCard
        label="Win Rate (Last 30 Days)"
        value={data.win_rate > 0 ? formatPercentage(data.win_rate) : 'N/A'}
        subtext={`${data.won_count} won, ${data.lost_count} lost`}
        icon={<TrophyIcon className="size-6" strokeWidth={2} />}
        accentColor="#b4befe" // Mocha Lavender
      />
    </div>
  )
}
