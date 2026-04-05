import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()

  try {
    const supabase = createServiceClient()

    // Verify DB connectivity with a lightweight query
    const { error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const latencyMs = Date.now() - start

    if (error) {
      console.error('Health check DB error:', error.message)
      return NextResponse.json({
        status: 'degraded',
        db: 'error',
        latencyMs,
        timestamp: new Date().toISOString(),
      }, { status: 503 })
    }

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latencyMs,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const latencyMs = Date.now() - start
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
