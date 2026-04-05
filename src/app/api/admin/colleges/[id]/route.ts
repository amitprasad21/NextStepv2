import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateCollegeSchema } from '@/validators/college'
import { validateUuidParam } from '@/lib/utils'

/**
 * PATCH /api/admin/colleges/[id] — Update college.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const invalid = validateUuidParam(id)
  if (invalid) return invalid

  const body = await request.json()
  const parsed = updateCollegeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('colleges')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * DELETE /api/admin/colleges/[id] — Hard delete college and all related data.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const invalid = validateUuidParam(id)
  if (invalid) return invalid

  const supabase = createServiceClient()

  // Atomic cascade delete — all related data removed in one transaction
  const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_college_cascade', {
    p_college_id: id,
  })

  if (rpcError) {
    console.error('Cascade delete error:', rpcError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }

  return NextResponse.json({ message: 'College permanently deleted' })
}
