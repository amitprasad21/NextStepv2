import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative border-t bg-foreground text-white/80">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
                <span className="text-sm font-bold text-white tracking-tight">N</span>
              </div>
              <span
                className="text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                NextStep
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Helping Indian students navigate college admissions with structured guidance,
              expert counselling, and organized campus visits.
            </p>
            <div className="mt-5 flex gap-3">
              {['twitter', 'instagram', 'linkedin'].map(social => (
                <span key={social} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/70 cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    {social === 'twitter' && <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                    {social === 'instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></>}
                    {social === 'linkedin' && <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                  </svg>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30"
                style={{ fontFamily: 'var(--font-sans)' }}>
              Explore
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { href: '/colleges', label: 'Browse Colleges' },
                { href: '/colleges/compare', label: 'Compare Colleges' },
                { href: '/auth/login', label: 'Get Started' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30"
                style={{ fontFamily: 'var(--font-sans)' }}>
              For Students
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { href: '/auth/login', label: 'Book Counselling', key: 'counselling' },
                { href: '/auth/login', label: 'Schedule Visit', key: 'visit' },
                { href: '/auth/login', label: 'Track Applications', key: 'track' },
              ].map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30"
                style={{ fontFamily: 'var(--font-sans)' }}>
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                hello@nextstep.in
              </li>
              <li className="flex items-center gap-2 text-sm text-white/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} NextStep. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
