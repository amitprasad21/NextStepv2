import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Auth callback handler — handles magic link, Google OAuth, AND email confirmation.
 * Uses the service-role client for DB writes (bypasses RLS).
 * Uses the session client for auth token exchange.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    // Session client — for exchanging auth code
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore — may be called from Server Component context
            }
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData.user) {
      const authUser = sessionData.user
      // Service client for DB writes — bypasses RLS
      const admin = createServiceClient()

      // Check if user record already exists
      const { data: existingUser } = await admin
        .from('users')
        .select('id, role')
        .eq('auth_id', authUser.id)
        .single()

      let role = 'student'
      let isNewUser = false

      if (!existingUser) {
        isNewUser = true
        const { error: insertError } = await admin.from('users').insert({
          auth_id: authUser.id,
          email: authUser.email!,
          role: 'student',
          is_verified: true,
        })

        if (insertError) {
          if (insertError.code !== '23505') {
            console.error('Error creating user record:', insertError.message)
          }
          const { data: raceUser } = await admin
            .from('users')
            .select('id, role')
            .eq('auth_id', authUser.id)
            .single()

          if (raceUser) {
            role = raceUser.role
            isNewUser = false
          }
        } else {
          // Send welcome notification
          const { data: newUser } = await admin
            .from('users')
            .select('id')
            .eq('auth_id', authUser.id)
            .single()

          if (newUser) {
            await admin.from('notifications').insert({
              student_id: newUser.id,
              type: 'welcome',
              channel: 'in_app',
              message: 'Welcome to NextStep! Complete your profile to get started.',
              delivery_status: 'sent',
              sent_at: new Date().toISOString(),
            })
          }
        }
      } else {
        role = existingUser.role
      }

      // Redirect based on role — ALWAYS read from DB, never metadata
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', origin))
      }

      if (isNewUser) {
        return NextResponse.redirect(new URL('/onboarding', origin))
      }

      // Existing student — check is_complete
      if (existingUser) {
        const { data: profile } = await admin
          .from('student_profiles')
          .select('is_complete')
          .eq('user_id', existingUser.id)
          .single()

        if (!profile || !profile.is_complete) {
          return NextResponse.redirect(new URL('/onboarding', origin))
        }
      }

      return NextResponse.redirect(new URL('/dashboard', origin))
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
}
