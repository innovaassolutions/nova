import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

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

  // Fetch all users from public.users
  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (publicError) {
    return NextResponse.json({ error: publicError.message }, { status: 500 })
  }

  if (!publicUsers || publicUsers.length === 0) {
    return NextResponse.json({ users: [] })
  }

  // Fetch auth details for each user using admin API
  const adminClient = createAdminClient()
  const usersWithStatus = await Promise.all(
    publicUsers.map(async (user) => {
      const { data: authData } = await adminClient.auth.admin.getUserById(user.id)

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: authData?.user?.email_confirmed_at ? 'active' : 'pending',
        created_at: user.created_at,
        last_sign_in_at: authData?.user?.last_sign_in_at || null,
      }
    })
  )

  return NextResponse.json({ users: usersWithStatus })
}
