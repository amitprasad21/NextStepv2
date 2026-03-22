'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface SavedCollege {
  id: string
  college_id: string
  college: {
    id: string
    name: string
    city: string
    state: string
    fee_min: number | null
    fee_max: number | null
  }
}

export default function SavedCollegesPage() {
  const [saved, setSaved] = useState<SavedCollege[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser) return

    const { data } = await supabase
      .from('saved_colleges')
      .select('id, college_id, college:colleges(id, name, city, state, fee_min, fee_max)')
      .eq('student_id', dbUser.id)
      .order('saved_at', { ascending: false })

    setSaved((data as unknown as SavedCollege[]) ?? [])
    setLoading(false)
  }

  const handleRemove = async (collegeId: string) => {
    const res = await fetch(`/api/saved/${collegeId}`, { method: 'DELETE' })
    if (res.ok) {
      setSaved((prev) => prev.filter((s) => s.college_id !== collegeId))
    }
  }

  useEffect(() => {
    fetchSaved()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Saved Colleges</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You can save up to 10 colleges for quick comparison.
          </p>
        </div>
        <Link
          href="/colleges"
          className="hidden items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 sm:inline-flex"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Browse Colleges
        </Link>
      </div>

      {loading ? (
        <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>No saved colleges yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Start exploring and save colleges you are interested in.</p>
          <Link
            href="/colleges"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
          >
            Browse Colleges
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {saved.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-lifted"
              >
                <Link href={`/colleges/${s.college_id}`} className="block">
                  <div className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-primary">
                      <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
                    </svg>
                    {s.college?.city}, {s.college?.state}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary" style={{ fontFamily: 'var(--font-sans)' }}>
                    {s.college?.name}
                  </h3>
                  {(s.college?.fee_min || s.college?.fee_max) && (
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {s.college.fee_min?.toLocaleString('en-IN') ?? '—'} – {s.college.fee_max?.toLocaleString('en-IN') ?? '—'}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">INR/year</span>
                    </p>
                  )}
                </Link>
                <button
                  onClick={() => handleRemove(s.college_id)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
