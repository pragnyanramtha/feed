import { useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { timeline, timelineHeading, timelineLede } from '@/data/memories'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const line = lineRef.current
    if (!section || !line) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        },
      )
    })
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(line, { scaleY: 1 })
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="timeline" ref={sectionRef} className="relative bg-cream px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-section text-deep-brown">{timelineHeading}</h2>
        <p className="mt-4 max-w-md font-body text-base text-deep-brown">{timelineLede}</p>

        <ol className="relative mt-20">
          <div
            ref={lineRef}
            className="absolute top-0 bottom-0 left-3 w-px origin-top bg-lily-green md:left-1/2"
            aria-hidden="true"
          />
          {timeline.map((entry, index) => {
            const left = index % 2 === 0
            return (
              <li
                key={entry.year}
                className={cn(
                  'relative mb-20 pl-10 last:mb-0 md:w-1/2 md:pl-0',
                  left ? 'md:pr-16' : 'md:ml-[50%] md:pl-16',
                )}
              >
                <span
                  className={cn(
                    'absolute top-3 h-3 w-3 rounded-full bg-dusty-pink shadow-soft',
                    'left-3 -translate-x-1/2 md:left-auto',
                    left ? 'md:right-0 md:translate-x-1/2' : 'md:left-0 md:-translate-x-1/2',
                  )}
                  aria-hidden="true"
                />
                <motion.article
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-12% 0px' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(left && 'md:text-right')}
                >
                  <h3 className="font-display text-section text-deep-brown">{entry.year}</h3>
                  <div
                    className={cn(
                      'mt-4 overflow-hidden rounded-3xl shadow-soft',
                      entry.photo.polaroid && 'bg-white p-3 pb-10',
                    )}
                    style={{ rotate: `${entry.photo.rotate ?? 0}deg` }}
                    data-magnetic
                  >
                    <img
                      src={entry.photo.src}
                      alt={entry.photo.caption ?? `A photograph from ${entry.year}`}
                      className="aspect-[4/5] w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-4 font-body text-base leading-relaxed text-deep-brown">
                    {entry.text}
                  </p>
                </motion.article>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
