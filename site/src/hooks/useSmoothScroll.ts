import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

let lenisInstance: Lenis | null = null

/**
 * Must run before React mounts section ScrollTriggers.
 * GSAP's ticker is the only rAF loop: it drives lenis.raf, and scrollerProxy
 * reports Lenis' virtual scroll position back to ScrollTrigger.
 */
export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scroller = document.documentElement

  const lenis = new Lenis({
    lerp: reduce ? 1 : 0.085,
    smoothWheel: !reduce,
    syncTouch: false,
    autoRaf: false,
    respectReducedMotion: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const onTick = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  ScrollTrigger.scrollerProxy(scroller, {
    scrollTop(value) {
      if (arguments.length && typeof value === 'number') {
        lenis.scrollTo(value, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    pinType: scroller.style.transform ? 'transform' : 'fixed',
  })

  ScrollTrigger.defaults({ scroller })

  const onRefresh = () => {
    lenis.resize()
  }
  ScrollTrigger.addEventListener('refresh', onRefresh)

  const refresh = () => {
    ScrollTrigger.refresh()
  }
  const onAssetLoad = (event: Event) => {
    if (event.target instanceof HTMLImageElement) refresh()
  }

  window.addEventListener('resize', refresh)
  window.addEventListener('load', refresh)
  document.addEventListener('load', onAssetLoad, true)

  lenisInstance = lenis
  return lenis
}

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    initSmoothScroll()
    const refresh = () => ScrollTrigger.refresh()
    const frame = requestAnimationFrame(refresh)
    const later = window.setTimeout(refresh, 400)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(later)
    }
  }, [enabled])
}
