import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
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

  // Create response object to collect cookies
  let response = NextResponse.next({ request })
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
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Handle token_hash (PKCE flow for invites and password recovery)
  if (token_hash) {
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type === 'recovery' ? 'recovery' : 'invite',
      })

      if (verifyError) {
        console.error('Error verifying OTP:', verifyError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
      }

      // Check if this is a password recovery flow
      if (type === 'recovery') {
        response = NextResponse.redirect(`${requestUrl.origin}/update-password`)
        return response
      }

      // Check if this is an invite acceptance
      if (type === 'invite' || (data.user && data.user.user_metadata?.needs_password_setup === true)) {
        response = NextResponse.redirect(`${requestUrl.origin}/update-password`)
        return response
      }

      // Default after successful OTP verification
      response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      return response
    } catch (err) {
      console.error('Unexpected error verifying OTP:', err)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
    }
  }

  // Handle code (OAuth flow)
  if (code) {
    try {
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
      }

      // Check if this is a password recovery flow
      if (type === 'recovery') {
        response = NextResponse.redirect(`${requestUrl.origin}/update-password`)
        return response
      }

      // Check if this is an invite acceptance (user confirming their email from invite)
      if (type === 'invite' || (data.user && data.user.user_metadata?.needs_password_setup === true)) {
        // Invited user confirmed email - redirect to password setup
        response = NextResponse.redirect(`${requestUrl.origin}/update-password`)
        return response
      }

      // Default after successful code exchange
      response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      return response
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
    }
  }

  // Default: redirect to dashboard
  response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  return response
}
