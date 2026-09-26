import { useLayoutEffect, useRef } from 'react'
import { useInView } from 'motion/react'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { LilyMark } from '@/components/lily/LilyMark'
import { finalMessage } from '@/data/memories'
import { gsap } from '@/lib/gsap'

const particles = Array.from({ length: 26 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 92}%`,
  delay: `${(index % 8) * 0.35}s`,
  dur: `${6 + (index % 5)}s`,
  size: index % 3 === 0 ? 5 : 3,
}))

function FinalLine({
  text,
  className,
}: {
  text: string
  className: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })

  return (
    <div ref={ref} className="flex min-h-[68vh] items-center justify-center">
      <TextEffect
        as="p"
        per="word"
        preset="fade"
        trigger={inView}
        speedReveal={0.45}
        speedSegment={0.6}
        className={className}
      >
        {text}
      </TextEffect>
    </div>
  )
}

export function FinalSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const lilyRef = useRef<HTMLDivElement>(null)
  const lilyInView = useInView(lilyRef, { once: true, margin: '-10% 0px' })

  useLayoutEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    if (!section || !copy) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        section,
        { backgroundColor: '#F8F5EF' },
        {
          backgroundColor: '#14201A',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
          },
        },
      )
      gsap.fromTo(
        copy,
        { color: '#332D2F' },
        {
          color: '#F8F5EF',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'center center',
            scrub: true,
          },
        },
      )
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="finale" ref={sectionRef} className="relative overflow-hidden bg-cream px-6 pb-24 pt-10">
      <div className="particle-field pointer-events-none absolute inset-0" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={`${particle.left}-${particle.top}`}
            className="particle absolute rounded-full bg-dusty-pink"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              ['--dur' as string]: particle.dur,
            }}
          />
        ))}
      </div>

      <div ref={copyRef} className="relative z-10 mx-auto max-w-5xl text-center text-deep-brown">
        <FinalLine text={finalMessage.line1} className="font-display text-section" />
        <FinalLine text={finalMessage.line2} className="font-display text-finale" />
        <FinalLine
          text={finalMessage.line3}
          className="mx-auto max-w-xl font-body text-lg leading-relaxed md:text-2xl"
        />
        <div ref={lilyRef} className="mx-auto mt-6 w-36">
          {lilyInView ? <LilyMark className="h-auto w-full" title="A lily, resting" /> : (
            <div className="h-64" />
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-6 text-lily-green/50"
        aria-hidden="true"
      >
        <LilyMark variant="silhouette" className="h-28 w-16" />
        <LilyMark variant="silhouette" className="h-36 w-20" />
        <LilyMark variant="silhouette" className="h-24 w-14" />
      </div>
    </section>
  )
}
