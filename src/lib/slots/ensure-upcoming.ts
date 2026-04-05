import { createServiceClient } from '@/lib/supabase/server'

/**
 * ensureUpcomingSlots()
 *
 * Calls the DB function `ensure_upcoming_slots` which guarantees
 * the next 7 days have hourly slots (10 AM – 9 PM).
 *
 * - Uses ON CONFLICT (slot_date, slot_time) DO NOTHING → no duplicates
 * - Safe to call from multiple concurrent requests
 * - Returns the number of newly created slots (0 if all already exist)
 *
 * Call this BEFORE fetching slots in the student-facing API.
 */
export async function ensureUpcomingSlots(days = 7): Promise<number> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.rpc('ensure_upcoming_slots', {
    p_days: days,
  })

  if (error) {
    // Log but don't throw — slot fetch should still work with existing slots
    console.error('ensureUpcomingSlots error:', error.message)
    return 0
  }

  return (data as number) ?? 0
}
