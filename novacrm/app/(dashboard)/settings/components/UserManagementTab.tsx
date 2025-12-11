'use client'

import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import InviteUserModal from './InviteUserModal'

interface UserRecord {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales_rep' | 'executive'
  status: 'active' | 'pending'
  created_at: string
  last_sign_in_at: string | null
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-mocha-blue/10 text-mocha-blue',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    orange: 'bg-innovaas-orange/10 text-innovaas-orange',
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-mocha-surface0 border border-mocha-surface1 rounded-lg">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-mocha-subtext0">{label}</p>
        <p className="text-2xl font-800 text-mocha-text">{value}</p>
      </div>
    </div>
  )
}

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const badgeClasses = {
    admin: 'bg-innovaas-orange/10 text-innovaas-orange border-innovaas-orange/20',
    sales_rep: 'bg-mocha-blue/10 text-mocha-blue border-mocha-blue/20',
    executive: 'bg-green-500/10 text-green-500 border-green-500/20',
  }

  const labels = {
    admin: 'Admin',
    sales_rep: 'Sales Rep',
    executive: 'Executive',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-600 border ${badgeClasses[role as keyof typeof badgeClasses]}`}>
      {labels[role as keyof typeof labels] || role}
    </span>
  )
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-600 bg-green-500/10 text-green-500 border border-green-500/20">
        Active
      </span>
    )
  }

  return (
    <span className="px-3 py-1 rounded-full text-xs font-600 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
      Pending Invitation
    </span>
  )
}

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  })

  const fetchUsers = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (!response.ok) {
        console.error('Error fetching users:', data.error)
        setLoading(false)
        return
      }

      const usersWithStatus = data.users as UserRecord[]

      setUsers(usersWithStatus)

      // Calculate stats
      const activeCount = usersWithStatus.filter(u => u.status === 'active').length
      const pendingCount = usersWithStatus.filter(u => u.status === 'pending').length

      setStats({
        total: usersWithStatus.length,
        active: activeCount,
        pending: pendingCount,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'Never'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const handleInviteSuccess = () => {
    setShowInviteModal(false)
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-mocha-subtext0">Loading users...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Invite Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-800 text-mocha-text">Team Members</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-innovaas-orange hover:bg-innovaas-orange-soft
                     text-white px-4 py-2 rounded-lg font-600
                     transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          Invite User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          label="Active Users"
          value={stats.active}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          label="Pending Invitations"
          value={stats.pending}
          icon={ClockIcon}
          color="yellow"
        />
      </div>

      {/* User List Table */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-mocha-surface0 border border-mocha-surface1 rounded-lg">
          <UserGroupIcon className="w-16 h-16 text-mocha-overlay0 mx-auto mb-4" />
          <p className="text-mocha-text font-600 mb-2">No team members yet</p>
          <p className="text-mocha-subtext0 mb-6">
            Invite your first user to get started!
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-innovaas-orange hover:bg-innovaas-orange-soft
                       text-white px-6 py-3 rounded-lg font-600
                       transition-colors duration-200"
          >
            Invite User
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mocha-surface1">
                <th className="text-left py-3 px-4 text-sm font-600 text-mocha-subtext0">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-600 text-mocha-subtext0">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-600 text-mocha-subtext0">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-600 text-mocha-subtext0">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-600 text-mocha-subtext0">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-mocha-surface0 hover:bg-mocha-surface0/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="text-mocha-text font-600">{user.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-mocha-subtext0 text-sm">{user.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-mocha-subtext0 text-sm">
                      {formatRelativeTime(user.last_sign_in_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  )
}
