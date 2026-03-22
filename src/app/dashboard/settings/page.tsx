'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.data)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })

    if (res.ok) {
      setMessageType('success')
      setMessage('Profile updated successfully.')
    } else {
      const data = await res.json()
      setMessageType('error')
      setMessage(data.error || 'Failed to update.')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account preferences.</p>

      {profile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card p-7 shadow-soft"
        >
          <div>
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Profile Details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Update your personal information here.</p>
          </div>

          {message && (
            <div className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
              messageType === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                {messageType === 'success' ? (
                  <>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                ) : (
                  <>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </>
                )}
              </svg>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={(profile.full_name as string) || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">City</label>
              <input
                type="text"
                value={(profile.city as string) || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">State</label>
              <input
                type="text"
                value={(profile.state as string) || ''}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </motion.div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No profile found.</p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-2xl border border-border/60 bg-card p-7 shadow-soft"
      >
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          Account
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Manage your account settings.</p>
        <div className="mt-5 rounded-xl border border-red-200/50 bg-red-50/30 p-4">
          <p className="text-sm font-medium text-foreground">Sign out of your account</p>
          <p className="mt-0.5 text-xs text-muted-foreground">You will need to sign in again to access your dashboard.</p>
          <button
            onClick={handleLogout}
            className="mt-3 rounded-xl border border-destructive/30 bg-white px-5 py-2 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-red-50 hover:border-destructive/50"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}
