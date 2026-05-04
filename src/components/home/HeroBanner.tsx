import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../config'
import type { HeroBannerSettings, HeroSlide } from '../../types'

const SLIDE_INTERVAL_MS = 5000

function HeroCta({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  const t = href.trim()
  if (!t || !children) return null
  if (/^https?:\/\//i.test(t)) {
    return (
      <a href={t} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  if (t.startsWith('#')) {
    const hash = t.replace(/^#+/, '')
    return (
      <Link to={{ pathname: '/', hash }} className={className}>
        {children}
      </Link>
    )
  }
  const path = t.startsWith('/') ? t : `/${t}`
  return (
    <Link to={path} className={className}>
      {children}
    </Link>
  )
}

function HeroSlidePane({ slide }: { slide: HeroSlide }) {
  const img = resolveMediaUrl(slide.imageUrl)
  const bg = slide.fallbackBg || '#1a1816'
  return (
    <div
      className="hero-banner-slide"
      style={{
        backgroundColor: bg,
        backgroundImage: img ? `url(${img})` : undefined,
      }}
    >
      <div className="hero-banner-slide-overlay" aria-hidden />
      <div className="hero-banner-slide-inner">
        {slide.title ? <h2 className="hero-banner-title">{slide.title}</h2> : null}
        {slide.subtitle ? <p className="hero-banner-subtitle">{slide.subtitle}</p> : null}
        {slide.ctaLabel.trim() ? (
          <HeroCta href={slide.ctaTo} className="btn btn-primary hero-banner-cta">
            {slide.ctaLabel}
          </HeroCta>
        ) : null}
      </div>
    </div>
  )
}

type Props = {
  heroBanner: HeroBannerSettings
}

export function HeroBanner({ heroBanner }: Props) {
  const slides = useMemo(
    () =>
      heroBanner.enabled
        ? heroBanner.slides.filter((s) => s && (s.title.trim() || s.subtitle.trim() || s.imageUrl.trim()))
        : [],
    [heroBanner.enabled, heroBanner.slides],
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  const multi = slides.length > 1
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!multi || reduceMotion || slides.length === 0) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, SLIDE_INTERVAL_MS)
    return () => window.clearInterval(t)
  }, [multi, reduceMotion, slides.length])

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= slides.length) return
      setIndex(i)
    },
    [slides.length],
  )

  if (!heroBanner.enabled || slides.length === 0) return null

  const active = slides[index]!

  return (
    <section className="hero-banner layout-full-bleed" aria-label="بانر الرئيسية">
      <div className="hero-banner-viewport">
        <HeroSlidePane key={active.id} slide={active} />
      </div>
      {multi ? (
        <div className="hero-banner-dots" role="tablist" aria-label="تنقل الشرائح">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`hero-banner-dot${i === index ? ' is-active' : ''}`}
              onClick={() => go(i)}
              aria-label={`شريحة ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
