import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createBookingSchema } from '@/validators/booking'

/**
 * GET /api/bookings — Own bookings only.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  const { data: dbUser } = await admin.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await admin
    .from('counselling_bookings')
    .select('*, slot:counselling_slots(*)')
    .eq('student_id', dbUser.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

/**
 * POST /api/bookings — Create booking.
 * Checks: profile is_complete, capacity, no duplicate. NO notification here.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  const { data: dbUser } = await admin.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check is_complete
  const { data: profile } = await admin
    .from('student_profiles')
    .select('is_complete')
    .eq('user_id', dbUser.id)
    .single()

  if (!profile?.is_complete) {
    return NextResponse.json({ error: 'Complete your profile first' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { slot_id, booking_type, context_college_id, preferred_date, preferred_time } = parsed.data

  // Check slot availability and capacity
  const { data: slot } = await admin
    .from('counselling_slots')
    .select('*')
    .eq('id', slot_id)
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  if (!slot.is_available) return NextResponse.json({ error: 'Slot not available' }, { status: 409 })
  if (slot.booked_count >= slot.max_capacity) {
    return NextResponse.json({ error: 'Slot not available.' }, { status: 409 })
  }

  // Check duplicate
  const { data: existing } = await admin
    .from('counselling_bookings')
    .select('id')
    .eq('student_id', dbUser.id)
    .eq('slot_id', slot_id)
    .neq('status', 'cancelled')
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'You already have a booking at this time.' },
      { status: 409 }
    )
  }

  // Atomically increment booked_count only if capacity not exceeded
  const { data: updatedSlot, error: slotError } = await admin
    .from('counselling_slots')
    .update({
      booked_count: slot.booked_count + 1,
      is_available: slot.booked_count + 1 < slot.max_capacity,
    })
    .eq('id', slot_id)
    .lt('booked_count', slot.max_capacity)
    .select()
    .single()

  if (slotError || !updatedSlot) {
    return NextResponse.json({ error: 'Slot is no longer available.' }, { status: 409 })
  }

  // Create booking
  const { data: booking, error: bookingError } = await admin
    .from('counselling_bookings')
    .insert({
      student_id: dbUser.id,
      slot_id,
      booking_type,
      context_college_id: context_college_id || null,
      preferred_date,
      preferred_time,
      status: 'pending',
    })
    .select()
    .single()

  if (bookingError) {
    // Rollback slot count on failure
    await admin
      .from('counselling_slots')
      .update({
        booked_count: updatedSlot.booked_count - 1,
        is_available: true,
      })
      .eq('id', slot_id)

    if (bookingError.code === '23505') {
      return NextResponse.json({ error: 'You already have a booking at this time.' }, { status: 409 })
    }
    return NextResponse.json({ error: bookingError.message }, { status: 500 })
  }

  return NextResponse.json({ data: booking }, { status: 201 })
}
