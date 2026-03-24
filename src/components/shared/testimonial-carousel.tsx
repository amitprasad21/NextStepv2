'use client'

import { useEffect, useCallback, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const testimonials = [
  {
    quote: "NextStep made my college search so much easier. The counselling sessions were incredibly helpful in narrowing down my choices.",
    name: "Priya Sharma",
    detail: "B.Tech CSE, NIT Trichy",
    initial: "P",
  },
  {
    quote: "I was overwhelmed by options until I found NextStep. The campus visit feature helped me experience colleges before making my decision.",
    name: "Arjun Patel",
    detail: "BBA, Christ University",
    initial: "A",
  },
  {
    quote: "The personalized guidance from NextStep counsellors helped me find colleges I hadn't even considered. Truly a game changer.",
    name: "Sneha Reddy",
    detail: "B.Tech ECE, VIT Vellore",
    initial: "S",
  },
  {
    quote: "From JEE counselling to college visits, NextStep handled everything seamlessly. I couldn't have asked for a better experience.",
    name: "Rahul Kumar",
    detail: "B.Tech ME, IIT Dhanbad",
    initial: "R",
  },
]

export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <div className="relative">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {testimonials.map((t, i) => (
            <div key={i} className="embla__slide px-4 md:px-12">
              <div className="mx-auto max-w-2xl rounded-2xl border border-border/40 bg-card p-8 md:p-10 shadow-soft">
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="var(--gold)" className="text-gold">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                <blockquote
                  className="mt-5 text-lg leading-relaxed text-foreground md:text-xl"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-6 flex items-center gap-3 border-t border-border/30 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={scrollPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-all hover:shadow-lifted hover:border-primary/20"
          aria-label="Previous testimonial"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? 'w-6 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-all hover:shadow-lifted hover:border-primary/20"
          aria-label="Next testimonial"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
