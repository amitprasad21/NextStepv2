'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection } from '@/components/shared/animated-section'
import { createClient } from '@/lib/supabase/client'

interface CollegeWithCourses {
  id: string
  name: string
  city: string
  state: string
  description: string | null
  fee_min: number | null
  fee_max: number | null
  daily_visit_capacity: number
  college_courses: Array<{
    id: string
    course_name: string
    branch: string | null
    stream: string
    duration_years: number | null
    annual_fee: number | null
    exams_accepted: string[]
  }>
}

export default function ComparePage() {
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [colleges, setColleges] = useState<CollegeWithCourses[]>([])
  const [allColleges, setAllColleges] = useState<{ id: string; name: string; city: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  // Fetch saved colleges as default options + all colleges for picker
  useEffect(() => {
    const fetchSaved = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (!dbUser) return

      const { data: saved } = await supabase
        .from('saved_colleges')
        .select('college_id')
        .eq('student_id', dbUser.id)

      if (saved) setSavedCollegeIds(saved.map(s => s.college_id))
    }

    const fetchAllColleges = async () => {
      const res = await fetch('/api/colleges?pageSize=50')
      const data = await res.json()
      setAllColleges((data.data ?? []).map((c: { id: string; name: string; city: string }) => ({
        id: c.id,
        name: c.name,
        city: c.city,
      })))
    }

    fetchSaved()
    fetchAllColleges()
  }, [])

  // Fetch full college data when selection changes
  useEffect(() => {
    if (selectedIds.length === 0) {
      setColleges([])
      return
    }

    const fetchDetails = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('colleges')
        .select('id, name, city, state, description, fee_min, fee_max, daily_visit_capacity, college_courses(id, course_name, branch, stream, duration_years, annual_fee, exams_accepted)')
        .in('id', selectedIds)
        .eq('status', 'active')

      setColleges((data as unknown as CollegeWithCourses[]) ?? [])
      setLoading(false)
    }

    fetchDetails()
  }, [selectedIds])

  const addCollege = (id: string) => {
    if (selectedIds.length >= 3 || selectedIds.includes(id)) return
    setSelectedIds(prev => [...prev, id])
    setPickerOpen(false)
  }

  const removeCollege = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id))
  }

  const availableColleges = allColleges.filter(c => !selectedIds.includes(c.id))

  // Get all unique course names across selected colleges
  const allCourseNames = [...new Set(colleges.flatMap(c => c.college_courses.map(cc => cc.course_name)))].sort()

  // Get all unique exams
  const allExams = [...new Set(colleges.flatMap(c => c.college_courses.flatMap(cc => cc.exams_accepted)))].sort()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark py-12 px-5">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 40% 30%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl text-center">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Compare Colleges</h1>
            <p className="mt-2 text-white/60">
              Select up to 3 colleges to compare side-by-side.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        {/* College selector */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.map(id => {
            const c = allColleges.find(x => x.id === id)
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2"
              >
                <span className="text-sm font-medium text-foreground">{c?.name ?? 'Loading...'}</span>
                <button
                  onClick={() => removeCollege(id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </motion.div>
            )
          })}

          {selectedIds.length < 3 && (
            <div className="relative">
              <button
                onClick={() => setPickerOpen(!pickerOpen)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add college
              </button>

              <AnimatePresence>
                {pickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full z-20 mt-2 w-80 max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lifted"
                  >
                    {savedCollegeIds.length > 0 && (
                      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Saved colleges</p>
                    )}
                    {availableColleges
                      .filter(c => savedCollegeIds.includes(c.id))
                      .map(c => (
                        <button
                          key={c.id}
                          onClick={() => addCollege(c.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-primary">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                          </svg>
                          {c.name}
                        </button>
                      ))}

                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">All colleges</p>
                    {availableColleges
                      .filter(c => !savedCollegeIds.includes(c.id))
                      .map(c => (
                        <button
                          key={c.id}
                          onClick={() => addCollege(c.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          {c.name}
                          <span className="ml-auto text-xs text-muted-foreground">{c.city}</span>
                        </button>
                      ))}

                    {availableColleges.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">No more colleges available.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Empty state */}
        {selectedIds.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Select colleges to compare
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add up to 3 colleges above to see a detailed side-by-side comparison.
            </p>
            <Link
              href="/colleges"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              Browse Colleges
            </Link>
          </div>
        )}

        {/* Comparison table */}
        {colleges.length >= 2 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 overflow-x-auto"
          >
            <div className="min-w-[640px]">
              {/* Header row */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)` }}>
                <div />
                {colleges.map(c => (
                  <div key={c.id} className="rounded-t-2xl border border-border/60 bg-card p-5 text-center">
                    <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                      {c.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.city}, {c.state}</p>
                  </div>
                ))}
              </div>

              {/* Comparison rows */}
              {[
                {
                  label: 'Fee Range',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm font-semibold text-primary">
                      {c.fee_min?.toLocaleString('en-IN') ?? '—'} – {c.fee_max?.toLocaleString('en-IN') ?? '—'}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">INR/yr</span>
                    </span>
                  ),
                },
                {
                  label: 'Visit Capacity',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground">{c.daily_visit_capacity} visitors/day</span>
                  ),
                },
                {
                  label: 'Courses',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground">{c.college_courses.length} available</span>
                  ),
                },
                {
                  label: 'Streams',
                  render: (c: CollegeWithCourses) => {
                    const streams = [...new Set(c.college_courses.map(cc => cc.stream))]
                    return (
                      <div className="flex flex-wrap gap-1">
                        {streams.map(s => (
                          <span key={s} className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">{s}</span>
                        ))}
                      </div>
                    )
                  },
                },
                {
                  label: 'Exams Accepted',
                  render: (c: CollegeWithCourses) => {
                    const exams = [...new Set(c.college_courses.flatMap(cc => cc.exams_accepted))]
                    return (
                      <div className="flex flex-wrap gap-1">
                        {exams.map(e => (
                          <span key={e} className="rounded-lg bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">{e}</span>
                        ))}
                      </div>
                    )
                  },
                },
              ].map((row, ri) => (
                <div
                  key={row.label}
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)` }}
                >
                  <div className={`flex items-center px-4 py-4 text-sm font-semibold text-muted-foreground ${ri % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    {row.label}
                  </div>
                  {colleges.map(c => (
                    <div key={c.id} className={`flex items-center border-x border-border/40 px-5 py-4 ${ri % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      {row.render(c)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Course-by-course comparison */}
              {allCourseNames.length > 0 && (
                <>
                  <div
                    className="mt-4 grid gap-4"
                    style={{ gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)` }}
                  >
                    <div className="flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Course Details
                    </div>
                    {colleges.map(c => (
                      <div key={c.id} className="border-x border-border/40 px-5 py-3" />
                    ))}
                  </div>

                  {allCourseNames.slice(0, 8).map((courseName, ci) => (
                    <div
                      key={courseName}
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)` }}
                    >
                      <div className={`flex items-center px-4 py-3 text-xs font-medium text-foreground ${ci % 2 === 0 ? 'bg-muted/20' : ''}`}>
                        {courseName}
                      </div>
                      {colleges.map(c => {
                        const course = c.college_courses.find(cc => cc.course_name === courseName)
                        return (
                          <div key={c.id} className={`border-x border-border/40 px-5 py-3 ${ci % 2 === 0 ? 'bg-muted/20' : ''}`}>
                            {course ? (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                  {course.annual_fee ? `${course.annual_fee.toLocaleString('en-IN')} INR/yr` : '—'}
                                </p>
                                {course.duration_years && (
                                  <p className="text-xs text-muted-foreground">{course.duration_years} years</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">Not offered</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && selectedIds.length >= 2 && (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading comparison...
          </div>
        )}

        {/* Single college selected - prompt for more */}
        {selectedIds.length === 1 && !loading && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">Add at least one more college to start comparing.</p>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
