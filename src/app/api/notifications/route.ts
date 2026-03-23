import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/notifications — In-app notifications. ?unread=true filter.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  const { data: dbUser } = await admin.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  let query = admin
    .from('notifications')
    .select('*')
    .eq('student_id', dbUser.id)
    .eq('channel', 'in_app')
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
