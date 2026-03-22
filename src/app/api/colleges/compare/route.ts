import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/colleges/compare?ids=id1,id2,id3 — Public. Compare multiple colleges.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ error: 'ids parameter required' }, { status: 400 })
  }

  const ids = idsParam.split(',').filter(Boolean)
  if (ids.length === 0 || ids.length > 5) {
    return NextResponse.json({ error: 'Provide 1-5 college IDs' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('colleges')
    .select('*, college_courses(*)')
    .in('id', ids)
    .eq('status', 'active')
    .eq('is_deleted', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
