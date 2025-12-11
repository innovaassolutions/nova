import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // 1. Check if current user is admin
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: currentUserData } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (currentUserData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  // 2. Parse request body
  const { email, full_name, role } = await request.json()

  // 3. Validate inputs
  if (!email || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['admin', 'sales_rep', 'executive'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // 4. Invite user via Supabase Admin API
  const adminClient = createAdminClient()

  // Use inviteUserByEmail which handles the complete invite flow
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name,
        role,
        needs_password_setup: true
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  )

  if (inviteError || !inviteData) {
    console.error('Invitation error:', inviteError)
    return NextResponse.json({
      error: 'Failed to invite user',
      details: inviteError?.message || 'Unknown error'
    }, { status: 500 })
  }

  // 5. User is automatically created in public.users via trigger
  // Trigger: on_auth_user_created (from Story 1.7)

  return NextResponse.json({
    success: true,
    user: {
      id: inviteData.user.id,
      email: inviteData.user.email,
      status: 'pending'
    }
  })
}
