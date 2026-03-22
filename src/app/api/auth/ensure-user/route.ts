import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/ensure-user
 * Ensures a public.users record exists for the authenticated user.
 * Called after password-based sign-in to handle cases where
 * the user record wasn't created during the callback flow.
 *
 * Returns: { role, isNew, isComplete }
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user record already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (existing) {
    // User exists — check profile completeness
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('is_complete')
      .eq('user_id', existing.id)
      .single()

    return NextResponse.json({
      role: existing.role,
      isNew: false,
      isComplete: profile?.is_complete ?? false,
    })
  }

  // New user — create record with role='student' (NEVER admin)
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      auth_id: user.id,
      email: user.email!,
      role: 'student',
      is_verified: true,
    })
    .select('id')
    .single()

  if (insertError) {
    // Handle race condition: record was created between our check and insert
    if (insertError.code === '23505') {
      const { data: raceUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', user.id)
        .single()

      return NextResponse.json({
        role: raceUser?.role ?? 'student',
        isNew: false,
        isComplete: false,
      })
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Send welcome notification
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

  return NextResponse.json({
    role: 'student',
    isNew: true,
    isComplete: false,
  })
}
