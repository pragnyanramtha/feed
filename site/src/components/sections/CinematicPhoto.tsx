import { useLayoutEffect, useRef } from 'react'
import { cinematicLine, cinematicPhoto } from '@/data/memories'
import { gsap } from '@/lib/gsap'

export function CinematicPhoto() {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const frame = frameRef.current
    const text = textRef.current
    if (!section || !frame || !text) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      })
      timeline.fromTo(
        frame,
        { clipPath: 'inset(18% 14% 18% 14% round 1.5rem)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0rem)', ease: 'none', duration: 1 },
        0,
      )
      timeline.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'none' }, 0.38)
      timeline.to(text, { opacity: 0, duration: 0.16, ease: 'none' }, 0.78)
    })

    mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
      gsap.set(frame, { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.fromTo(
        text,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="cinematic" ref={sectionRef} className="relative h-[100svh] bg-night">
      <div ref={frameRef} className="cinematic-frame h-full w-full overflow-hidden">
        <img
          src={cinematicPhoto.src}
          alt={cinematicPhoto.caption ?? 'A wide photograph'}
          className="h-full w-full object-cover"
        />
      </div>
      <p
        ref={textRef}
        className="caption-shadow pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center font-display text-section text-cream opacity-0"
      >
        {cinematicLine}
      </p>
    </section>
  )
}
