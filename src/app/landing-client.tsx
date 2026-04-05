'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/animated-section'
import { FeatureCard } from '@/components/shared/feature-card'
import { StatCounter } from '@/components/shared/stat-counter'
import { TestimonialCarousel } from '@/components/shared/testimonial-carousel'
import { CollegeCard } from '@/components/shared/college-card'
import RotatingText from '@/components/shared/rotating-text'
import { HeroIllustration } from '@/components/shared/hero-illustration'
import { createClient } from '@/lib/supabase/client'

interface FeaturedCollege {
  id: string
  name: string
  city: string
  state: string
  image_paths: string[]
  fee_min: number | null
  fee_max: number | null
  description: string | null
  placement_rate: number | null
  college_type: string | null
  established_year: number | null
  accreditation: string | null
  hostel_available: boolean
  scholarship: boolean
}

export function LandingClient({ colleges }: { colleges: FeaturedCollege[] }) {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 40])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
    })
  }, [])

  const ctaHref = isLoggedIn ? '/dashboard' : '/auth/login'

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="solid" />

      {/* ============ HERO — Split layout with illustration ============ */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-primary-dark">
        {/* Gradient blobs */}
        <div className="absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#588157]/20 blur-[160px] animate-breathe" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#6a9b68]/14 blur-[140px] animate-breathe" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grain texture */}
        <div className="grain absolute inset-0" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative mx-auto max-w-7xl px-6 py-24 w-full">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-8">

            {/* ---- Left: Text content (60%) ---- */}
            <div className="lg:col-span-3 text-center lg:text-left">
              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-[2.5rem] font-bold leading-[1.1] text-white sm:text-[3.25rem] lg:text-[4rem] tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Find your perfect college,
                <br />
                <RotatingText
                  texts={['simplified', 'sorted', 'secured']}
                  mainClassName="px-3 sm:px-4 md:px-5 bg-white/[0.12] text-white border border-white/[0.15] overflow-hidden py-1 sm:py-1.5 md:py-2 justify-center rounded-xl inline-flex backdrop-blur-sm mt-2"
                  staggerFrom="last"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-120%' }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-6 text-lg leading-relaxed text-white/50 sm:text-xl max-w-xl mx-auto lg:mx-0"
              >
                Compare colleges, book counselling, and schedule campus visits — all in one place.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center"
              >
                <Link
                  href={ctaHref}
                  className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-primary-dark shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Get started'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                    <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/colleges"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-[15px] font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] hover:border-white/25 hover:text-white"
                >
                  Browse colleges
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white/40">
                    <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>

              {/* Trust metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-12 flex items-center justify-center gap-8 sm:gap-12 lg:justify-start"
              >
                {[
                  { value: '500+', label: 'Colleges' },
                  { value: '10K+', label: 'Students' },
                  { value: '98%', label: 'Satisfaction' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {i > 0 && <div className="h-4 w-px bg-white/10 -ml-4 sm:-ml-6" />}
                    <div className={i > 0 ? 'pl-4 sm:pl-6' : ''}>
                      <p className="text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: 'var(--font-sans)' }}>{item.value}</p>
                      <p className="text-xs text-white/35 font-medium">{item.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ---- Right: Illustration (40%) ---- */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 flex justify-center lg:justify-end"
            >
              <HeroIllustration className="w-full max-w-[420px] lg:max-w-none" />
            </motion.div>

          </div>
        </motion.div>

        {/* Scroll-down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => {
            const heroSection = document.querySelector('#featured-colleges')
            heroSection?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/30">
              <path d="M7 13l5 5 5-5M7 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ============ FEATURED COLLEGES ============ */}
      {colleges.length > 0 && (
        <section id="featured-colleges" className="relative border-t border-border/40 py-24 px-6">
          <div className="mx-auto max-w-6xl">
            <AnimatedSection className="flex flex-col items-center justify-between gap-5 sm:flex-row">
              <div>
                <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  Featured
                </span>
                <h2 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  Top colleges on NextStep
                </h2>
              </div>
              <Link
                href="/colleges"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-all hover:shadow-lifted hover:border-primary/20 hover:-translate-y-0.5"
              >
                View all colleges
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary">
                  <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  placementRate={college.placement_rate}
                  collegeType={college.college_type}
                  imagePaths={college.image_paths}
                  establishedYear={college.established_year}
                  accreditation={college.accreditation}
                  hostelAvailable={college.hostel_available}
                  scholarship={college.scholarship}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FEATURES — Stripe bento style ============ */}
      <section className="relative py-32 px-6 border-t border-border/30">
        <div className="absolute inset-0 mesh-gradient" />

        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Why NextStep
            </span>
            <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-[2.75rem] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Everything you need for your<br className="hidden sm:block" /> admission journey
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-muted-foreground leading-relaxed">
              From discovering the right college to booking campus visits, we have got every step covered.
            </p>
          </AnimatedSection>

          <StaggerContainer className="mt-16 grid gap-5 md:grid-cols-3" staggerDelay={0.12}>
            <StaggerItem>
              <FeatureCard
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
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
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="Book Counselling"
                description="Schedule one-on-one sessions with verified counsellors who understand your unique admission needs."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                title="Visit Campuses"
                description="Request and track in-person college visits, coordinated by the NextStep team for a hassle-free experience."
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ============ STATS — dark section with depth ============ */}
      <section className="relative overflow-hidden bg-primary-dark py-28 px-6">
        {/* Gradient orbs */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-[#588157]/25 blur-[120px]" />
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-[#6a9b68]/18 blur-[120px]" />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <StatCounter end={500} suffix="+" label="Partner Colleges" />
          <StatCounter end={10000} suffix="+" label="Students Guided" />
          <StatCounter end={2500} suffix="+" label="Counselling Sessions" />
          <StatCounter end={98} suffix="%" label="Satisfaction Rate" />
        </div>
      </section>

      {/* ============ HOW IT WORKS — Stripe step cards ============ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 mesh-gradient opacity-50" />

        <div className="relative mx-auto max-w-5xl">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              How It Works
            </span>
            <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-[2.75rem] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Three simple steps to your<br className="hidden sm:block" /> dream college
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Sign up and tell us about your academics, preferences, and dream course. It takes less than 2 minutes.',
                icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                gradient: 'from-[#588157]/8 to-[#588157]/[0.02]',
              },
              {
                step: '02',
                title: 'Explore & Compare',
                desc: 'Browse our curated list of colleges, filter by what matters to you, and save your favourites for easy comparison.',
                icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
                gradient: 'from-[#90a955]/8 to-[#90a955]/[0.02]',
              },
              {
                step: '03',
                title: 'Book & Visit',
                desc: 'Schedule a free counselling call with an expert or request a campus visit. We handle the coordination.',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                gradient: 'from-[#ecf39e]/10 to-[#ecf39e]/[0.02]',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 0.12}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/15 hover:shadow-lifted">
                  {/* Gradient top bar */}
                  <div className={`h-1 bg-gradient-to-r ${item.gradient}`} />

                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.06] text-primary transition-all duration-500 group-hover:bg-primary/10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-4xl font-bold text-foreground/[0.04] transition-colors duration-500 group-hover:text-primary/[0.08]"
                            style={{ fontFamily: 'var(--font-sans)' }}>
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative border-t border-border/40 py-32 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />

        <div className="relative mx-auto max-w-4xl px-6">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Student Stories
            </span>
            <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Hear from students who<br className="hidden sm:block" /> found their path
            </h2>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.2} className="relative mt-14">
          <TestimonialCarousel />
        </AnimatedSection>
      </section>

      {/* ============ CTA — Stripe-style final section ============ */}
      <section className="relative overflow-hidden py-32 px-6">
        <div className="absolute inset-0 bg-primary-dark" />

        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#588157]/25 blur-[120px]" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#6a9b68]/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-[#90a955]/10 blur-[100px]" />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <AnimatedSection variant="scaleIn" className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Ready to take the<br /> next step?
          </h2>
          <p className="mt-6 text-lg text-white/45 leading-relaxed">
            Join thousands of students who are already navigating their college journey with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-primary-dark shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start your journey'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-[15px] font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/25 hover:text-white"
            >
              Explore colleges
            </Link>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  )
}
