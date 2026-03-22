'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Notification {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.data ?? [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  useEffect(() => { fetchNotifications() }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const typeIcon = (type: string) => {
    if (type.includes('booking')) return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    if (type.includes('visit')) return 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
    return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  }

  const typeColor = (type: string) => {
    if (type.includes('confirmed')) return 'bg-green-50 text-green-600'
    if (type.includes('cancelled')) return 'bg-red-50 text-red-600'
    if (type.includes('completed')) return 'bg-blue-50 text-blue-600'
    if (type === 'welcome') return 'bg-primary-light text-primary'
    return 'bg-amber-50 text-amber-600'
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`flex items-start gap-4 rounded-xl border p-5 transition-all cursor-pointer ${
                n.is_read
                  ? 'border-border/40 bg-card'
                  : 'border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.04]'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeColor(n.type)}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d={typeIcon(n.type)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${n.is_read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {n.message}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.is_read && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
