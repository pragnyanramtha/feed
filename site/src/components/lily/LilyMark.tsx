import { motion } from 'motion/react'
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

type LilyMarkProps = {
  className?: string
  variant?: 'bloom' | 'line' | 'silhouette'
  title?: string
}

const petalAngles = [0, 60, 120, 180, 240, 300]

export function LilyMark({ className, variant = 'bloom', title }: LilyMarkProps) {
  const labelProps = title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const }

  if (variant === 'line') {
    return (
      <svg viewBox={LILY_VIEWBOX} className={className} fill="none" {...labelProps}>
        <path d={STEM_D} className="draw-path" stroke="#8FA58B" strokeWidth={1.6} pathLength={1} />
        <path d={LEAF_LEFT_D} className="draw-path" stroke="#8FA58B" strokeWidth={1.4} pathLength={1} />
        <path d={LEAF_RIGHT_D} className="draw-path" stroke="#8FA58B" strokeWidth={1.4} pathLength={1} />
        {petalAngles.map((angle, index) => (
          <path
            key={angle}
            d={PETAL_D}
            className="draw-path"
            transform={`rotate(${angle} ${BLOOM_X} ${BLOOM_Y})`}
            stroke="#8FA58B"
            strokeWidth={1.3}
            pathLength={1}
            style={{ animationDelay: `${0.15 + index * 0.08}s` }}
          />
        ))}
      </svg>
    )
  }

  if (variant === 'silhouette') {
    return (
      <svg viewBox={LILY_VIEWBOX} className={className} {...labelProps}>
        <path d={STEM_D} fill="none" stroke="currentColor" strokeWidth={2} />
        <path d={LEAF_LEFT_D} fill="currentColor" opacity={0.7} />
        <path d={LEAF_RIGHT_D} fill="currentColor" opacity={0.55} />
        {petalAngles.map((angle) => (
          <path
            key={angle}
            d={PETAL_D}
            transform={`rotate(${angle} ${BLOOM_X} ${BLOOM_Y})`}
            fill="currentColor"
          />
        ))}
      </svg>
    )
  }

  return (
    <svg viewBox={LILY_VIEWBOX} className={className} {...labelProps}>
      <motion.path
        d={STEM_D}
        fill="none"
        stroke="#8FA58B"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={LEAF_LEFT_D}
        fill="#8FA58B"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.35, duration: 0.8 }}
      />
      <motion.path
        d={LEAF_RIGHT_D}
        fill="#8FA58B"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      {petalAngles.map((angle, index) => (
        <motion.path
          key={angle}
          d={PETAL_D}
          transform={`rotate(${angle} ${BLOOM_X} ${BLOOM_Y})`}
          fill={index % 2 === 0 ? '#D8B7C4' : '#E4C9D2'}
          stroke="#8FA58B"
          strokeWidth={1.15}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            delay: 0.45 + index * 0.08,
            duration: 1.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
      {STAMENS.map((stamen) => (
        <motion.line
          key={`${stamen.x2}-${stamen.y2}`}
          x1={BLOOM_X}
          y1={BLOOM_Y}
          x2={stamen.x2}
          y2={stamen.y2}
          stroke="#F8F5EF"
          strokeWidth={1.2}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        />
      ))}
    </svg>
  )
}
