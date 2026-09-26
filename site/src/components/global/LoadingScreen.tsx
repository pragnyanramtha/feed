import { AnimatePresence, motion } from 'motion/react'
import { LilyMark } from '@/components/lily/LilyMark'
import { loadingLabel } from '@/data/memories'

export function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-cream"
          role="status"
          aria-live="polite"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <LilyMark variant="line" className="h-64 w-36" title="A lily, opening" />
          <p className="mt-6 font-accent text-2xl text-deep-brown">{loadingLabel}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
