import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { collegeFiltersSchema } from '@/validators/college'

/**
 * GET /api/colleges — Public. Paginated (max 50/page), filterable directory.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = collegeFiltersSchema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { page, pageSize, city, state, stream, course, fee_min, fee_max, exam, search } = parsed.data

  const supabase = await createClient()
  let query = supabase
    .from('colleges')
    .select('*, college_courses(*)', { count: 'exact' })
    .eq('status', 'active')
    .eq('is_deleted', false)

  if (city) query = query.eq('city', city)
  if (state) query = query.eq('state', state)
  if (fee_min != null) query = query.gte('fee_min', fee_min)
  if (fee_max != null) query = query.lte('fee_max', fee_max)
  if (search) query = query.ilike('name', `%${search}%`)

  // For stream/course/exam filters, we need to filter via college_courses
  // These are handled post-fetch if stream, course, or exam are specified
  // For MVP, we apply simple filters directly
  if (stream) {
    // Get college IDs that have courses with this stream
    const { data: courseColleges } = await supabase
      .from('college_courses')
      .select('college_id')
      .eq('stream', stream)

    if (courseColleges?.length) {
      const ids = [...new Set(courseColleges.map((c) => c.college_id))]
      query = query.in('id', ids)
    } else {
      return NextResponse.json({ data: [], count: 0, page, pageSize })
    }
  }

  if (course) {
    const { data: courseColleges } = await supabase
      .from('college_courses')
      .select('college_id')
      .ilike('course_name', `%${course}%`)

    if (courseColleges?.length) {
      const ids = [...new Set(courseColleges.map((c) => c.college_id))]
      query = query.in('id', ids)
    } else {
      return NextResponse.json({ data: [], count: 0, page, pageSize })
    }
  }

  if (exam) {
    const { data: examColleges } = await supabase
      .from('college_courses')
      .select('college_id')
      .contains('exams_accepted', [exam])

    if (examColleges?.length) {
      const ids = [...new Set(examColleges.map((c) => c.college_id))]
      query = query.in('id', ids)
    } else {
      return NextResponse.json({ data: [], count: 0, page, pageSize })
    }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count, page, pageSize })
}
