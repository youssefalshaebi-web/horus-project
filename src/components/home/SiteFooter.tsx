import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PublicSiteSettings } from '../../types'

type Props = {
  settings: PublicSiteSettings
}

function FooterHref({ href, children }: { href: string; children: ReactNode }) {
  const h = href.trim()
  if (h.startsWith('/') && !h.startsWith('//')) {
    return (
      <Link to={h} className="footer-link">
        {children}
      </Link>
    )
  }
  return (
    <a href={h || '#'} className="footer-link">
      {children}
    </a>
  )
}

function socialHref(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export function SiteFooter({ settings }: Props) {
  const groups = settings.footerNavGroups.filter((g) => g.title.trim() && g.links.length > 0)
  const noNav = groups.length === 0

  const social = [
    { key: 'ig', label: 'إنستقرام', href: socialHref(settings.socialInstagram) },
    { key: 'tt', label: 'تيك توك', href: socialHref(settings.socialTiktok) },
    { key: 'sc', label: 'سناب شات', href: socialHref(settings.socialSnapchat) },
    { key: 'tw', label: 'X / تويتر', href: socialHref(settings.socialTwitter) },
  ].filter((s): s is { key: string; label: string; href: string } => Boolean(s.href))

  return (
    <footer className="site-footer site-footer--dark">
      <div className="site-footer-shell">
        <div
          className={
            'footer-top-grid' + (noNav ? ' footer-top-grid--no-nav' : '')
          }
        >
          <div className="footer-brand-block">
            <p className="site-footer-brand" dir="auto">
              {settings.storeName.trim() || 'HORUS parfum'}
            </p>
            {settings.footerTagline ? (
              <p className="site-footer-tagline">{settings.footerTagline}</p>
            ) : null}
            {social.length > 0 ? (
              <ul className="footer-social-row">
                {social.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} className="footer-social-link" target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {groups.length > 0 ? (
            <>
              <div className="footer-nav-columns hidden-mobile-only">
                {groups.map((g) => (
                  <div key={g.title} className="footer-nav-block">
                    <h3 className="footer-heading">{g.title}</h3>
                    <ul className="footer-link-list">
                      {g.links.map((l) => (
                        <li key={`${g.title}-${l.label}-${l.href}`}>
                          <FooterHref href={l.href}>{l.label}</FooterHref>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="footer-accordions hidden-desktop-only">
                {groups.map((g) => (
                  <details key={g.title} className="footer-details">
                    <summary className="footer-details-summary">{g.title}</summary>
                    <ul className="footer-link-list footer-link-list--inset">
                      {g.links.map((l) => (
                        <li key={`${g.title}-m-${l.label}`}>
                          <FooterHref href={l.href}>{l.label}</FooterHref>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </>
          ) : null}

          <div className="footer-col footer-contact">
            <h3 className="footer-heading">اتصال</h3>
            {settings.footerEmail ? (
              <p className="footer-line">
                <span className="footer-label">البريد الإلكتروني:</span>{' '}
                <a className="footer-link" href={`mailto:${settings.footerEmail}`}>
                  {settings.footerEmail}
                </a>
              </p>
            ) : null}
            {settings.footerPhone ? (
              <p className="footer-line">
                <span className="footer-label">الهاتف:</span>{' '}
                <a className="footer-link" href={`tel:${settings.footerPhone.replace(/\s/g, '')}`}>
                  {settings.footerPhone}
                </a>
              </p>
            ) : null}
            {!settings.footerEmail && !settings.footerPhone ? (
              <p className="footer-muted">أضف البريد أو الهاتف من لوحة التحكم.</p>
            ) : null}
          </div>
        </div>

        <p className="footer-track">
          <Link to="/track" className="footer-link footer-track-link">
            تتبع طلبك
          </Link>
        </p>

        {settings.footerCopyright ? (
          <p className="site-footer-copy">{settings.footerCopyright}</p>
        ) : null}
      </div>
    </footer>
  )
}
