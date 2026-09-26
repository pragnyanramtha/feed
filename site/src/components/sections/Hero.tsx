import { useLayoutEffect, useRef } from 'react'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { LilyMark } from '@/components/lily/LilyMark'
import { heroKicker, heroName, heroTagline, scrollHint } from '@/data/memories'
import { gsap } from '@/lib/gsap'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const lilyRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const lily = lilyRef.current
    const copy = copyRef.current
    if (!section || !lily || !copy) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(lily, {
        scale: 1.22,
        y: 70,
        opacity: 0.28,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.to(copy, {
        y: -36,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-cream px-6 py-16"
    >
      <div ref={lilyRef} className="h-44 w-36 overflow-hidden md:h-60 md:w-48">
        <LilyMark className="-mt-2 h-[210%] w-full" title="Lily in bloom" />
      </div>

      <div ref={copyRef} className="relative z-10 mx-auto max-w-6xl text-center">
        <p className="mb-6 font-body text-xs uppercase tracking-kicker text-deep-brown">
          {heroKicker}
        </p>
        <TextEffect
          as="h1"
          per="char"
          preset="fade"
          speedReveal={0.65}
          speedSegment={0.7}
          className="font-display text-hero text-deep-brown"
        >
          {heroName}
        </TextEffect>
        <TextEffect
          as="p"
          per="word"
          preset="slide"
          delay={0.55}
          speedReveal={0.75}
          className="mx-auto mt-8 max-w-md font-body text-base text-deep-brown md:text-lg"
        >
          {heroTagline}
        </TextEffect>
        <p className="mt-16 font-accent text-2xl text-deep-brown">{scrollHint}</p>
      </div>
    </section>
  )
}
