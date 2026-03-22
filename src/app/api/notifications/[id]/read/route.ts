import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/notifications/[id]/read — Mark one notification as read.
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  // Verify notification belongs to this user
  const { data: dbUser } = await admin.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await admin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('student_id', dbUser.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Marked as read' })
}
