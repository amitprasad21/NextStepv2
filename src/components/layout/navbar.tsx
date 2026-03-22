'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavbarProps {
  variant?: 'transparent' | 'solid'
  showAuth?: boolean
  authLabel?: string
  authHref?: string
  links?: { href: string; label: string }[]
}

export function Navbar({
  variant = 'solid',
  showAuth = true,
  authLabel = 'Sign In',
  authHref = '/auth/login',
  links = [{ href: '/colleges', label: 'Colleges' }],
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            href="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
              <span className="text-sm font-bold text-primary-foreground tracking-tight">N</span>
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-foreground'
              }`}
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
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
            {showAuth && (
              <Link
                href={authHref}
                className="ml-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {authLabel}
              </Link>
            )}
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
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
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
              {showAuth && (
                <Link
                  href={authHref}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  {authLabel}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header (solid variant only) */}
      {variant === 'solid' && <div className="h-16" />}
    </>
  )
}
