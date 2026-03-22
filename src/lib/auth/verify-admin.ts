import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Layer 2 check: call at the top of every admin API handler.
 * Reads role from public.users — NEVER from JWT metadata.
 */
export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Read role from DB — NEVER from user.user_metadata
  const { data } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (!data || data.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { adminDbId: data.id }
}
