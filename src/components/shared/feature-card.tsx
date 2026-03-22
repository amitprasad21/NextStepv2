'use client'

import { type ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  accent?: string
}

export function FeatureCard({ icon, title, description, accent = 'bg-primary-light' }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card p-7 transition-all duration-500 hover:shadow-lifted hover:-translate-y-1 hover:border-primary/20">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent} transition-transform duration-500 group-hover:scale-110`}>
        {icon}
      </div>
      <h3
        className="mt-5 text-lg font-semibold text-foreground"
        style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {/* Subtle gradient line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  )
}
