import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Coffee,
  Film,
  Flower2,
  Music,
  Palette,
  Rabbit,
  Smile,
  Soup,
  type LucideIcon,
} from 'lucide-react'
import { favoriteThings, favoritesHeading, favoritesLede } from '@/data/memories'
import { cn } from '@/lib/utils'

const icons: Record<string, LucideIcon> = {
  lily: Flower2,
  music: Music,
  bowl: Soup,
  palette: Palette,
  film: Film,
  cup: Coffee,
  plush: Rabbit,
  laugh: Smile,
}

export function Favorites() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="favorites" className="bg-white px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl font-display text-section text-deep-brown">{favoritesHeading}</h2>
        <p className="mt-5 max-w-lg font-body text-base text-deep-brown">{favoritesLede}</p>

        <ul className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {favoriteThings.map((thing, index) => {
            const Icon = icons[thing.icon] ?? Flower2
            const open = active === index
            return (
              <li key={thing.label}>
                <button
                  type="button"
                  data-magnetic
                  aria-expanded={open}
                  className={cn(
                    'flex h-full min-h-40 w-full flex-col items-start rounded-3xl bg-cream p-5 text-left shadow-soft transition-opacity duration-300',
                    active !== null && !open && 'opacity-40',
                  )}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setActive(index)
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === 'mouse') {
                      setActive((current) => (current === index ? null : current))
                    }
                  }}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive((current) => (current === index ? null : current))}
                  onClick={() => setActive((current) => (current === index ? null : index))}
                >
                  <motion.span
                    className="text-deep-brown"
                    animate={open ? { y: 0 } : { y: [0, -8, 0] }}
                    transition={
                      open
                        ? { duration: 0.3 }
                        : { duration: 4.6 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }
                    }
                  >
                    <Icon size={28} strokeWidth={1.4} aria-hidden="true" />
                  </motion.span>
                  <span className="mt-6 font-display text-3xl text-deep-brown">{thing.label}</span>
                  {open ? (
                    <span className="mt-3 font-body text-sm leading-relaxed text-deep-brown">
                      {thing.detail}
                    </span>
                  ) : (
                    <span className="sr-only">{thing.detail}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
