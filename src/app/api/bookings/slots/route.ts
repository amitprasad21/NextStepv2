import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/bookings/slots — Available slots for students. ?date=YYYY-MM-DD
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = admin
    .from('counselling_slots')
    .select('*')
    .eq('is_available', true)
    .order('slot_date')
    .order('slot_time')

  if (date) {
    query = query.eq('slot_date', date)
  } else {
    // Default: show upcoming slots
    query = query.gte('slot_date', new Date().toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
