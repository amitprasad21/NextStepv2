'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ProfileDropdownProps {
  displayName: string
  email: string
  initials: string
}

export function ProfileDropdown({ displayName, email, initials }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-border/60 bg-accent/40 px-3 py-1.5 transition-all duration-200 hover:bg-accent hover:shadow-soft"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white shadow-sm">
          {initials}
        </div>
        <span className="hidden text-sm font-semibold text-foreground md:block max-w-[120px] truncate">
          {displayName}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`hidden text-muted-foreground transition-transform duration-200 md:block ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lifted z-50">
          {/* User info */}
          <div className="border-b border-border/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="p-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              My Profile
            </Link>
            <Link
              href="/dashboard/saved"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Saved Colleges
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-border/40 p-1.5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
