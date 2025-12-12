'use client'

import React from 'react'

/**
 * MetricCard Component
 *
 * Story: 4.5 - Pipeline Value Calculation & Deal Metrics
 * Acceptance Criteria: AC1-AC5
 *
 * Displays a metric card with label, value, and optional subtext
 * Follows UX Design specifications for Mocha theme colors and responsive layout
 */

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  valueColor?: string
  subtextColor?: string
  tooltip?: string
}

export default function MetricCard({
  label,
  value,
  subtext,
  valueColor = 'text-[#cdd6f4]', // Mocha Text
  subtextColor = 'text-[#6c7086]', // Mocha Subtext0
}: MetricCardProps) {
  // AC2: Format currency if value is a number
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val)
    }
    return val
  }

  return (
    <div
      className="bg-[#181825] border border-[#313244] rounded-xl p-6
                 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]
                 transition-shadow duration-200
                 flex flex-col justify-between h-full"
    >
      {/* AC1: Label */}
      <div className="text-[#a6adc8] text-sm font-semibold mb-3">
        {label}
      </div>

      {/* AC2-AC5: Value */}
      <div className={`text-3xl md:text-4xl font-extrabold ${valueColor} mb-2`}>
        {formatValue(value)}
      </div>

      {/* AC2-AC5: Subtext (optional) */}
      {subtext && (
        <div className={`text-xs ${subtextColor}`}>
          {subtext}
        </div>
      )}
    </div>
  )
}
