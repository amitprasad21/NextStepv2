import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/saved/[collegeId] — Unsave a college.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ collegeId: string }> }
) {
  const { collegeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await supabase
    .from('saved_colleges')
    .delete()
    .eq('student_id', dbUser.id)
    .eq('college_id', collegeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Removed' })
}
