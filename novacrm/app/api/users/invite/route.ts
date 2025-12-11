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
  const { email, full_name, role, send_email } = await request.json()

  // 3. Validate inputs
  if (!email || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['admin', 'sales_rep', 'executive'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // 4. Create user via Supabase Admin API
  const adminClient = createAdminClient()

  // Create user with a temporary password and auto-confirm email
  const tempPassword = Math.random().toString(36).slice(-12) + 'A1!' // Random temp password

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm so user can log in
    user_metadata: {
      full_name,
      role,
      needs_password_setup: true
    }
  })

  if (createError || !newUser) {
    console.error('User creation error:', createError)
    return NextResponse.json({
      error: 'Failed to create user',
      details: createError?.message || 'Unknown error'
    }, { status: 500 })
  }

  // 5. User is automatically created in public.users via trigger
  // Trigger: on_auth_user_created (from Story 1.7)

  // 6. Send password reset email so they can set their own password
  try {
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery`
      }
    )

    if (resetError) {
      console.error('Password reset email error:', resetError)
      // User is created but email failed - they can request password reset manually
    }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.user.id,
      email: newUser.user.email,
      status: 'pending'
    }
  })
}
