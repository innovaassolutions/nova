'use client'

/**
 * DashboardFilters Component
 * Story 6.4: Dashboard Filters (Date Range, Owner, Campaign)
 *
 * Three filter controls that apply to all dashboard components
 * with URL param sync for shareable filtered views
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  name: string
}

interface Campaign {
  id: string
  name: string
}

interface DashboardFiltersProps {
  onFiltersChange: (filters: {
    owner_id?: string
    campaign_id?: string
    start_date?: string
    end_date?: string
  }) => void
}

export default function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Filter states
  const [dateRange, setDateRange] = useState<string>('all')
  const [ownerId, setOwnerId] = useState<string>('all')
  const [campaignId, setCampaignId] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Load initial data
  useEffect(() => {
    loadFilterData()
    loadFiltersFromURL()
  }, [])

  const loadFilterData = async () => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }

    // Fetch all users (owners)
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name')
      .order('name', { ascending: true })

    if (usersData) {
      setUsers(usersData)
    }

    // Fetch all campaigns
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('id, name')
      .order('name', { ascending: true })

    if (campaignsData) {
      setCampaigns(campaignsData)
    }
  }

  const loadFiltersFromURL = () => {
    const urlOwnerId = searchParams.get('owner_id')
    const urlCampaignId = searchParams.get('campaign_id')
    const urlStartDate = searchParams.get('start_date')
    const urlEndDate = searchParams.get('end_date')

    if (urlOwnerId) setOwnerId(urlOwnerId)
    if (urlCampaignId) setCampaignId(urlCampaignId)
    if (urlStartDate && urlEndDate) {
      setDateRange('custom')
      setCustomStartDate(urlStartDate)
      setCustomEndDate(urlEndDate)
    }
  }

  const getDateRangeDates = (range: string): { start_date?: string; end_date?: string } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (range) {
      case 'this_month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return {
          start_date: startOfMonth.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0],
        }
      }
      case 'last_month': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          start_date: startOfLastMonth.toISOString().split('T')[0],
          end_date: endOfLastMonth.toISOString().split('T')[0],
        }
      }
      case 'this_quarter': {
        const quarter = Math.floor(now.getMonth() / 3)
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1)
        return {
          start_date: startOfQuarter.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0],
        }
      }
      case 'last_quarter': {
        const quarter = Math.floor(now.getMonth() / 3)
        const startOfLastQuarter = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        const endOfLastQuarter = new Date(now.getFullYear(), quarter * 3, 0)
        return {
          start_date: startOfLastQuarter.toISOString().split('T')[0],
          end_date: endOfLastQuarter.toISOString().split('T')[0],
        }
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return {
            start_date: customStartDate,
            end_date: customEndDate,
          }
        }
        return {}
      }
      default:
        return {}
    }
  }

  const applyFilters = () => {
    const dateRangeDates = getDateRangeDates(dateRange)

    const filters: {
      owner_id?: string
      campaign_id?: string
      start_date?: string
      end_date?: string
    } = {}

    if (ownerId !== 'all') {
      if (ownerId === 'my_deals' && currentUserId) {
        filters.owner_id = currentUserId
      } else {
        filters.owner_id = ownerId
      }
    }

    if (campaignId !== 'all') {
      filters.campaign_id = campaignId
    }

    if (dateRangeDates.start_date) filters.start_date = dateRangeDates.start_date
    if (dateRangeDates.end_date) filters.end_date = dateRangeDates.end_date

    // Update URL params
    const params = new URLSearchParams()
    if (filters.owner_id) params.set('owner_id', filters.owner_id)
    if (filters.campaign_id) params.set('campaign_id', filters.campaign_id)
    if (filters.start_date) params.set('start_date', filters.start_date)
    if (filters.end_date) params.set('end_date', filters.end_date)

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : window.location.pathname)

    // Notify parent component
    onFiltersChange(filters)

    // Close filters on mobile
    setIsOpen(false)
  }

  const clearAllFilters = () => {
    setDateRange('all')
    setOwnerId('all')
    setCampaignId('all')
    setCustomStartDate('')
    setCustomEndDate('')
    router.push(window.location.pathname)
    onFiltersChange({})
  }

  const clearFilter = (filterType: 'date' | 'owner' | 'campaign') => {
    switch (filterType) {
      case 'date':
        setDateRange('all')
        setCustomStartDate('')
        setCustomEndDate('')
        break
      case 'owner':
        setOwnerId('all')
        break
      case 'campaign':
        setCampaignId('all')
        break
    }

    // Reapply filters after clearing one
    setTimeout(() => applyFilters(), 0)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (dateRange !== 'all') count++
    if (ownerId !== 'all') count++
    if (campaignId !== 'all') count++
    return count
  }

  const getFilterLabel = (filterType: 'date' | 'owner' | 'campaign') => {
    switch (filterType) {
      case 'date': {
        if (dateRange === 'all') return null
        if (dateRange === 'this_month') return 'This Month'
        if (dateRange === 'last_month') return 'Last Month'
        if (dateRange === 'this_quarter') return 'This Quarter'
        if (dateRange === 'last_quarter') return 'Last Quarter'
        if (dateRange === 'custom' && customStartDate && customEndDate) {
          return `${customStartDate} to ${customEndDate}`
        }
        return null
      }
      case 'owner': {
        if (ownerId === 'all') return null
        if (ownerId === 'my_deals') return 'My Deals'
        const user = users.find((u) => u.id === ownerId)
        return user ? user.name : null
      }
      case 'campaign': {
        if (campaignId === 'all') return null
        const campaign = campaigns.find((c) => c.id === campaignId)
        return campaign ? campaign.name : null
      }
    }
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div>
      {/* Mobile: Filter Toggle Button */}
      <div className="block md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-all hover:bg-[#313244] active:scale-95"
        >
          <FunnelIcon className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-[#F25C05] px-2 py-0.5 text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Controls */}
      <div
        className={`mt-4 space-y-4 md:mt-0 md:flex md:items-end md:gap-4 md:space-y-0 ${
          isOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {/* Date Range Filter */}
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[#a6adc8]">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-[#cdd6f4] transition-all focus:border-[#F25C05] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/20"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && (
          <>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-[#a6adc8]">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-[#cdd6f4] transition-all focus:border-[#F25C05] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/20"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-[#a6adc8]">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-[#cdd6f4] transition-all focus:border-[#F25C05] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/20"
              />
            </div>
          </>
        )}

        {/* Owner Filter */}
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[#a6adc8]">Owner</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-[#cdd6f4] transition-all focus:border-[#F25C05] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/20"
          >
            <option value="all">All Owners</option>
            <option value="my_deals">My Deals</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Filter */}
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[#a6adc8]">Campaign</label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-[#cdd6f4] transition-all focus:border-[#F25C05] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/20"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="w-full rounded-lg bg-[#F25C05] px-6 py-2 font-medium text-white transition-all hover:bg-[#ff6b1a] active:scale-[0.98] md:w-auto"
        >
          Apply
        </button>
      </div>

      {/* Filter Pills */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {getFilterLabel('date') && (
            <div className="flex items-center gap-2 rounded-full border border-[#313244] bg-[#181825] px-3 py-1 text-sm">
              <span className="text-[#a6adc8]">Date:</span>
              <span className="text-[#cdd6f4]">{getFilterLabel('date')}</span>
              <button
                onClick={() => clearFilter('date')}
                className="ml-1 text-[#6c7086] transition-colors hover:text-[#cdd6f4]"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {getFilterLabel('owner') && (
            <div className="flex items-center gap-2 rounded-full border border-[#313244] bg-[#181825] px-3 py-1 text-sm">
              <span className="text-[#a6adc8]">Owner:</span>
              <span className="text-[#cdd6f4]">{getFilterLabel('owner')}</span>
              <button
                onClick={() => clearFilter('owner')}
                className="ml-1 text-[#6c7086] transition-colors hover:text-[#cdd6f4]"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {getFilterLabel('campaign') && (
            <div className="flex items-center gap-2 rounded-full border border-[#313244] bg-[#181825] px-3 py-1 text-sm">
              <span className="text-[#a6adc8]">Campaign:</span>
              <span className="text-[#cdd6f4]">{getFilterLabel('campaign')}</span>
              <button
                onClick={() => clearFilter('campaign')}
                className="ml-1 text-[#6c7086] transition-colors hover:text-[#cdd6f4]"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={clearAllFilters}
            className="text-sm font-medium text-[#F25C05] transition-colors hover:text-[#ff6b1a]"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}
