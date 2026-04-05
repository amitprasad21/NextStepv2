import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createBookingSchema } from '@/validators/booking'

/**
 * GET /api/bookings — Own bookings only.
 */
export async function GET() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client to bypass RLS
  const supabase = createServiceClient()

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('counselling_bookings')
    .select('*, slot:counselling_slots(*)')
    .eq('student_id', dbUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * POST /api/bookings — Create booking.
 * Uses service client for all DB ops to bypass RLS.
 */
export async function POST(request: Request) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Service client for all DB operations — bypasses RLS
  const supabase = createServiceClient()

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check is_complete and free limits
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('is_complete, used_free_counselling, purchased_counselling')
    .eq('user_id', dbUser.id)
    .single()

  if (!profile?.is_complete) {
    return NextResponse.json({ error: 'Complete your profile first' }, { status: 403 })
  }

  // Freemium Logic: Check purchased credits first, then free limits
  const hasPurchased = (profile.purchased_counselling ?? 0) > 0

  if (!hasPurchased && (profile.used_free_counselling ?? 0) >= 3) {
    const { data: settings } = await supabase.from('platform_settings').select('counselling_price_inr').single()
    return NextResponse.json({
      error: 'Free limit reached',
      requires_payment: true,
      price: settings?.counselling_price_inr || 199,
    }, { status: 402 })
  }

  const body = await request.json()
  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { slot_id, booking_type, context_college_id, preferred_date, preferred_time } = parsed.data

  // Atomic booking: capacity check + insert + slot update + credit adjustment
  // all in one DB transaction via RPC — prevents race conditions.
  const usePurchased = (profile.purchased_counselling ?? 0) > 0

  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_booking_atomic', {
    p_student_id: dbUser.id,
    p_slot_id: slot_id,
    p_booking_type: booking_type,
    p_context_college_id: context_college_id || null,
    p_preferred_date: preferred_date,
    p_preferred_time: preferred_time,
    p_use_purchased: usePurchased,
  })

  if (rpcError) {
    console.error('Booking RPC error:', rpcError.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const result = rpcResult as { booking_id?: string; error?: string; status: number }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  // Fetch the full booking record to return to the client
  const { data: booking } = await supabase
    .from('counselling_bookings')
    .select('*, slot:counselling_slots(*)')
    .eq('id', result.booking_id)
    .single()

  return NextResponse.json({ data: booking }, { status: 201 })
}
