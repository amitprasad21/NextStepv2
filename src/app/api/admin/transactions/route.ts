import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error: countError } = await supabase
    .from('payment_transactions')
    .select('id, amount_inr, item_type, status, created_at, razorpay_payment_id, student:users(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  return NextResponse.json({ data, meta: { total: count, page, pageSize } })
}
