const petals = [
  { left: '8%', top: '18%', size: 18, spin: -12, dur: '13s', delay: '0s' },
  { left: '18%', top: '62%', size: 14, spin: 8, dur: '11s', delay: '-2s' },
  { left: '72%', top: '16%', size: 16, spin: -6, dur: '15s', delay: '-4s' },
  { left: '84%', top: '48%', size: 12, spin: 14, dur: '12s', delay: '-1s' },
  { left: '46%', top: '8%', size: 11, spin: -18, dur: '16s', delay: '-3s' },
  { left: '60%', top: '74%', size: 15, spin: 4, dur: '14s', delay: '-6s' },
  { left: '30%', top: '30%', size: 10, spin: 10, dur: '17s', delay: '-5s' },
  { left: '90%', top: '78%', size: 13, spin: -8, dur: '12.5s', delay: '-2.5s' },
]

export function PetalField() {
  return (
    <div className="petal-field pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((petal) => (
        <svg
          key={`${petal.left}-${petal.top}`}
          viewBox="0 0 40 70"
          className="petal absolute text-dusty-pink/50"
          style={{
            left: petal.left,
            top: petal.top,
            width: petal.size,
            height: petal.size * 1.7,
            ['--spin' as string]: `${petal.spin}deg`,
            ['--dur' as string]: petal.dur,
            animationDelay: petal.delay,
          }}
        >
          <path d="M20 68 C 33 50 34 22 20 2 C 6 22 7 50 20 68 Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  )
}
