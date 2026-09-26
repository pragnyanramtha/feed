export function FilmGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.14] mix-blend-multiply motion-reduce:opacity-[0.08]"
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>
    </div>
  )
}
