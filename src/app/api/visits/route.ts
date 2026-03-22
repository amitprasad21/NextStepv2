import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createVisitSchema } from '@/validators/visit'

/**
 * GET /api/visits — Own visit requests.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  const { data: dbUser } = await admin.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await admin
    .from('college_visits')
    .select('*, college:colleges(id, name, city, state)')
    .eq('student_id', dbUser.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { college_id, visit_date, visit_time } = parsed.data

  // Check college is active
  const { data: college } = await admin
    .from('colleges')
    .select('id, daily_visit_capacity, status, is_deleted')
    .eq('id', college_id)
    .single()

  if (!college || college.status !== 'active' || college.is_deleted) {
    return NextResponse.json({ error: 'College not found or inactive' }, { status: 404 })
  }

  // Check daily capacity
  const { count } = await admin
    .from('college_visits')
    .select('*', { count: 'exact', head: true })
    .eq('college_id', college_id)
    .eq('visit_date', visit_date)
    .neq('status', 'cancelled')

  if ((count ?? 0) >= college.daily_visit_capacity) {
    return NextResponse.json(
      { error: 'Visit capacity for this date is full.' },
      { status: 409 }
    )
  }

  const { data: visit, error } = await admin
    .from('college_visits')
    .insert({
      student_id: dbUser.id,
      college_id,
      visit_date,
      visit_time: visit_time || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: visit }, { status: 201 })
}
