import { useRef } from 'react'
import { useInView } from 'motion/react'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { LilyMark } from '@/components/lily/LilyMark'
import { letterText } from '@/data/memories'
import { cn } from '@/lib/utils'

function LetterLine({ text, display = false }: { text: string; display?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px -8% 0px' })
  const className = display
    ? 'font-display text-section text-deep-brown'
    : 'font-body text-base leading-relaxed text-deep-brown md:text-lg'

  return (
    <div ref={ref} className="relative">
      <p className={cn(className, 'opacity-0')} aria-hidden="true">
        {text}
      </p>
      <div className="absolute inset-0">
        <TextEffect
          as="p"
          per="word"
          preset="slide"
          trigger={inView}
          speedReveal={0.32}
          speedSegment={0.55}
          className={className}
        >
          {text}
        </TextEffect>
      </div>
    </div>
  )
}

export function Letter() {
  const lines = letterText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return (
    <section id="letter" className="bg-white px-6 py-28 md:px-8 md:py-40">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <LilyMark className="h-28 w-16" title="A small lily" />
        {lines.map((line, index) => (
          <LetterLine key={line} text={line} display={index === 0} />
        ))}
      </div>
    </section>
  )
}
