'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StudentProfile {
  full_name: string
  city: string
  state: string
  stream: string
  is_complete: boolean
  phone: string | null
  marks_10th: number | null
  marks_12th: number | null
  jee_rank: number | null
  mht_cet_score: number | null
  neet_score: number | null
  desired_course: string | null
  desired_branch: string | null
  gender: string | null
  date_of_birth: string | null
  board_10th: string | null
  board_12th: string | null
  budget_min: number | null
  budget_max: number | null
  parent_name: string | null
  parent_phone: string | null
  address: string | null
  pincode: string | null
  other_exam_name: string | null
  other_exam_score: number | null
}

interface Student {
  id: string
  email: string
  is_verified: boolean
  created_at: string
  student_profiles: StudentProfile[]
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Students</h1>
      <p className="mt-1 text-sm text-muted-foreground">View and manage registered students with detailed profiles.</p>

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

          <div className="mt-3 space-y-3">
            {students.map((s) => {
              const p = s.student_profiles?.[0]
              const isExpanded = expandedId === s.id
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden"
                >
                  {/* Summary row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-sm shrink-0">
                        {(p?.full_name || s.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p?.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {p?.city && <span className="hidden sm:inline text-xs text-muted-foreground">{p.city}, {p.state}</span>}
                      {p?.stream && <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">{p.stream}</span>}
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                        p?.is_complete ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}>{p?.is_complete ? 'Complete' : 'Incomplete'}</span>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && p && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/40 p-5 bg-muted/20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {/* Personal */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Personal</h4>
                            <InfoRow label="Phone" value={p.phone} />
                            <InfoRow label="Gender" value={p.gender} />
                            <InfoRow label="DOB" value={p.date_of_birth} />
                            <InfoRow label="Address" value={p.address} />
                            <InfoRow label="Pincode" value={p.pincode} />
                            <InfoRow label="Parent" value={p.parent_name} />
                            <InfoRow label="Parent Phone" value={p.parent_phone} />
                          </div>
                          {/* Academic */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Academic</h4>
                            <InfoRow label="10th Marks" value={p.marks_10th != null ? `${p.marks_10th}%` : null} />
                            <InfoRow label="10th Board" value={p.board_10th} />
                            <InfoRow label="12th Marks" value={p.marks_12th != null ? `${p.marks_12th}%` : null} />
                            <InfoRow label="12th Board" value={p.board_12th} />
                            <InfoRow label="Course" value={p.desired_course} />
                            <InfoRow label="Branch" value={p.desired_branch} />
                          </div>
                          {/* Exams & Budget */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exams & Budget</h4>
                            <InfoRow label="JEE Rank" value={p.jee_rank?.toString()} />
                            <InfoRow label="MHT-CET" value={p.mht_cet_score?.toString()} />
                            <InfoRow label="NEET" value={p.neet_score?.toString()} />
                            {p.other_exam_name && <InfoRow label={p.other_exam_name} value={p.other_exam_score?.toString()} />}
                            <InfoRow label="Budget" value={
                              p.budget_min || p.budget_max
                                ? `₹${(p.budget_min ?? 0).toLocaleString('en-IN')} – ₹${(p.budget_max ?? 0).toLocaleString('en-IN')}/yr`
                                : null
                            } />
                          </div>
                        </div>
                        <div className="border-t border-border/40 px-5 py-3 bg-muted/10">
                          <p className="text-[10px] text-muted-foreground">Joined {new Date(s.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {students.length === 0 && (
            <div className="mt-8 flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No students found.</p>
            </div>
          )}

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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-muted-foreground shrink-0">{label}</span>
      <span className="text-[11px] font-medium text-foreground text-right truncate">{value || '—'}</span>
    </div>
  )
}
