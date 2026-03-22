import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * POST /api/auth/magic-link
 * Sends a magic link / confirmation link to the user's email.
 * Replaces the OTP send endpoint from the original docs.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = magicLinkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Check your email for a sign-in link.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
