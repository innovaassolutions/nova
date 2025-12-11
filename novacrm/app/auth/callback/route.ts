import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Check if this is a password recovery flow
  if (type === 'recovery') {
    return NextResponse.redirect(`${requestUrl.origin}/update-password`)
  }

  // Default: redirect to dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
