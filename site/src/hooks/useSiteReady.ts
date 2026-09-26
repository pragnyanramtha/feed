import { useEffect, useState } from 'react'
import { allImageSrcs } from '@/data/memories'

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = src
  })
}

export function useSiteReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const images = Promise.all(allImageSrcs().map(preload))
    const minimum = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900)
    })
    const timeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 5200)
    })

    Promise.race([Promise.all([fonts, images, minimum]), timeout]).then(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
