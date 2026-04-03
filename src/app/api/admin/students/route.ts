import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/students — Paginated list. Max 50/page. Search by name/email.
 */
export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || '20') || 20), 50)
  const search = searchParams.get('search')

  const supabase = createServiceClient()

  let query = supabase
    .from('users')
    .select('*, student_profiles(*)', { count: 'exact' })
    .eq('role', 'student')

  if (search) {
    query = query.or(`email.ilike.%${search}%`)
  }

  const from = (page - 1) * pageSize
  const { data, count, error: dbError } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
  return NextResponse.json({ data, count, page, pageSize })
}
