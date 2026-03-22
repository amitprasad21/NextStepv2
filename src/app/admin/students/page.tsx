'use client'

import { useEffect, useState } from 'react'

interface Student {
  id: string
  email: string
  is_verified: boolean
  created_at: string
  student_profiles: Array<{
    full_name: string
    city: string
    state: string
    stream: string
    is_complete: boolean
  }>
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchStudents = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), pageSize: '20' })
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/students?${params}`)
    const data = await res.json()
    setStudents(data.data ?? [])
    setTotalCount(data.count ?? 0)
    setLoading(false)
  }

  useEffect(() => { fetchStudents() }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchStudents()
  }

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Students</h1>
      <p className="mt-1 text-sm text-muted-foreground">View and manage registered students.</p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <path d="M14 14l-4-4m1.333-3.333a4.667 4.667 0 11-9.333 0 4.667 4.667 0 019.333 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90">
          Search
        </button>
      </form>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount}</span> students total
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stream</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {students.map((s) => {
                  const p = s.student_profiles?.[0]
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-4 text-foreground">{s.email}</td>
                      <td className="px-5 py-4 text-muted-foreground">{p?.full_name || '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{p ? `${p.city}, ${p.state}` : '—'}</td>
                      <td className="px-5 py-4">
                        {p?.stream ? (
                          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">{p.stream}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
                          p?.is_complete ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}>
                          {p?.is_complete ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <p className="text-sm text-muted-foreground">No students found.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Previous
              </button>
              <span className="px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40">
                Next
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
