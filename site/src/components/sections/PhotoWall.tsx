import { motion } from 'motion/react'
import { wallHeading, wallLede, wallNotes, wallPhotos } from '@/data/memories'

export function PhotoWall() {
  return (
    <section id="wall" className="relative overflow-hidden bg-sage px-5 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl font-display text-section text-deep-brown">{wallHeading}</h2>
        <p className="mt-4 font-accent text-3xl text-deep-brown">{wallLede}</p>

        <div className="relative mt-16">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
            {wallPhotos.map((photo, index) => (
              <motion.figure
                key={photo.src}
                data-magnetic
                tabIndex={0}
                className="relative cursor-pointer outline-none"
                initial={false}
                animate={{ rotate: photo.rotate ?? 0 }}
                whileHover={{ rotate: 0, scale: 1.05, zIndex: 20 }}
                whileFocus={{ rotate: 0, scale: 1.05, zIndex: 20 }}
                transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-2 left-5 z-10 h-4 w-12 rotate-[-12deg] bg-cream/80 shadow-soft"
                />
                {index % 2 === 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 right-4 z-10 h-4 w-10 rotate-[16deg] bg-cream/70 shadow-soft"
                  />
                ) : null}
                <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-soft">
                  <img
                    src={photo.src}
                    alt={photo.caption ?? 'A photograph on the wall'}
                    className="aspect-[4/5] w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-2 text-center font-accent text-xl text-deep-brown">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </motion.figure>
            ))}
          </div>

          {wallNotes.map((note) => (
            <p
              key={note.text}
              className="pointer-events-none absolute hidden font-accent text-3xl text-deep-brown md:block"
              style={{ top: note.top, left: note.left, rotate: `${note.rotate}deg` }}
            >
              {note.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
