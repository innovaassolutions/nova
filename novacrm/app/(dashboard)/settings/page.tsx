'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  UserGroupIcon,
  MegaphoneIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import UserManagementTab from './components/UserManagementTab'

interface SettingsTab {
  id: 'users' | 'campaigns' | 'pipeline-stages'
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly: boolean
}

const tabs: SettingsTab[] = [
  { id: 'users', label: 'User Management', icon: UserGroupIcon, adminOnly: true },
  { id: 'campaigns', label: 'Campaigns', icon: MegaphoneIcon, adminOnly: false },
  { id: 'pipeline-stages', label: 'Pipeline Stages', icon: ChartBarIcon, adminOnly: true },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'campaigns' | 'pipeline-stages'>('users')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUserRole() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      setUserRole(userData?.role || 'sales_rep')
      setLoading(false)

      // If non-admin and on admin-only tab, switch to campaigns
      if (userData?.role !== 'admin' && tabs.find(t => t.id === activeTab)?.adminOnly) {
        setActiveTab('campaigns')
      }
    }

    checkUserRole()
  }, [])

  // Redirect to campaigns page when campaigns tab is active
  useEffect(() => {
    if (activeTab === 'campaigns') {
      router.push('/settings/campaigns')
    }
  }, [activeTab, router])

  const visibleTabs = tabs.filter(tab => {
    if (tab.adminOnly && userRole !== 'admin') {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-mocha-subtext0">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-800 text-mocha-text">Settings</h1>
        <p className="text-mocha-subtext0 mt-2">
          Manage your NovaCRM configuration and team settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-mocha-surface0 mb-6">
        <div className="flex gap-8">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors duration-200
                  ${
                    isActive
                      ? 'border-innovaas-orange text-innovaas-orange'
                      : 'border-transparent text-mocha-subtext0 hover:text-mocha-text'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-600">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-mocha-mantle rounded-lg p-8">
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'campaigns' && (
          <div className="text-mocha-subtext0">
            Redirecting to Campaign Management...
          </div>
        )}
        {activeTab === 'pipeline-stages' && (
          <div className="text-mocha-subtext0">
            Pipeline stages configuration coming in V2.0
          </div>
        )}
      </div>
    </div>
  )
}
