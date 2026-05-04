import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../config'
import type { PublicSiteSettings } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  siteSettings: PublicSiteSettings
  onOpenCart: () => void
}

function socialHref(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function DrawerRowLink({
  to,
  hash,
  icon,
  label,
  onNavigate,
}: {
  to: string
  hash?: string
  icon: string
  label: string
  onNavigate: () => void
}) {
  return (
    <Link
      to={hash !== undefined ? { pathname: to, hash } : to}
      className="nav-drawer-lux-link"
      onClick={onNavigate}
    >
      <span className="nav-drawer-lux-emoji" aria-hidden>
        {icon}
      </span>
      <span className="nav-drawer-lux-label">{label}</span>
    </Link>
  )
}

export function NavDrawer({ open, onClose, siteSettings, onOpenCart }: Props) {
  const logoSrc = resolveMediaUrl(siteSettings.headerLogoUrl)
  const storeLabel = siteSettings.storeName.trim() || 'HORUS parfum'

  const socials = useMemo(() => {
    const rows = [
      { key: 'ig', label: 'إنستقرام', href: socialHref(siteSettings.socialInstagram) },
      { key: 'tt', label: 'تيك توك', href: socialHref(siteSettings.socialTiktok) },
      { key: 'sc', label: 'سناب شات', href: socialHref(siteSettings.socialSnapchat) },
      { key: 'tw', label: 'X', href: socialHref(siteSettings.socialTwitter) },
    ].filter((s): s is { key: string; label: string; href: string } => Boolean(s.href))
    return rows
  }, [siteSettings])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="search-drawer-backdrop"
        aria-label="إغلاق القائمة"
        onClick={onClose}
      />
      <div
        id="nav-drawer"
        className="search-drawer nav-drawer-lux is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-drawer-brand-label"
      >
        <header className="nav-drawer-lux-head">
          <div className="nav-drawer-lux-brand" id="nav-drawer-brand-label">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={(siteSettings.headerLogoAlt || storeLabel).trim()}
                className="nav-drawer-lux-logo"
              />
            ) : (
              <>
                <div className="nav-drawer-lux-wordmark" dir="ltr">
                  <span className="nav-drawer-lux-wordmark-horus">HORUS</span>
                  <span className="nav-drawer-lux-wordmark-parfum">parfum</span>
                </div>
                {storeLabel.toLowerCase() !== 'horus parfum' ? (
                  <p className="nav-drawer-lux-tagline" dir="auto">
                    {storeLabel}
                  </p>
                ) : null}
              </>
            )}
          </div>
          <button
            type="button"
            className="icon-btn nav-drawer-lux-close"
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            ×
          </button>
        </header>

        <div className="search-drawer-body nav-drawer-lux-body">
          <nav className="nav-drawer-lux-nav" aria-label="تصفح المتجر">
            <p className="nav-drawer-lux-section-title">تصفح</p>
            <ul className="nav-drawer-lux-list">
              <li>
                <DrawerRowLink to="/" icon="🏠" label="الرئيسية" onNavigate={onClose} />
              </li>
              <li>
                <DrawerRowLink
                  to="/"
                  hash="catalog"
                  icon="🛍️"
                  label="جميع العطور"
                  onNavigate={onClose}
                />
              </li>
              <li>
                <DrawerRowLink
                  to="/"
                  hash="catalog-womens"
                  icon="👩"
                  label="عطور نسائية"
                  onNavigate={onClose}
                />
              </li>
              <li>
                <DrawerRowLink
                  to="/"
                  hash="catalog-mens"
                  icon="👨"
                  label="عطور رجالية"
                  onNavigate={onClose}
                />
              </li>
              <li>
                <DrawerRowLink
                  to="/"
                  hash="catalog-gifts"
                  icon="🎁"
                  label="هدايا وعروض"
                  onNavigate={onClose}
                />
              </li>
              <li>
                <DrawerRowLink to="/news" icon="📰" label="الأخبار" onNavigate={onClose} />
              </li>
              {siteSettings.aboutPage.enabled ? (
                <li>
                  <DrawerRowLink to="/about" icon="ℹ️" label="عن المتجر" onNavigate={onClose} />
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="nav-drawer-lux-rule" aria-hidden />

          <nav className="nav-drawer-lux-nav" aria-label="طلباتي">
            <p className="nav-drawer-lux-section-title">طلباتي</p>
            <ul className="nav-drawer-lux-list">
              <li>
                <button type="button" className="nav-drawer-lux-link" onClick={() => onOpenCart()}>
                  <span className="nav-drawer-lux-emoji" aria-hidden>
                    🛒
                  </span>
                  <span className="nav-drawer-lux-label">سلتي</span>
                </button>
              </li>
              <li>
                <DrawerRowLink to="/track" icon="📦" label="تتبع طلبي" onNavigate={onClose} />
              </li>
            </ul>
          </nav>

          <div className="nav-drawer-lux-foot">
            {socials.length > 0 ? (
              <div className="nav-drawer-lux-social">
                <p className="nav-drawer-lux-section-title nav-drawer-lux-section-title--foot">
                  تابعنا
                </p>
                <ul className="nav-drawer-lux-social-list">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        className="nav-drawer-lux-social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {siteSettings.footerCopyright.trim() ? (
              <p className="nav-drawer-lux-copy">{siteSettings.footerCopyright}</p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
