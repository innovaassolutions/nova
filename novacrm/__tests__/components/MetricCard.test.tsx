/**
 * Unit Tests for MetricCard Component
 *
 * Story: 4.5 - Pipeline Value Calculation & Deal Metrics
 *
 * Test Coverage:
 * - AC1: Card layout and styling
 * - AC2-AC5: Value formatting and display
 * - Responsive design
 * - Currency formatting
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from '@/app/(dashboard)/components/MetricCard'

describe('MetricCard', () => {
  describe('AC1: Basic Rendering', () => {
    it('should render label, value, and subtext', () => {
      render(
        <MetricCard
          label="Total Pipeline Value"
          value={650000}
          subtext="↑ 15% vs Last Month"
        />
      )

      expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument()
      expect(screen.getByText('$650,000')).toBeInTheDocument()
      expect(screen.getByText('↑ 15% vs Last Month')).toBeInTheDocument()
    })

    it('should render without subtext', () => {
      render(
        <MetricCard
          label="Open Deals"
          value={18}
        />
      )

      expect(screen.getByText('Open Deals')).toBeInTheDocument()
      expect(screen.getByText('$18')).toBeInTheDocument()
    })
  })

  describe('AC2: Currency Formatting', () => {
    it('should format large numbers with commas', () => {
      render(
        <MetricCard
          label="Total Value"
          value={1250500}
        />
      )

      expect(screen.getByText('$1,250,500')).toBeInTheDocument()
    })

    it('should format numbers without decimal places', () => {
      render(
        <MetricCard
          label="Average Deal"
          value={36111.67}
        />
      )

      // Should round to nearest dollar
      expect(screen.getByText('$36,112')).toBeInTheDocument()
    })

    it('should handle zero value', () => {
      render(
        <MetricCard
          label="Pipeline Value"
          value={0}
        />
      )

      expect(screen.getByText('$0')).toBeInTheDocument()
    })
  })

  describe('AC3: Custom Colors', () => {
    it('should apply custom value color', () => {
      const { container } = render(
        <MetricCard
          label="Weighted Value"
          value={405000}
          valueColor="text-[#F25C05]"
        />
      )

      const valueElement = screen.getByText('$405,000')
      expect(valueElement).toHaveClass('text-[#F25C05]')
    })

    it('should apply custom subtext color', () => {
      const { container } = render(
        <MetricCard
          label="Open Deals"
          value={18}
          subtext="3 closing soon"
          subtextColor="text-[#F25C05]"
        />
      )

      const subtextElement = screen.getByText('3 closing soon')
      expect(subtextElement).toHaveClass('text-[#F25C05]')
    })
  })

  describe('AC4: String Values', () => {
    it('should display string values without currency formatting', () => {
      render(
        <MetricCard
          label="Status"
          value="Active"
        />
      )

      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have Mocha theme background and border', () => {
      const { container } = render(
        <MetricCard
          label="Test"
          value={100}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('bg-[#181825]')
      expect(card).toHaveClass('border-[#313244]')
      expect(card).toHaveClass('rounded-xl')
    })

    it('should have hover effect', () => {
      const { container } = render(
        <MetricCard
          label="Test"
          value={100}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]')
    })
  })
})
