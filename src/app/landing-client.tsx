'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/animated-section'
import { FeatureCard } from '@/components/shared/feature-card'
import { StatCounter } from '@/components/shared/stat-counter'
import { TestimonialCarousel } from '@/components/shared/testimonial-carousel'
import { CollegeCard } from '@/components/shared/college-card'

interface FeaturedCollege {
  id: string
  name: string
  city: string
  state: string
  image_paths: string[]
  fee_min: number | null
  fee_max: number | null
  description: string | null
}

export function LandingClient({ colleges }: { colleges: FeaturedCollege[] }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="transparent" />

      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[95vh] items-center overflow-hidden bg-primary-dark">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px] animate-float" />
          <div className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/15 blur-[130px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/15 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
          <div className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-gold/10 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative mx-auto max-w-7xl px-5 py-24 w-full">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left column — copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm shadow-lg shadow-black/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  Trusted by 10,000+ students across India
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
                className="mt-6 text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your College
                <br />
                Admission Journey,{' '}
                <span className="relative inline-block">
                  <span className="text-gradient">Simplified</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-secondary to-secondary/0"
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-white/55"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Discover colleges, book expert counselling sessions, and schedule
                campus visits — all in one place. Built for students navigating
                admissions in India.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <Link
                  href={isLoggedIn ? '/dashboard' : '/auth/login'}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary-dark shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/colleges"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/5"
                >
                  Browse Colleges
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="mt-10 flex items-center gap-6"
              >
                {[
                  { label: '500+', sub: 'Colleges' },
                  { label: '10K+', sub: 'Students' },
                  { label: '98%', sub: 'Satisfaction' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-sans)' }}>{item.label}</span>
                    <span className="text-xs text-white/40">{item.sub}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right column — floating cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative h-[460px] w-full">
                {/* Card 1 - Stats */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-4 top-4 w-72 rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl shadow-2xl shadow-black/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/20 shadow-inner">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-secondary">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">500+ Colleges</p>
                      <p className="text-xs text-white/45">Across all states</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {['Mumbai', 'Delhi', 'Pune'].map(city => (
                      <span key={city} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/50">{city}</span>
                    ))}
                  </div>
                </motion.div>

                {/* Card 2 - Booking confirmed */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute right-0 top-28 w-64 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl shadow-2xl shadow-black/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 shadow-inner">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Booking Confirmed</p>
                      <p className="text-xs text-white/45">Counselling session ready</p>
                    </div>
                  </div>
                </motion.div>

                {/* Card 3 - Campus visit */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="absolute left-12 bottom-4 w-60 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl shadow-2xl shadow-black/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/30 shadow-inner">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Campus Visit</p>
                      <p className="text-xs text-white/45">IIT Delhi — Scheduled</p>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative ring */}
                <div className="absolute right-12 bottom-20 h-24 w-24 rounded-full border border-white/5" />
                <div className="absolute right-16 bottom-24 h-16 w-16 rounded-full border border-white/[0.03]" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 0 480 0 720 40s480 40 720 0V80H0z" fill="var(--background)"/>
          </svg>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
              Why NextStep
            </span>
            <h2 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Everything you need for your<br className="hidden sm:block" /> admission journey
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground text-lg leading-relaxed">
              From discovering the right college to booking campus visits, we have got every step covered.
            </p>
          </AnimatedSection>

          <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-3" staggerDelay={0.15}>
            <StaggerItem>
              <FeatureCard
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="Discover Colleges"
                description="Filter by course, branch, location, fees, and eligibility. Compare colleges side by side with detailed insights."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="Book Counselling"
                description="Schedule one-on-one sessions with verified NextStep counsellors who understand your unique admission needs."
                accent="bg-surface-warm"
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="Visit Campuses"
                description="Request and track in-person college visits, coordinated by the NextStep team for a hassle-free experience."
                accent="bg-green-50"
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="relative overflow-hidden border-y bg-primary-dark py-24 px-5">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <StatCounter end={500} suffix="+" label="Partner Colleges" />
          <StatCounter end={10000} suffix="+" label="Students Guided" />
          <StatCounter end={2500} suffix="+" label="Counselling Sessions" />
          <StatCounter end={98} suffix="%" label="Satisfaction Rate" />
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-28 px-5">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
              How It Works
            </span>
            <h2 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Three simple steps to your<br className="hidden sm:block" /> dream college
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Sign up and tell us about your academics, preferences, and dream course. It takes less than 2 minutes.',
                icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              },
              {
                step: '02',
                title: 'Explore & Compare',
                desc: 'Browse our curated list of colleges, filter by what matters to you, and save your favourites for easy comparison.',
                icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
              },
              {
                step: '03',
                title: 'Book & Visit',
                desc: 'Schedule a free counselling call with an expert or request a campus visit. We handle the coordination.',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 0.15}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 transition-all duration-500 hover:shadow-lifted hover:-translate-y-1">
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold text-primary/10 transition-colors duration-500 group-hover:text-primary/20"
                          style={{ fontFamily: 'var(--font-serif)' }}>
                      {item.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all group-hover:bg-primary/10 group-hover:scale-110">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                  {i < 2 && (
                    <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-border md:block" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED COLLEGES ============ */}
      {colleges.length > 0 && (
        <section className="bg-muted/50 py-28 px-5">
          <div className="mx-auto max-w-6xl">
            <AnimatedSection className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
                  Featured
                </span>
                <h2 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
                  Top colleges on NextStep
                </h2>
              </div>
              <Link
                href="/colleges"
                className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary shadow-soft transition-all hover:shadow-lifted hover:-translate-y-0.5"
              >
                View all colleges
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </AnimatedSection>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {colleges.map((college, i) => (
                <CollegeCard
                  key={college.id}
                  id={college.id}
                  name={college.name}
                  city={college.city}
                  state={college.state}
                  feeMin={college.fee_min}
                  feeMax={college.fee_max}
                  description={college.description}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-28 px-5">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
              Student Stories
            </span>
            <h2 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Hear from students who<br className="hidden sm:block" /> found their path
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="mt-12">
            <TestimonialCarousel />
          </AnimatedSection>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden py-28 px-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-dark" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-secondary/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

        <AnimatedSection variant="scaleIn" className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Ready to take the<br /> next step?
          </h2>
          <p className="mt-5 text-lg text-white/60 leading-relaxed">
            Join thousands of students who are already navigating their college journey with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/login'}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary-dark shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Your Journey'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:shadow-lg"
            >
              Explore Colleges
            </Link>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  )
}
