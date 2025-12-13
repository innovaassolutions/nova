import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * useUserRole Hook
 * Story 6.5: Executive Read-Only Dashboard View
 *
 * Fetches and returns the current user's role for conditional UI rendering
 */
export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      // Fetch user role from users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } else {
        setRole(userData?.role || 'sales_rep')
      }
    } catch (err) {
      console.error('Error in useUserRole:', err)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  const isExecutive = role === 'executive'
  const isAdmin = role === 'admin'
  const isSalesRep = role === 'sales_rep'

  return {
    role,
    loading,
    isExecutive,
    isAdmin,
    isSalesRep,
  }
}
