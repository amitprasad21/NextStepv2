'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Settings {
  counselling_price_inr: number
  visit_price_inr: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ counselling_price_inr: 199, visit_price_inr: 499 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.data) setSettings({
          counselling_price_inr: d.data.counselling_price_inr ?? 199,
          visit_price_inr: d.data.visit_price_inr ?? 499,
        })
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to update settings')

      setMessage({ type: 'success', text: 'Pricing rates updated successfully.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        Loading settings...
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          Platform Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage the pricing rates for counselling sessions and college visits dynamically.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="counsellingPrice" className="block text-sm font-semibold text-foreground">
              Counselling Session Rate (INR)
            </label>
            <p className="text-xs text-muted-foreground mb-2">Controls the price applied when a student pays to book a counselling session.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input
                id="counsellingPrice"
                type="number"
                min="0"
                value={settings.counselling_price_inr}
                onChange={e => setSettings(s => ({ ...s, counselling_price_inr: Number(e.target.value) }))}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 pl-8 pr-4 text-foreground transition-colors focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="visitPrice" className="block text-sm font-semibold text-foreground">
              College Visit Rate (INR)
            </label>
            <p className="text-xs text-muted-foreground mb-2">Controls the price applied when a student pays to book a premium college visit.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input
                id="visitPrice"
                type="number"
                min="0"
                value={settings.visit_price_inr}
                onChange={e => setSettings(s => ({ ...s, visit_price_inr: Number(e.target.value) }))}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 pl-8 pr-4 text-foreground transition-colors focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-sm font-bold text-white shadow-lifted transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lifted flex items-center justify-center gap-2"
            >
              {saving && (
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              {saving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  )
}
