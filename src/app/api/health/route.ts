import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('users').select('id').limit(1)

    return NextResponse.json({
      status: 'ok',
      db: error ? 'error' : 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { status: 'error', db: 'disconnected' },
      { status: 500 }
    )
  }
}
