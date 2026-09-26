import { useLayoutEffect, useRef } from 'react'
import { introBody, introHeading, introPhoto } from '@/data/memories'
import { gsap } from '@/lib/gsap'
import { PetalField } from '@/components/global/PetalField'

export function BirthdayIntro() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const text = textRef.current
    const frame = frameRef.current
    const image = imageRef.current
    if (!section || !text || !frame || !image) return

    const mm = gsap.matchMedia()

    const bind = (scale: number, textShift: number, imageShift: number) => {
      gsap.fromTo(
        image,
        { scale: 1 },
        {
          scale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
      gsap.to(text, {
        yPercent: textShift,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.to(frame, {
        yPercent: imageShift,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      bind(1.15, -14, 10)
    })
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      bind(1.06, -6, 4)
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative overflow-hidden bg-cream px-6 py-28 md:px-16 md:py-40"
    >
      <PetalField />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-20">
        <div ref={textRef}>
          <h2 className="font-display text-section text-deep-brown">{introHeading}</h2>
          <p className="mt-8 max-w-md font-body text-base leading-relaxed text-deep-brown md:text-lg">
            {introBody}
          </p>
        </div>
        <div ref={frameRef} className="md:justify-self-end" data-magnetic>
          <div className="overflow-hidden rounded-3xl shadow-soft">
            <img
              ref={imageRef}
              src={introPhoto.src}
              alt={introPhoto.caption ?? 'Portrait'}
              width={900}
              height={1200}
              className="aspect-[3/4] w-full max-w-md origin-center object-cover will-change-transform"
            />
          </div>
          {introPhoto.caption ? (
            <p className="mt-4 max-w-md font-accent text-2xl text-deep-brown">
              {introPhoto.caption}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
