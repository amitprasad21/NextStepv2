'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Slot {
  id: string
  slot_date: string
  slot_time: string
  max_capacity: number
  booked_count: number
}

interface Booking {
  id: string
  status: string
  booking_type: string
  preferred_date: string
  preferred_time: string
  created_at: string
  meeting_link: string | null
}

const statusStyles: Record<string, string> = {
  confirmed: 'border-green-200 bg-green-50 text-green-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings')
    const data = await res.json()
    setBookings(data.data ?? [])
    setLoading(false)
  }

  const fetchSlots = async () => {
    const res = await fetch('/api/bookings/slots')
    const data = await res.json()
    setSlots(data.data ?? [])
  }

  useEffect(() => {
    fetchBookings()
    fetchSlots()
    const interval = setInterval(() => { fetchBookings() }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleBook = async () => {
    if (!selectedSlot) return
    setSubmitting(true)
    setMessage('')

    const slot = slots.find(s => s.id === selectedSlot)
    if (!slot) return

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot_id: selectedSlot,
        preferred_date: slot.slot_date,
        preferred_time: slot.slot_time,
        booking_type: 'free_call',
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessageType('success')
      setMessage('Booking created successfully! You will receive a confirmation soon.')
      setShowBooking(false)
      setSelectedSlot('')
      fetchBookings()
      fetchSlots()
    } else {
      setMessageType('error')
      setMessage(data.error || 'Failed to create booking')
    }
    setSubmitting(false)
  }

  // Group slots by date
  const slotsByDate: Record<string, Slot[]> = {}
  slots.forEach(s => {
    if (!slotsByDate[s.slot_date]) slotsByDate[s.slot_date] = []
    slotsByDate[s.slot_date].push(s)
  })

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Counselling Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Book a free counselling session with our experts.</p>
        </div>
        <button
          onClick={() => setShowBooking(!showBooking)}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
            showBooking
              ? 'border border-border bg-card text-foreground hover:bg-accent'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {showBooking ? 'Cancel' : 'Book Session'}
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 flex items-center gap-2 rounded-xl border p-4 text-sm ${
            messageType === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Booking form */}
      {showBooking && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
        >
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
            Select a Time Slot
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Choose an available slot for your free counselling call.</p>

          {Object.keys(slotsByDate).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No available slots at the moment. Please check back later.</p>
          ) : (
            <div className="mt-4 space-y-5">
              {Object.entries(slotsByDate).slice(0, 7).map(([date, dateSlots]) => (
                <div key={date}>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dateSlots.map(slot => {
                      const available = slot.booked_count < slot.max_capacity
                      return (
                        <button
                          key={slot.id}
                          disabled={!available}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                            selectedSlot === slot.id
                              ? 'border-primary bg-primary text-primary-foreground shadow-md'
                              : available
                              ? 'border-border bg-card text-foreground hover:border-primary/30'
                              : 'border-border/30 bg-muted text-muted-foreground/50 cursor-not-allowed'
                          }`}
                        >
                          {slot.slot_time.slice(0, 5)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSlot && (
            <button
              onClick={handleBook}
              disabled={submitting}
              className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </motion.div>
      )}

      {/* Bookings list */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          Your Bookings
        </h2>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading...
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No bookings yet. Book your first session above!</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/40 bg-card p-5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Free Counselling Call
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(b.preferred_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {b.preferred_time?.slice(0,5)}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Booked {new Date(b.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[b.status] ?? statusStyles.pending}`}>
                    {b.status}
                  </span>
                </div>

                {/* Meeting link for confirmed/completed bookings */}
                {(b.status === 'confirmed' || b.status === 'completed') && b.meeting_link && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50/50 p-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 10l5-5m0 0h-4m4 0v4M9 14l-5 5m0 0h4m-4 0v-4" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-green-800 uppercase tracking-wider">Meeting Link</p>
                      <a href={b.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-green-700 hover:underline truncate block">
                        {b.meeting_link}
                      </a>
                    </div>
                    <a
                      href={b.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                      Join
                    </a>
                  </div>
                )}

                {b.status === 'confirmed' && !b.meeting_link && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">Confirmed!</span> Meeting link will be shared shortly by the counsellor.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
