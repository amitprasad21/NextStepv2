import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { validateUuidParam } from '@/lib/utils'
import { z } from 'zod'

/** Allowlisted fields an admin can update on a course/stream. */
const updateStreamSchema = z.object({
  course_name: z.string().min(1).max(100).optional(),
  branch: z.string().max(100).nullable().optional(),
  stream: z.enum(['UG', 'PG']).optional(),
  duration_years: z.number().int().min(1).max(10).nullable().optional(),
  annual_fee: z.number().int().min(0).nullable().optional(),
  eligibility: z.string().nullable().optional(),
  exams_accepted: z.array(z.string()).optional(),
}).strict()

/**
 * PATCH /api/admin/streams/:id — Update a course/stream.
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
  const parsed = updateStreamSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('college_courses')
    .update(parsed.data)
    .eq('id', id)
    .select('*, colleges(id, name)')
    .single()

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * DELETE /api/admin/streams/:id — Delete a course/stream.
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
  const { error: dbError } = await supabase
    .from('college_courses')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
