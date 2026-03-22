'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Metrics {
  totalStudents: number
  totalColleges: number
  totalBookings: number
  totalVisits: number
  bookingsByStatus: Record<string, number>
  visitsByStatus: Record<string, number>
}

const statusColors: Record<string, { bg: string; text: string; bar: string }> = {
  confirmed: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = () => {
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then((d) => {
        setMetrics(d.data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
        </svg>
        Loading metrics...
      </div>
    )
  }

  if (!metrics) {
    return <p className="text-sm text-destructive">Failed to load metrics.</p>
  }

  const cards = [
    { label: 'Total Students', value: metrics.totalStudents, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', color: 'from-primary to-primary-dark', iconBg: 'bg-primary-light text-primary', href: '/admin/students' },
    { label: 'Total Colleges', value: metrics.totalColleges, icon: 'M12 14l9-5-9-5-9 5 9 5z', color: 'from-amber-500 to-amber-700', iconBg: 'bg-surface-warm text-amber-700', href: '/admin/colleges' },
    { label: 'Total Bookings', value: metrics.totalBookings, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-green-500 to-green-700', iconBg: 'bg-green-50 text-green-700', href: '/admin/bookings' },
    { label: 'Total Visits', value: metrics.totalVisits, icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', color: 'from-blue-500 to-blue-700', iconBg: 'bg-blue-50 text-blue-700', href: '/admin/visits' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of platform activity and key metrics.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live — auto-refreshes every 30s
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={card.href} className="group block relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-lifted hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} transition-transform group-hover:scale-110`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d={card.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                {card.value.toLocaleString('en-IN')}
              </p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(to right, var(--primary), var(--secondary))` }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Status Breakdown with progress bars */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bookings by Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Bookings by Status
            </h2>
            <Link href="/admin/bookings" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">View all</Link>
          </div>
          <div className="mt-5 space-y-4">
            {Object.entries(metrics.bookingsByStatus).map(([status, count]) => {
              const total = metrics.totalBookings || 1
              const pct = Math.round((count / total) * 100)
              const colors = statusColors[status] ?? statusColors.pending
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-block rounded-full ${colors.bg} px-2.5 py-0.5 text-[10px] font-semibold capitalize ${colors.text}`}>
                      {status}
                    </span>
                    <span className="text-sm font-bold text-foreground">{count} <span className="text-xs font-normal text-muted-foreground">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${colors.bar}`}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(metrics.bookingsByStatus).length === 0 && (
              <p className="text-sm text-muted-foreground">No booking data yet.</p>
            )}
          </div>
        </motion.div>

        {/* Visits by Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Visits by Status
            </h2>
            <Link href="/admin/visits" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">View all</Link>
          </div>
          <div className="mt-5 space-y-4">
            {Object.entries(metrics.visitsByStatus).map(([status, count]) => {
              const total = metrics.totalVisits || 1
              const pct = Math.round((count / total) * 100)
              const colors = statusColors[status] ?? statusColors.pending
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-block rounded-full ${colors.bg} px-2.5 py-0.5 text-[10px] font-semibold capitalize ${colors.text}`}>
                      {status}
                    </span>
                    <span className="text-sm font-bold text-foreground">{count} <span className="text-xs font-normal text-muted-foreground">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className={`h-full rounded-full ${colors.bar}`}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(metrics.visitsByStatus).length === 0 && (
              <p className="text-sm text-muted-foreground">No visit data yet.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
      >
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Add College', href: '/admin/colleges', icon: 'M12 4v16m8-8H4', desc: 'Create a new college listing' },
            { label: 'Manage Bookings', href: '/admin/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Review pending bookings' },
            { label: 'View Students', href: '/admin/students', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', desc: 'Browse student profiles' },
            { label: 'Manage Visits', href: '/admin/visits', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', desc: 'Handle visit requests' },
          ].map(action => (
            <Link key={action.label} href={action.href}
              className="group rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:bg-primary/5 hover:border-primary/20 hover:shadow-soft"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d={action.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{action.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
