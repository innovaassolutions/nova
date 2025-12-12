/**
 * Dashboard Page
 * Story 6.1: Dashboard Page with Four Key Stat Cards
 * AC1, AC2: Dashboard route, page header structure
 *
 * Protected route - requires authentication.
 * Displays four key pipeline metrics at a glance.
 *
 * Features Catppuccin Mocha dark theme with NovaCRM branding.
 * Protection: Middleware redirects unauthenticated users to /login
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardStats from '@/app/components/dashboard/DashboardStats'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // AC1: Double-check authentication (middleware should handle this)
  if (!user) {
    redirect('/login')
  }

  // AC1, AC9: Fetch dashboard stats from API using server-side fetch
  let statsData = null
  let error = null

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/dashboard/stats`, {
      // Use server-side fetch with cookies
      headers: {
        Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      cache: 'no-store', // Always fetch fresh data
    })

    if (response.ok) {
      statsData = await response.json()
    } else {
      error = 'Failed to load dashboard statistics'
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err)
    error = 'An error occurred while loading dashboard statistics'
  }

  return (
    <div className="w-full">
      {/* AC2: Page Header Structure */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Title and subtitle */}
          <div>
            <h1 className="text-[2rem] font-extrabold text-[#cdd6f4]">Dashboard</h1>
            <p className="text-base text-[#a6adc8]">Your sales pipeline at a glance</p>
          </div>

          {/* Right side: Last updated + Filter bar placeholder */}
          <div className="flex items-center gap-4">
            {/* AC2: Last updated indicator (static for MVP) */}
            <p className="text-sm text-[#6c7086]">Updated 2 minutes ago</p>

            {/* AC2: Filter bar placeholder (Story 6.4 will populate) */}
            <div className="text-sm text-[#6c7086]">
              {/* Filters will be added in Story 6.4 */}
            </div>
          </div>
        </div>
      </div>

      {/* AC3: Four Stat Cards Grid */}
      <DashboardStats data={statsData || undefined} error={error || undefined} />
    </div>
  )
}
