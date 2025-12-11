import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/users/[id]/resend-invite - Resend user invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Check if current user is admin
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

  // Get the user's email from public.users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('id', id)
    .single()

  if (userError || !userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Resend invite using admin client
  const adminClient = createAdminClient()
  const { error: resendError } = await adminClient.auth.admin.inviteUserByEmail(
    userData.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    }
  )

  if (resendError) {
    console.error('Resend invite error:', resendError)
    return NextResponse.json({
      error: 'Failed to resend invitation',
      details: resendError.message
    }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
