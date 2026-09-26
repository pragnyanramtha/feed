import { useLayoutEffect, useRef } from 'react'
import { horizontalHeading, horizontalLede, horizontalMemories } from '@/data/memories'
import { gsap } from '@/lib/gsap'

export function HorizontalMemories() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 1)}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="memories" ref={sectionRef} className="bg-cream">
      <div className="h-memories" data-lenis-prevent-touch>
        <div
          ref={trackRef}
          className="flex w-max items-center gap-8 px-6 py-16 md:h-[100svh] md:gap-12 md:px-[8vw] md:py-0"
        >
          <div className="w-[78vw] shrink-0 snap-start md:w-[34vw]">
            <h2 className="font-display text-section text-deep-brown">{horizontalHeading}</h2>
            <p className="mt-4 font-accent text-3xl text-deep-brown">{horizontalLede}</p>
          </div>
          {horizontalMemories.map((photo) => (
            <article
              key={photo.src}
              data-magnetic
              className="w-[78vw] shrink-0 snap-center md:w-[32vw]"
            >
              <div className="overflow-hidden rounded-3xl shadow-soft">
                <img
                  src={photo.src}
                  alt={photo.caption ?? 'A memory'}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-4 font-body text-xs uppercase tracking-kicker text-deep-brown">
                {photo.date}
                {photo.location ? ` · ${photo.location}` : ''}
              </p>
              {photo.caption ? (
                <p className="mt-2 font-body text-sm text-deep-brown">{photo.caption}</p>
              ) : null}
              {photo.note ? (
                <p className="mt-2 font-accent text-3xl text-deep-brown">{photo.note}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
