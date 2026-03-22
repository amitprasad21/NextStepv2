'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SaveToggle } from './save-toggle'

interface CollegeCardProps {
  id: string
  name: string
  city: string
  state: string
  feeMin?: number | null
  feeMax?: number | null
  description?: string | null
  index?: number
}

export function CollegeCard({ id, name, city, state, feeMin, feeMax, description, index = 0 }: CollegeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/colleges/${id}`}
        className="group relative block rounded-2xl border border-border/60 bg-card p-6 transition-all duration-500 hover:shadow-lifted hover:-translate-y-1 hover:border-primary/20"
      >
        {/* Color accent strip */}
        <div className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-primary via-primary/60 to-secondary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Location badge */}
        <div className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-primary">
            <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333zM8 7.667a1.667 1.667 0 110-3.334 1.667 1.667 0 010 3.334z" fill="currentColor"/>
          </svg>
          {city}, {state}
        </div>

        <h3 className="mt-3 text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary" style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
          {name}
        </h3>

        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {(feeMin || feeMax) && (
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Fee range:</span>
            <span className="text-sm font-semibold text-primary">
              {feeMin?.toLocaleString('en-IN') ?? '—'} – {feeMax?.toLocaleString('en-IN') ?? '—'}
            </span>
            <span className="text-xs text-muted-foreground">INR/year</span>
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>

      {/* Save toggle */}
      <SaveToggle collegeId={id} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-card/80 backdrop-blur-sm shadow-sm" size={16} />
    </motion.div>
  )
}
