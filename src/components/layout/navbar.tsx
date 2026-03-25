'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  variant?: 'transparent' | 'solid'
  links?: { href: string; label: string }[]
}

export function Navbar({
  variant = 'solid',
  links = [
    { href: '/colleges', label: 'Colleges' },
    { href: '/pricing', label: 'Pricing' }
  ],
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isTransparent = variant === 'transparent' && !scrolled
  const userInitial = (user?.email || 'U').charAt(0).toUpperCase()
  const userName = user?.email?.split('@')[0] ?? ''

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? 'bg-transparent'
            : 'glass border-b border-border/50 shadow-soft'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-0 transition-transform duration-300 hover:scale-[1.02] group">
            <img src="/Nextstep_logo.png" alt="NextStep Logo" className="-ml-2 -mr-5 md:-mr-6 h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            <span
              className={`text-lg md:text-xl font-bold tracking-tight transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-foreground'
              }`}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              NextStep
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={`desktop-${link.href}`}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-foreground/5 ${
                  isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-foreground/5 ${
                    isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all duration-200 ${
                      isTransparent
                        ? 'bg-white/10 hover:bg-white/20 border border-white/10'
                        : 'bg-accent/50 hover:bg-accent border border-border/60'
                    }`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white shadow-sm">
                      {userInitial}
                    </div>
                    <span className={`text-sm font-medium max-w-[100px] truncate ${isTransparent ? 'text-white/90' : 'text-foreground'}`}>
                      {userName}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${isTransparent ? 'text-white/60' : 'text-muted-foreground'}`}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lifted z-50"
                      >
                        <div className="border-b border-border/40 px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                              {userInitial}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-1.5">
                          <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Dashboard
                          </Link>
                          <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            My Profile
                          </Link>
                        </div>
                        <div className="border-t border-border/40 p-1.5">
                          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : !loading ? (
              <Link
                href="/auth/login"
                className="ml-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In
              </Link>
            ) : null}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg md:hidden transition-colors ${
              isTransparent ? 'text-white' : 'text-foreground'
            }`}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b bg-card p-4 shadow-lifted md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={`mobile-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="mt-2 flex items-center gap-3 rounded-xl bg-accent/50 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white">
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Sign Out
                  </button>
                </>
              ) : !loading ? (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Sign In
                </Link>
              ) : null}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header (solid variant only) */}
      {variant === 'solid' && <div className="h-16" />}
    </>
  )
}
