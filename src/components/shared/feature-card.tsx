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
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 transition-all duration-500 hover:shadow-lifted hover:-translate-y-1.5 hover:border-primary/20">
      {/* Background glow on hover */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

      <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${accent} transition-all duration-500 group-hover:scale-110 group-hover:shadow-md`}>
        {icon}
      </div>
      <h3
        className="relative mt-5 text-lg font-bold text-foreground"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {title}
      </h3>
      <p className="relative mt-2.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Bottom gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary via-violet-500 to-secondary opacity-0 transition-all duration-500 group-hover:opacity-60" />
    </div>
  )
}
