import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative border-t bg-foreground text-white/80">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="text-sm font-bold text-white tracking-tight">N</span>
              </div>
              <span
                className="text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                NextStep
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Helping Indian students navigate college admissions with structured guidance,
              expert counselling, and organized campus visits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40"
                style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
              Explore
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { href: '/colleges', label: 'Browse Colleges' },
                { href: '/auth/login', label: 'Get Started' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40"
                style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
              For Students
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { href: '/auth/login', label: 'Book Counselling' },
                { href: '/auth/login', label: 'Schedule Visit' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40"
                style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-white/60">hello@nextstep.in</li>
              <li className="text-sm text-white/60">New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} NextStep. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
