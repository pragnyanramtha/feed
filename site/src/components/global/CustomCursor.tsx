import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return

    const glow = glowRef.current
    if (!glow) return

    document.documentElement.classList.add('custom-cursor')

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const current = { x: pointer.x, y: pointer.y }
    let scale = 1
    let targetScale = 1
    let magnetic: Element | null = null
    let frame = 0
    let visible = false

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      if (!visible) {
        visible = true
        glow.style.opacity = '1'
      }
    }

    const onOver = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      magnetic = target.closest('[data-magnetic]')
    }

    const onOut = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const next = target.closest('[data-magnetic]')
      if (next && next === magnetic) magnetic = null
    }

    const loop = () => {
      let destX = pointer.x
      let destY = pointer.y
      targetScale = 1

      if (magnetic instanceof HTMLElement) {
        const rect = magnetic.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        destX = pointer.x + (cx - pointer.x) * 0.28
        destY = pointer.y + (cy - pointer.y) * 0.28
        targetScale = 1.85
      }

      current.x += (destX - current.x) * 0.18
      current.y += (destY - current.y) * 0.18
      scale += (targetScale - scale) * 0.14
      glow.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${scale})`
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    frame = requestAnimationFrame(loop)

    return () => {
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="cursor-glow pointer-events-none fixed left-0 top-0 z-50 h-9 w-9 rounded-full bg-dusty-pink/50 opacity-0 blur-md mix-blend-multiply"
      aria-hidden="true"
    />
  )
}
