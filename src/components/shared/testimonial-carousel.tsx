'use client'

import { useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const testimonials = [
  {
    quote: "NextStep made my college search so much easier. The counselling sessions were incredibly helpful in narrowing down my choices.",
    name: "Priya Sharma",
    detail: "B.Tech CSE, NIT Trichy",
  },
  {
    quote: "I was overwhelmed by options until I found NextStep. The campus visit feature helped me experience colleges before making my decision.",
    name: "Arjun Patel",
    detail: "BBA, Christ University",
  },
  {
    quote: "The personalized guidance from NextStep counsellors helped me find colleges I hadn't even considered. Truly a game changer.",
    name: "Sneha Reddy",
    detail: "B.Tech ECE, VIT Vellore",
  },
  {
    quote: "From JEE counselling to college visits, NextStep handled everything seamlessly. I couldn't have asked for a better experience.",
    name: "Rahul Kumar",
    detail: "B.Tech ME, IIT Dhanbad",
  },
]

export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
  }, [emblaApi])

  return (
    <div className="relative">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {testimonials.map((t, i) => (
            <div key={i} className="embla__slide px-4 md:px-8">
              <div className="mx-auto max-w-2xl text-center">
                {/* Quotation mark */}
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M11 7.5H7.5C5.567 7.5 4 9.067 4 11v0c0 1.933 1.567 3.5 3.5 3.5H9v1c0 1.933-1.567 3.5-3.5 3.5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M20 7.5h-3.5C14.567 7.5 13 9.067 13 11v0c0 1.933 1.567 3.5 3.5 3.5H18v1c0 1.933-1.567 3.5-3.5 3.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <blockquote
                  className="text-lg leading-relaxed text-foreground md:text-xl"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-soft transition-all hover:shadow-lifted hover:bg-accent"
        aria-label="Previous testimonial"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-soft transition-all hover:shadow-lifted hover:bg-accent"
        aria-label="Next testimonial"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
