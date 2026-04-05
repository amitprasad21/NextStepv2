import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/metrics — Dashboard metrics.
 */
export async function GET() {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()

  // Use count-only queries (head: true) instead of fetching all rows.
  // This is O(count-scan) not O(data-transfer) — critical at scale.
  const [
    students,
    colleges,
    // Booking counts by status
    bookingsPending,
    bookingsConfirmed,
    bookingsCompleted,
    bookingsCancelled,
    // Visit counts by status
    visitsPending,
    visitsConfirmed,
    visitsCompleted,
    visitsCancelled,
    // Revenue — SUM via rpc or fallback to count + known price
    transactions,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('colleges').select('*', { count: 'exact', head: true }),
    // Bookings by status
    supabase.from('counselling_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('counselling_bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('counselling_bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('counselling_bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    // Visits by status
    supabase.from('college_visits').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('college_visits').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('college_visits').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('college_visits').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    // Revenue: fetch only the amount column for successful transactions
    supabase.from('payment_transactions').select('amount_inr').eq('status', 'success'),
  ])

  const totalRevenue = transactions.data?.reduce((acc, curr) => acc + (curr.amount_inr || 0), 0) || 0

  const bookingsByStatus = {
    pending:   bookingsPending.count ?? 0,
    confirmed: bookingsConfirmed.count ?? 0,
    completed: bookingsCompleted.count ?? 0,
    cancelled: bookingsCancelled.count ?? 0,
  }

  const visitsByStatus = {
    pending:   visitsPending.count ?? 0,
    confirmed: visitsConfirmed.count ?? 0,
    completed: visitsCompleted.count ?? 0,
    cancelled: visitsCancelled.count ?? 0,
  }

  const totalBookings = (bookingsByStatus.pending + bookingsByStatus.confirmed +
    bookingsByStatus.completed + bookingsByStatus.cancelled)
  const totalVisits = (visitsByStatus.pending + visitsByStatus.confirmed +
    visitsByStatus.completed + visitsByStatus.cancelled)

  return NextResponse.json({
    data: {
      totalStudents: students.count ?? 0,
      totalColleges: colleges.count ?? 0,
      bookingsByStatus,
      visitsByStatus,
      totalBookings,
      totalVisits,
      totalRevenue,
    },
  })
}
