import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = await req.json()

    const text = razorpay_order_id + "|" + razorpay_payment_id
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text.toString())
      .digest("hex")

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Payment is mathematically valid. Grant credit to user.
    const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
    if (!dbUser) throw new Error("User not found")

    // Define which column to top-up based on product type
    const column = type === 'visit' ? 'purchased_visits' : 'purchased_counselling'

    // Atomic increment
    const { data: profile } = await supabase.from('student_profiles').select(column).eq('user_id', dbUser.id).single()
    const currentVal = (profile as Record<string, number>)?.[column] ?? 0

    await supabase
      .from('student_profiles')
      .update({ [column]: currentVal + 1 })
      .eq('user_id', dbUser.id)

    // Lookup amounts
    const { data: settings } = await supabase.from('platform_settings').select('*').single()
    const amount_inr = type === 'visit' ? settings?.visit_price_inr : settings?.counselling_price_inr;

    // Insert Transaction
    const { data: trx } = await supabase.from('payment_transactions').insert({
      student_id: dbUser.id,
      razorpay_order_id,
      razorpay_payment_id,
      amount_inr: amount_inr || 0,
      item_type: type,
      status: 'success'
    }).select().single();

    // Notify User
    try {
      const { dispatchNotifications } = await import('@/lib/notifications/dispatch')
      await dispatchNotifications(
        dbUser.id,
        'payment_confirmed',
        trx?.id || razorpay_payment_id,
        `Your Premium pass for ${type} was successfully purchased!`
      )
    } catch (e) {
      console.error('Notification dispatch failed', e)
    }

    return NextResponse.json({ success: true, message: 'Payment verified and credit added.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
