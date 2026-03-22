'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CollegeCard } from '@/components/shared/college-card'
import { AnimatedSection } from '@/components/shared/animated-section'

interface College {
  id: string
  name: string
  city: string
  state: string
  fee_min: number | null
  fee_max: number | null
  image_paths: string[]
  description: string | null
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    stream: '',
    page: 1,
  })

  const fetchColleges = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', filters.page.toString())
    params.set('pageSize', '20')
    if (filters.search) params.set('search', filters.search)
    if (filters.state) params.set('state', filters.state)
    if (filters.stream) params.set('stream', filters.stream)

    const res = await fetch(`/api/colleges?${params}`)
    const data = await res.json()
    setColleges(data.data ?? [])
    setCount(data.count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchColleges()
  }, [filters.page, filters.state, filters.stream])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, page: 1 }))
    fetchColleges()
  }

  const totalPages = Math.ceil(count / 20)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-primary-dark py-16 px-5">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,158,11,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl text-center">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Explore Colleges</h1>
            <p className="mt-3 text-white/60">
              Find the perfect college from our curated list of {count > 0 ? `${count}+` : ''} institutions across India.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-8">
        {/* Filters */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Search</label>
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <path d="M14 14l-4-4m1.333-3.333a4.667 4.667 0 11-9.333 0 4.667 4.667 0 019.333 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search by college name..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stream</label>
            <select
              value={filters.stream}
              onChange={(e) => setFilters((f) => ({ ...f, stream: e.target.value, page: 1 }))}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Streams</option>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">State</label>
            <input
              type="text"
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              placeholder="Filter by state..."
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Search
          </button>
          <Link
            href="/colleges/compare"
            className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:shadow-soft"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Compare
          </Link>
        </form>

        {/* Results */}
        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading colleges...
          </div>
        ) : colleges.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="mt-4 text-muted-foreground">No colleges found matching your filters.</p>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{colleges.length}</span> of{' '}
              <span className="font-semibold text-foreground">{count}</span> colleges
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {colleges.map((c, i) => (
                <CollegeCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  city={c.city}
                  state={c.state}
                  feeMin={c.fee_min}
                  feeMax={c.fee_max}
                  description={c.description}
                  index={i}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                  disabled={filters.page === 1}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-1 px-4">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setFilters((f) => ({ ...f, page }))}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          filters.page === page
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                  disabled={filters.page === totalPages}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
