import { useState } from 'react'
import { motion } from 'motion/react'
import { galleryHeading, galleryLede, galleryPhotos, type Photo } from '@/data/memories'
import { cn } from '@/lib/utils'

function spanStyle(photo: Photo) {
  return {
    ['--col' as string]: String(photo.col ?? 1),
    ['--span' as string]: String(photo.colSpan ?? 4),
    ['--row' as string]: String(photo.row ?? 1),
    ['--rows' as string]: String(photo.rowSpan ?? 2),
  }
}

export function MemoryGallery() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="gallery" className="bg-sage px-5 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl font-display text-section text-deep-brown">{galleryHeading}</h2>
        <p className="mt-5 max-w-md font-body text-base text-deep-brown">{galleryLede}</p>

        <div className="memory-grid mt-16">
          {galleryPhotos.map((photo, index) => {
            const isActive = active === index
            const shift =
              active === null || isActive ? 0 : index < active ? -12 : 12

            return (
              <motion.figure
                key={photo.src}
                data-magnetic
                tabIndex={0}
                layout
                className={cn(
                  'memory-item relative outline-none',
                  photo.orientation === 'landscape' && 'memory-item--landscape',
                  photo.polaroid
                    ? 'rounded-md bg-white p-3 pb-12 shadow-soft'
                    : 'overflow-hidden rounded-3xl shadow-soft',
                )}
                style={spanStyle(photo)}
                animate={{
                  x: shift,
                  rotate: isActive ? 0 : (photo.rotate ?? 0),
                  scale: isActive ? 1.045 : 1,
                }}
                whileHover={{ scale: 1.06, zIndex: 5 }}
                transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive((current) => (current === index ? null : current))}
                onFocus={() => setActive(index)}
                onBlur={() => setActive((current) => (current === index ? null : current))}
              >
                <div
                  className={cn(
                    'relative h-full',
                    photo.polaroid ? 'overflow-hidden rounded-sm' : 'h-full',
                  )}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption ?? 'A kept photograph'}
                    className="h-full w-full object-cover max-md:aspect-[3/4] max-md:h-auto"
                    loading="lazy"
                  />
                  <motion.figcaption
                    className={cn(
                      'pointer-events-none absolute inset-x-0 bottom-0 px-4 py-4',
                      photo.polaroid
                        ? 'text-deep-brown'
                        : 'bg-gradient-to-t from-night/75 to-transparent text-cream',
                    )}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="font-body text-sm leading-snug">{photo.caption}</span>
                  </motion.figcaption>
                </div>
              </motion.figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
