import { useEffect, useRef } from 'react'
import { resolveMediaUrl } from '../../config'
import type { HomeVideoSettings } from '../../types'

/**
 * فيديو صامت يعاد تلقائياً — داخل تدفق الصفحة (ليست عائمة): يختفي عند التمرير لأعلى/أسفل.
 * يُعرض في الشاشة الرئيسية فقط (لا وضع الكتالوج الكامل).
 */
export function HomeBottomVideoSection({ homeVideo }: { homeVideo: HomeVideoSettings }) {
  const ref = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const active = homeVideo.enabled
  const src = active ? resolveMediaUrl(homeVideo.url?.trim() || '') : ''
  const posterRaw = homeVideo.posterUrl?.trim()
  const poster = posterRaw ? resolveMediaUrl(posterRaw) : undefined

  useEffect(() => {
    if (!active || !src) return
    const v = ref.current
    if (!v) return
    v.defaultMuted = true
    v.muted = true
    const p = v.play()
    if (p) {
      void p.catch(() => {
        const once = () => {
          void v.play().catch(() => {})
          window.removeEventListener('pointerdown', once, true)
        }
        window.addEventListener('pointerdown', once, true)
      })
    }

    function onVis() {
      if (document.visibilityState !== 'visible') return
      const el = ref.current
      if (!el) return
      const wrap = wrapRef.current
      if (wrap) {
        const r = wrap.getBoundingClientRect()
        const inView = r.bottom > 0 && r.top < window.innerHeight
        if (inView) void el.play().catch(() => {})
        else el.pause()
      } else {
        void el.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [active, src])

  useEffect(() => {
    if (!active || !src) return
    const v = ref.current
    const wrap = wrapRef.current
    if (!v || !wrap) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void v.play().catch(() => {})
          else v.pause()
        }
      },
      { root: null, threshold: 0.12 },
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [active, src])

  if (!active || !src) return null

  return (
    <div ref={wrapRef} className="home-bottom-video-section" aria-hidden="true">
      <div className="home-bottom-video-inner">
        <video
          key={src}
          ref={ref}
          className="home-bottom-video-el"
          src={src}
          poster={poster || undefined}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
        />
      </div>
    </div>
  )
}
