import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createVisitSchema } from '@/validators/visit'

/**
 * GET /api/visits — Own visit requests.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('college_visits')
    .select('*, college:colleges(id, name, city, state)')
    .eq('student_id', dbUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * POST /api/visits — Create visit.
 * Checks: college active, profile is_complete, daily capacity. NO notification here.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check is_complete and free limits
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('is_complete, used_free_visits, purchased_visits')
    .eq('user_id', dbUser.id)
    .single()

  if (!profile?.is_complete) {
    return NextResponse.json({ error: 'Complete your profile first' }, { status: 403 })
  }

  // Freemium Logic: Check purchased credits first, then free limits
  const hasPurchased = (profile.purchased_visits ?? 0) > 0;

  if (!hasPurchased && (profile.used_free_visits ?? 0) >= 1) {
    const { data: settings } = await supabase.from('platform_settings').select('visit_price_inr').single()
    return NextResponse.json({ 
      error: 'Free limit reached', 
      requires_payment: true, 
      price: settings?.visit_price_inr || 499 
    }, { status: 402 })
  }

  const body = await request.json()
  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { college_id, visit_date, visit_time } = parsed.data

  // Atomic visit: capacity check + insert + credit adjustment
  // all in one DB transaction via RPC — prevents race conditions.
  const usePurchased = (profile.purchased_visits ?? 0) > 0

  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_visit_atomic', {
    p_student_id: dbUser.id,
    p_college_id: college_id,
    p_visit_date: visit_date,
    p_visit_time: visit_time || null,
    p_use_purchased: usePurchased,
  })

  if (rpcError) {
    console.error('Visit RPC error:', rpcError.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const result = rpcResult as { visit_id?: string; error?: string; status: number }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  // Fetch the full visit record to return to the client
  const { data: visit } = await supabase
    .from('college_visits')
    .select('*, college:colleges(id, name, city, state)')
    .eq('id', result.visit_id)
    .single()

  return NextResponse.json({ data: visit }, { status: 201 })
}
