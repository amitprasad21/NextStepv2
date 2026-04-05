import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type } = await req.json()

    if (!type || !['visit', 'counselling'].includes(type)) {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials missing in environment variables")
    }

    // Read the authoritative price from DB — never trust client-sent amount
    const serviceClient = createServiceClient()
    const { data: settings } = await serviceClient
      .from('platform_settings')
      .select('visit_price_inr, counselling_price_inr')
      .single()

    const amountInr = type === 'visit'
      ? (settings?.visit_price_inr ?? 499)
      : (settings?.counselling_price_inr ?? 199)

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
      amount: amountInr * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: `rcpt_${user.id.slice(0,8)}_${Date.now()}`
    }

    const order = await instance.orders.create(options)
    return NextResponse.json(order)
  } catch (err: unknown) {
    console.error('Razorpay order error:', err)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
