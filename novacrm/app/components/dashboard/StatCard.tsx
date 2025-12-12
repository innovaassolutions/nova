'use client'

/**
 * StatCard Component
 * Story 6.1: Dashboard Page with Four Key Stat Cards (Redesigned with Charts)
 * AC4, AC5, AC6, AC7, AC8: Stat Card specifications and hover interactions
 *
 * Reusable component for displaying dashboard statistics
 * Features Catppuccin Mocha theme with embedded visualizations
 * Mobile-first design with touch-friendly interactions
 */

import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon: ReactNode
  accentColor: string
  trend?: string
  trendUp?: boolean
  valueColor?: string
  chart?: ReactNode // Optional chart visualization
}

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  accentColor,
  trend,
  trendUp,
  valueColor = '#cdd6f4', // Mocha Text default
  chart,
}: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[#313244] bg-[#181825] p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
      style={{
        // 3px top accent bar with gradient
        background: `linear-gradient(to bottom, ${accentColor} 0%, ${accentColor} 3px, #181825 3px)`,
      }}
    >
      {/* Icon container - top right */}
      <div
        className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-[10px]"
        style={{
          backgroundColor: `${accentColor}26`, // 15% opacity (26 in hex)
        }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>

      {/* Label */}
      <p className="mb-2 text-sm font-semibold uppercase text-[#a6adc8]">{label}</p>

      {/* Value */}
      <p className="mb-3 text-[2rem] font-extrabold leading-none" style={{ color: valueColor }}>
        {value}
      </p>

      {/* Trend badge (if provided) */}
      {trend && (
        <div
          className="mb-2 inline-block rounded-md px-2 py-1 text-sm font-semibold"
          style={{
            backgroundColor: trendUp ? 'rgba(166, 227, 161, 0.15)' : 'rgba(243, 139, 168, 0.15)',
            color: trendUp ? '#a6e3a1' : '#f38ba8',
          }}
        >
          {trend}
        </div>
      )}

      {/* Chart visualization (if provided) */}
      {chart && <div className="mt-4">{chart}</div>}

      {/* Subtext */}
      {subtext && <p className="mt-2 text-sm text-[#a6adc8]">{subtext}</p>}
    </div>
  )
}
