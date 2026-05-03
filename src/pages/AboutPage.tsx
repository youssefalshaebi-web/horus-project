import { Link, Navigate, useOutletContext } from 'react-router-dom'
import { SiteFooter } from '../components/home/SiteFooter'
import { useSEO } from '../hooks/useSEO'
import type { ShopOutletContext } from '../types'
import { resolveMediaUrl } from '../config'

export function AboutPage() {
  const { siteSettings } = useOutletContext<ShopOutletContext>()
  const uh = siteSettings.uiHome
  const about = siteSettings.aboutPage

  useSEO({
    siteSettings,
    title: `${about.pageTitle} | ${siteSettings.storeName}`.trim(),
    description: about.body.trim().slice(0, 320) || undefined,
  })

  if (!about.enabled) {
    return <Navigate to="/" replace />
  }

  const heroImg = resolveMediaUrl(about.heroImageUrl)
  const s2Img = resolveMediaUrl(about.section2ImageUrl)

  return (
    <main className="home-main about-page">
      <div className="catalog-view-head about-page-head">
        <Link to="/" className="btn btn-ghost catalog-back-btn">
          ← العودة للرئيسية
        </Link>
        <h1 className="catalog-view-title">{about.pageTitle}</h1>
      </div>

      {heroImg ? (
        <div className="about-hero-img-wrap">
          <img src={heroImg} alt="" className="about-hero-img" />
        </div>
      ) : null}

      {about.body.trim() ? (
        <div className="about-body about-prose">{about.body}</div>
      ) : (
        <p className="checkout-lead about-empty">المحتوى قيد الإعداد.</p>
      )}

      {about.section2Title.trim() || about.section2Body.trim() || s2Img ? (
        <section className="about-section2">
          {about.section2Title.trim() ? (
            <h2 className="about-section2-title">{about.section2Title}</h2>
          ) : null}
          {s2Img ? (
            <div className="about-section2-img-wrap">
              <img src={s2Img} alt="" className="about-section2-img" />
            </div>
          ) : null}
          {about.section2Body.trim() ? (
            <div className="about-body about-prose about-section2-body">{about.section2Body}</div>
          ) : null}
        </section>
      ) : null}

      {uh.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}
    </main>
  )
}
