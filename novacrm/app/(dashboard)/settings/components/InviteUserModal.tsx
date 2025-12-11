'use client'

import { useState, FormEvent } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface InviteUserModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function InviteUserModal({ onClose, onSuccess }: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'sales_rep' as 'admin' | 'sales_rep' | 'executive',
    send_email: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite user')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user')
      setLoading(false)
    }
  }

  const roleDescriptions = {
    sales_rep: 'Can create/edit contacts, deals, and activities',
    admin: 'Full access including user management and settings',
    executive: 'Read-only access to dashboard and reports (V2.0)',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-mocha-base border border-mocha-surface0 rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-mocha-surface0">
          <h2 className="text-2xl font-800 text-mocha-text">Invite User</h2>
          <button
            onClick={onClose}
            className="text-mocha-subtext0 hover:text-mocha-text transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-sm font-600 text-mocha-text mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-mocha-surface0 border border-mocha-surface1
                         rounded-lg text-mocha-text placeholder-mocha-overlay0
                         focus:border-innovaas-orange focus:ring-2 focus:ring-innovaas-orange/20
                         outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-600 text-mocha-text mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@innovaas.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-mocha-surface0 border border-mocha-surface1
                         rounded-lg text-mocha-text placeholder-mocha-overlay0
                         focus:border-innovaas-orange focus:ring-2 focus:ring-innovaas-orange/20
                         outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Role */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-600 text-mocha-text mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as typeof formData.role })}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-mocha-surface0 border border-mocha-surface1
                         rounded-lg text-mocha-text
                         focus:border-innovaas-orange focus:ring-2 focus:ring-innovaas-orange/20
                         outline-none transition-all disabled:opacity-50"
            >
              <option value="sales_rep">Sales Representative</option>
              <option value="admin">Administrator</option>
              <option value="executive">Executive (Read-Only)</option>
            </select>
            <p className="mt-2 text-xs text-mocha-subtext0">
              {roleDescriptions[formData.role]}
            </p>
          </div>

          {/* Send Welcome Email */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.send_email}
                onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                disabled={loading}
                className="w-4 h-4 text-innovaas-orange bg-mocha-surface0 border-mocha-surface1
                           rounded focus:ring-2 focus:ring-innovaas-orange/20"
              />
              <span className="text-sm text-mocha-text">
                Send invitation email with password setup link
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-mocha-surface0 hover:bg-mocha-surface1
                         text-mocha-text rounded-lg font-600
                         transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-innovaas-orange hover:bg-innovaas-orange-soft
                         text-white rounded-lg font-600
                         transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Inviting...
                </>
              ) : (
                'Invite User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
