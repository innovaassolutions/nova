'use client'

/**
 * DashboardStats Component
 * Story 6.1: Dashboard Page with Four Key Stat Cards (Redesigned with Charts)
 * AC3, AC11, AC12: Stats grid, loading state, error state
 *
 * Displays four stat cards with visual charts in a responsive grid layout
 * Features progress bars, comparison charts, donut charts, and radial gauges
 * Mobile-first design with touch-friendly visualizations
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
import { BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'

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

  // Chart data preparation
  const pipelineGoal = 1000000 // $1M goal (can be made dynamic later)
  const pipelineProgress = (data.total_pipeline_value / pipelineGoal) * 100

  // Card 1: Progress bar showing value vs goal
  const progressBarData = [
    { name: 'Current', value: data.total_pipeline_value, fill: '#F25C05' },
    { name: 'Remaining', value: Math.max(0, pipelineGoal - data.total_pipeline_value), fill: '#313244' },
  ]

  // Card 2: Comparison bar chart (weighted vs total)
  const comparisonData = [
    { name: 'Weighted', value: data.weighted_pipeline_value, fill: '#F25C05' },
    { name: 'Total', value: data.total_pipeline_value, fill: '#89b4fa' },
  ]

  // Card 3: Donut chart for deals breakdown
  const dealsBreakdownData = [
    { name: 'Closing Soon', value: data.closing_soon_count, fill: '#F25C05' },
    { name: 'Other Open', value: Math.max(0, data.open_deals_count - data.closing_soon_count), fill: '#94e2d5' },
  ]

  // Card 4: Radial progress for win rate
  const winRateData = [
    {
      name: 'Win Rate',
      value: data.win_rate,
      fill: data.win_rate >= 50 ? '#a6e3a1' : data.win_rate >= 30 ? '#F25C05' : '#f38ba8',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {/* AC4: Card 1 - Total Pipeline Value with Progress Bar */}
      <StatCard
        label="Total Pipeline Value"
        value={formatCurrency(data.total_pipeline_value)}
        trend={data.total_pipeline_trend}
        trendUp={data.total_pipeline_trend.includes('↑')}
        icon={<CurrencyDollarIcon className="size-6" strokeWidth={2} />}
        accentColor="#F25C05"
        subtext={`${pipelineProgress.toFixed(0)}% of ${formatCurrency(pipelineGoal)} goal`}
        chart={
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={progressBarData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={20}>
                {progressBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        }
      />

      {/* AC5: Card 2 - Weighted Pipeline Value with Comparison Chart */}
      <StatCard
        label="Weighted Value (Probability-Adjusted)"
        value={formatCurrency(data.weighted_pipeline_value)}
        subtext={`${formatPercentage(data.average_probability)} avg probability`}
        icon={<ChartBarIcon className="size-6" strokeWidth={2} />}
        accentColor="#89b4fa"
        valueColor="#F25C05"
        chart={
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={comparisonData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        }
      />

      {/* AC6: Card 3 - Open Deals with Donut Chart */}
      <StatCard
        label="Open Deals"
        value={data.open_deals_count.toString()}
        subtext={`${data.closing_soon_count} closing this week`}
        icon={<BriefcaseIcon className="size-6" strokeWidth={2} />}
        accentColor="#94e2d5"
        chart={
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie
                data={dealsBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {dealsBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        }
      />

      {/* AC7: Card 4 - Win Rate with Radial Progress */}
      <StatCard
        label="Win Rate (Last 30 Days)"
        value={data.win_rate > 0 ? formatPercentage(data.win_rate) : 'N/A'}
        subtext={`${data.won_count} won, ${data.lost_count} lost`}
        icon={<TrophyIcon className="size-6" strokeWidth={2} />}
        accentColor="#b4befe"
        chart={
          <ResponsiveContainer width="100%" height={100}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={winRateData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background={{ fill: '#313244' }}
                dataKey="value"
                cornerRadius={10}
                max={100}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        }
      />
    </div>
  )
}
