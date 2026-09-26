import { useLayoutEffect, useRef } from 'react'
import { lilyBody, lilyHeading } from '@/data/memories'
import { gsap } from '@/lib/gsap'
import {
  BLOOM_X,
  BLOOM_Y,
  LEAF_LEFT_D,
  LEAF_RIGHT_D,
  LILY_VIEWBOX,
  PETAL_D,
  STAMENS,
  STEM_D,
} from '@/components/lily/paths'

export function LilySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const svg = svgRef.current
    if (!section || !svg) return

    const petals = svg.querySelectorAll<SVGPathElement>('[data-petal]')
    const stamens = svg.querySelector('[data-stamen]')
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(petals, {
        svgOrigin: `${BLOOM_X} ${BLOOM_Y}`,
        rotation: (index) => index * 60,
        scale: 0.16,
      })
      if (stamens) gsap.set(stamens, { opacity: 0, svgOrigin: `${BLOOM_X} ${BLOOM_Y}` })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      timeline.to(petals, {
        scale: 1,
        duration: 0.42,
        stagger: 0.02,
        ease: 'none',
      })
      if (stamens) {
        timeline.to(stamens, { opacity: 1, duration: 0.12, ease: 'none' }, 0.32)
      }
      timeline.to(
        petals,
        {
          y: 210,
          opacity: 0,
          rotation: (index) => index * 60 + (index % 2 === 0 ? 22 : -22),
          duration: 0.38,
          stagger: 0.025,
          ease: 'none',
        },
        0.58,
      )
      if (stamens) {
        timeline.to(stamens, { y: 90, opacity: 0, duration: 0.22, ease: 'none' }, 0.64)
      }
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(petals, {
        svgOrigin: `${BLOOM_X} ${BLOOM_Y}`,
        rotation: (index) => index * 60,
        scale: 1,
        opacity: 1,
        y: 0,
      })
      if (stamens) gsap.set(stamens, { opacity: 1, y: 0 })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      id="lilies"
      ref={sectionRef}
      className="lily-scroll relative h-[170vh] bg-night text-cream md:h-[260vh] motion-reduce:h-auto!"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-12 px-6 motion-reduce:static! motion-reduce:h-auto! motion-reduce:py-28 md:flex-row md:gap-20 md:px-16">
        <div className="max-w-md">
          <h2 className="font-display text-section text-cream">{lilyHeading}</h2>
          <p className="mt-6 font-body text-base leading-relaxed text-cream md:text-lg">{lilyBody}</p>
        </div>
        <svg
          ref={svgRef}
          viewBox={LILY_VIEWBOX}
          className="h-[min(62vh,460px)] w-auto overflow-visible"
          aria-hidden="true"
        >
          <path d={STEM_D} fill="none" stroke="#8FA58B" strokeWidth={2} strokeLinecap="round" />
          <path d={LEAF_LEFT_D} fill="#8FA58B" />
          <path d={LEAF_RIGHT_D} fill="#8FA58B" opacity={0.8} />
          {Array.from({ length: 6 }).map((_, index) => (
            <path
              key={index}
              data-petal
              d={PETAL_D}
              fill={index % 2 === 0 ? '#D8B7C4' : '#E7CDD6'}
              stroke="#8FA58B"
              strokeWidth={1}
            />
          ))}
          <g data-stamen>
            {STAMENS.map((stamen) => (
              <line
                key={`${stamen.x2}-${stamen.y2}`}
                x1={BLOOM_X}
                y1={BLOOM_Y}
                x2={stamen.x2}
                y2={stamen.y2}
                stroke="#F8F5EF"
                strokeWidth={1.3}
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </section>
  )
}
