'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: string
  status: string
  booking_type: string
  preferred_date: string
  preferred_time: string
  created_at: string
  meeting_link: string | null
  student: { id: string; email: string; student_profiles: { full_name: string }[] | null }
  slot: { slot_date: string; slot_time: string }
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled']

const statusStyles: Record<string, string> = {
  confirmed: 'border-green-200 bg-green-50 text-green-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [meetingLinkInputs, setMeetingLinkInputs] = useState<Record<string, string>>({})
  const [savingLink, setSavingLink] = useState<string | null>(null)
  const [linkMessage, setLinkMessage] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = filter ? `?status=${filter}` : ''
      const res = await fetch(`/api/admin/bookings${params}`)
      const data = await res.json()
      setBookings(data.data ?? [])
    } catch {
      // network error — keep existing state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(() => { fetchBookings() }, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleStatusChange = async (id: string, newStatus: string, linkParam?: string) => {
    const payload: any = { status: newStatus }
    if (linkParam) payload.meeting_link = linkParam

    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) fetchBookings()
    else {
      const data = await res.json()
      alert(data.error)
    }
  }

  // handleSaveMeetingLink was removed, meeting flow acts natively on confirm.

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Booking Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Review and manage student counselling bookings.</p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${!filter ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}>
          All
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
      ) : (
        <div className="mt-5 space-y-3">
          {bookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary shrink-0">
                      {(b.student?.student_profiles?.[0]?.full_name || b.student?.email || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {b.student?.student_profiles?.[0]?.full_name || b.student?.email}
                      </p>
                      {b.student?.student_profiles?.[0]?.full_name && (
                        <p className="text-[11px] text-muted-foreground truncate">{b.student?.email}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {b.preferred_date} at {b.preferred_time} &middot; Booked {new Date(b.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`shrink-0 inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[b.status] ?? statusStyles.pending}`}>
                  {b.status}
                </span>
              </div>

              {/* Meeting Link Input (Pending Only) */}
              {b.status === 'pending' && (
                <div className="mt-4 rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 10l5-5m0 0h-4m4 0v4M9 14l-5 5m0 0h4m-4 0v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Add Meeting Link to Confirm Booking
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={meetingLinkInputs[b.id] || ''}
                      onChange={(e) => setMeetingLinkInputs(prev => ({ ...prev, [b.id]: e.target.value }))}
                      placeholder="Paste link (Zoom, Google Meet, etc.)"
                      className="flex-1 rounded-lg border border-amber-200/40 bg-white px-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                    />
                    <button onClick={() => {
                        const link = meetingLinkInputs[b.id]?.trim()
                        if (link) {
                          handleStatusChange(b.id, 'confirmed', link)
                        } else {
                          alert('Please provide a meeting link before confirming.')
                        }
                      }}
                      className="rounded-lg bg-amber-500 text-white px-5 py-2 text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm shrink-0"
                    >
                      Confirm with Link
                    </button>
                    <button onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-xs font-bold hover:bg-red-200 transition-colors shrink-0">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmed - Show Link + Complete Action */}
              {b.status === 'confirmed' && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-green-200/50 bg-green-50/50 p-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-green-900 flex items-center gap-2 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 10l5-5m0 0h-4m4 0v4M9 14l-5 5m0 0h4m-4 0v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Active Meeting Link
                    </h4>
                    {b.meeting_link ? (
                      <a href={b.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-green-700 hover:text-green-800 hover:underline truncate block">
                        Join Meeting &rarr; {b.meeting_link}
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No link provided</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleStatusChange(b.id, 'completed')}
                      className="rounded-xl bg-blue-500 text-white px-5 py-2 text-xs font-bold hover:bg-blue-600 shadow-sm transition-all hover:-translate-y-0.5">
                      Mark Completed
                    </button>
                    <button onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="rounded-xl bg-red-100 text-red-700 px-4 py-2 text-xs font-bold hover:bg-red-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Completed / Cancelled - Pure Read Only */}
              {(b.status === 'completed' || b.status === 'cancelled') && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground italic font-medium uppercase tracking-widest">
                    Historical record — no further actions available.
                  </span>
                </div>
              )}
            </motion.div>
          ))}
          {bookings.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No bookings found{filter ? ` with status "${filter}"` : ''}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
