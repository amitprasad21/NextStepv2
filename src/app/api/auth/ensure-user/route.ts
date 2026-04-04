import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/ensure-user
 * Ensures a public.users record exists for the authenticated user.
 * Uses session client for auth, service client for DB writes (bypasses RLS).
 *
 * Returns: { role, isNew, isComplete }
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createServiceClient()

  // Check if user record already exists
  const { data: existing } = await admin
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (existing) {
    // User exists — check profile completeness
    const { data: profile } = await admin
      .from('student_profiles')
      .select('is_complete')
      .eq('user_id', existing.id)
      .single()

    const isComplete = profile?.is_complete ?? false

    // Sync role + is_complete to JWT metadata so middleware can read them
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { role: existing.role },
      user_metadata: { is_complete: isComplete },
    })

    return NextResponse.json({
      role: existing.role,
      isNew: false,
      isComplete,
    })
  }

  // New user — create record with role='student' (NEVER admin)
  const { data: newUser, error: insertError } = await admin
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
    if (insertError.code === '23505') {
      const { data: raceUser } = await admin
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
    await admin.from('notifications').insert({
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
