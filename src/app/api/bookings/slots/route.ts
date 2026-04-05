import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ensureUpcomingSlots } from '@/lib/slots/ensure-upcoming'

/**
 * GET /api/bookings/slots — Available slots for students.
 *
 * Rolling 7-day system:
 * 1. Calls ensureUpcomingSlots() to auto-create any missing slots
 *    (10 AM – 9 PM, hourly, next 7 days). Duplicates are skipped via
 *    UNIQUE(slot_date, slot_time).
 * 2. Fetches only the next 7 days of available slots.
 * 3. Returns them ordered by date + time.
 *
 * Optional: ?date=YYYY-MM-DD to filter to a specific date.
 */
export async function GET(request: Request) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Auto-generate any missing slots for the next 7 days.
  // Safe for concurrent requests — uses ON CONFLICT DO NOTHING.
  await ensureUpcomingSlots()

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  // Use service client so RLS doesn't block slot reads
  const supabase = createServiceClient()

  // Compute date boundaries in IST (Asia/Kolkata) to match user's local day.
  // A UTC server at 11:30 PM IST would see "tomorrow" in UTC — causing
  // today's slots to disappear and yesterday's to remain.
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const today = `${nowIST.getFullYear()}-${String(nowIST.getMonth() + 1).padStart(2, '0')}-${String(nowIST.getDate()).padStart(2, '0')}`
  const endDate = new Date(nowIST)
  endDate.setDate(endDate.getDate() + 6)
  const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  let query = supabase
    .from('counselling_slots')
    .select('*')
    .eq('is_available', true)
    .order('slot_date')
    .order('slot_time')

  if (date) {
    // Single-date filter (still respect the 7-day window)
    query = query.eq('slot_date', date)
  } else {
    // Rolling 7-day window
    query = query.gte('slot_date', today).lte('slot_date', endDateStr)
  }

  const { data, error } = await query
  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}
