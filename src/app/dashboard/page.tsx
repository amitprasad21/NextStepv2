import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/auth/login')

  const supabase = createServiceClient()

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) redirect('/auth/login')

  const [bookingsRes, visitsRes, savedRes, profileRes] = await Promise.all([
    supabase
      .from('counselling_bookings')
      .select('id, status, preferred_date, preferred_time, booking_type, meeting_link')
      .eq('student_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('college_visits')
      .select('id, status, visit_date, college_id')
      .eq('student_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('saved_colleges')
      .select('id, college_id')
      .eq('student_id', dbUser.id),
    supabase
      .from('student_profiles')
      .select('full_name, is_complete, desired_course, stream, city, state')
      .eq('user_id', dbUser.id)
      .single(),
  ])

  const bookings = bookingsRes.data ?? []
  const visits = visitsRes.data ?? []
  const savedCount = savedRes.data?.length ?? 0
  const profile = profileRes.data

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  const stats = [
    {
      label: 'Bookings',
      value: bookings.length,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'bg-primary-light text-primary',
      href: '/dashboard/bookings',
      desc: 'Counselling sessions',
    },
    {
      label: 'Visit Requests',
      value: visits.length,
      icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
      color: 'bg-surface-warm text-amber-700',
      href: '/dashboard/visits',
      desc: 'Campus visits',
    },
    {
      label: 'Saved Colleges',
      value: savedCount,
      icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
      color: 'bg-green-50 text-green-700',
      href: '/dashboard/saved',
      desc: 'Your favorites',
    },
  ]

  const quickLinks = [
    { label: 'Explore Colleges', href: '/colleges', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', desc: 'Discover new institutions' },
    { label: 'Book Counselling', href: '/dashboard/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Schedule a free session' },
    { label: 'Compare Colleges', href: '/colleges/compare', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', desc: 'Side-by-side comparison' },
    { label: 'Update Profile', href: '/dashboard/settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', desc: 'Keep your details current' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>
            Welcome back, {profile?.full_name ?? 'Student'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your activity and next steps.
          </p>
        </div>
        {profile && (
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 shadow-soft">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white">
              {(profile.full_name ?? 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{profile.full_name}</p>
              <p className="text-[10px] text-muted-foreground">{profile.desired_course} &middot; {profile.stream} &middot; {profile.city}</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile completion banner */}
      {profile && !profile.is_complete && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Complete your profile</p>
              <p className="text-xs text-amber-700">Fill in all required details to book counselling sessions.</p>
            </div>
          </div>
          <Link href="/dashboard/settings" className="shrink-0 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Complete Now
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{stat.desc}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d={stat.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Recent Bookings
            </h2>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
              View all
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No bookings yet.</p>
              <Link href="/dashboard/bookings" className="mt-2 text-xs font-semibold text-primary hover:underline">
                Book your first session
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {bookings.map((b) => {
                const bStatus = b.status as string
                const bType = b.booking_type as string
                const bDate = b.preferred_date as string
                const bTime = b.preferred_time as string
                const bLink = (b as Record<string, unknown>).meeting_link as string | null
                return (
                  <div key={b.id} className="rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:bg-muted/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {bType === 'free_call' ? 'Free Counselling Call' : bType}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {bDate} at {bTime}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[bStatus] ?? statusStyles.pending}`}>
                        {bStatus}
                      </span>
                    </div>
                    {(bStatus === 'confirmed' || bStatus === 'completed') && bLink && (
                      <a href={bLink} target="_blank" rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M15 10l5-5m0 0h-4m4 0v4M9 14l-5 5m0 0h4m-4 0v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Join Meeting
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Visits */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Recent Visit Requests
            </h2>
            <Link href="/dashboard/visits" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
              View all
            </Link>
          </div>
          {visits.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No visit requests yet.</p>
              <Link href="/colleges" className="mt-2 text-xs font-semibold text-primary hover:underline">
                Explore colleges to visit
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {visits.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:bg-muted/60">
                  <div>
                    <p className="text-sm font-semibold text-foreground">College Visit</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{v.visit_date}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(action => (
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
      </div>
    </div>
  )
}
