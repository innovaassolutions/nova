import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const type = requestUrl.searchParams.get('type')

  // Handle auth errors (e.g., expired invite links)
  if (error || errorCode) {
    console.error('Auth callback error:', { error, errorCode, errorDescription })

    if (errorCode === 'otp_expired') {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=invite_expired&message=${encodeURIComponent('Your invite link has expired. Please request a new invitation.')}`
      )
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${error || errorCode}`
    )
  }

  if (code) {
    try {
      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            },
          },
        }
      )

      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
      }

      // Check if this is a password recovery flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/update-password`)
      }

      // Check if this is an invite acceptance (user confirming their email from invite)
      if (type === 'invite' || (data.user && data.user.user_metadata?.needs_password_setup === true)) {
        // Invited user confirmed email - redirect to password setup
        return NextResponse.redirect(`${requestUrl.origin}/update-password`)
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
    }
  }

  // Default: redirect to dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
