'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  variant?: 'transparent' | 'solid'
  links?: { href: string; label: string }[]
}

export function Navbar({
  variant = 'solid',
  links = [{ href: '/colleges', label: 'Colleges' }],
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check auth state once on mount (getSession reads from cookies, no lock issues)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isTransparent = variant === 'transparent' && !scrolled

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
          <Link
            href={user ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
              <span className="text-sm font-bold text-primary-foreground tracking-tight">N</span>
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
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
              // Logged-in state
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
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {(user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium ${isTransparent ? 'text-white/90' : 'text-foreground'}`}>
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ) : !loading ? (
              // Not logged in
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
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 rounded-lg px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                  >
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
