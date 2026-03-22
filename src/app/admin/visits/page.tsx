'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Visit {
  id: string
  status: string
  visit_date: string
  visit_time: string | null
  created_at: string
  student: { id: string; email: string }
  college: { id: string; name: string; city: string }
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled']

const statusStyles: Record<string, string> = {
  confirmed: 'border-green-200 bg-green-50 text-green-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
}

const statusIcon: Record<string, string> = {
  pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  confirmed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  completed: 'M5 13l4 4L19 7',
  cancelled: 'M6 18L18 6M6 6l12 12',
}

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchVisits = async () => {
    setLoading(true)
    const params = filter ? `?status=${filter}` : ''
    const res = await fetch(`/api/admin/visits${params}`)
    const data = await res.json()
    setVisits(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchVisits()
    const interval = setInterval(() => { fetchVisits() }, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/visits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) fetchVisits()
    else {
      const data = await res.json()
      alert(data.error)
    }
  }

  const counts = {
    all: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    confirmed: visits.filter(v => v.status === 'confirmed').length,
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Visit Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and manage campus visit requests from students.</p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">{counts.pending} pending</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">{counts.confirmed} confirmed</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${!filter ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}>
          All ({counts.all})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : visits.length === 0 ? (
        <div className="mt-12 flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No visits found{filter ? ` with status "${filter}"` : ''}.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visits.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-lifted"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusStyles[v.status] ?? statusStyles.pending}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d={statusIcon[v.status] ?? statusIcon.pending} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{v.college?.name}</p>
                    <p className="text-xs text-muted-foreground">{v.college?.city}</p>
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                  {v.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Student</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground truncate">{v.student?.email?.split('@')[0]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Visit Date</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground">
                    {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-3">
                {v.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(v.id, 'confirmed')}
                      className="flex-1 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors border border-green-200">
                      Confirm
                    </button>
                    <button onClick={() => handleStatusChange(v.id, 'cancelled')}
                      className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors border border-red-200">
                      Cancel
                    </button>
                  </>
                )}
                {v.status === 'confirmed' && (
                  <>
                    <button onClick={() => handleStatusChange(v.id, 'completed')}
                      className="flex-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200">
                      Mark Complete
                    </button>
                    <button onClick={() => handleStatusChange(v.id, 'cancelled')}
                      className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors border border-red-200">
                      Cancel
                    </button>
                  </>
                )}
                {(v.status === 'completed' || v.status === 'cancelled') && (
                  <p className="text-xs text-muted-foreground italic">No further actions available</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
