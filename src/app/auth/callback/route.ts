import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Auth callback handler — handles magic link, Google OAuth, AND email confirmation.
 * After Supabase sends a magic link, Google redirects, or email is confirmed,
 * the user lands here with a `code` query param. We exchange it for a session,
 * upsert the public.users record, and redirect based on DB role.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
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

      // Upsert public.users — role defaults to 'student' for new users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', authUser.id)
        .single()

      let role = 'student'
      let isNewUser = false

      if (!existingUser) {
        // New user — insert with role='student'
        isNewUser = true
        const { error: insertError } = await supabase.from('users').insert({
          auth_id: authUser.id,
          email: authUser.email!,
          role: 'student',
          is_verified: true,
        })

        if (insertError) {
          // Race condition: user might have been created between check and insert
          if (insertError.code !== '23505') {
            console.error('Error creating user record:', insertError.message)
          }
          // Re-fetch to get whatever record exists
          const { data: raceUser } = await supabase
            .from('users')
            .select('id, role')
            .eq('auth_id', authUser.id)
            .single()

          if (raceUser) {
            role = raceUser.role
            isNewUser = false
          }
        } else {
          // Dispatch welcome notification
          const { data: newUser } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', authUser.id)
            .single()

          if (newUser) {
            await supabase.from('notifications').insert({
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
        const { data: profile } = await supabase
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

  // Auth error — redirect to login with error
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
}
