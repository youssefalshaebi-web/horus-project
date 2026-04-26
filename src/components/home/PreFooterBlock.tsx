import { useState, type FormEvent } from 'react'
import type { PublicSiteSettings } from '../../types'

type Props = {
  settings: PublicSiteSettings
}

export function PreFooterBlock({ settings }: Props) {
  const [email, setEmail] = useState('')

  if (!settings.preFooterEnabled) return null

  function onNewsletter(e: FormEvent) {
    e.preventDefault()
    const to = settings.footerEmail.trim()
    if (!to) {
      window.alert('أضف البريد في «الإعدادات → الفوتر» ليتم فتح رسالة اشتراك موجّهة لك.')
      return
    }
    const subj = encodeURIComponent('اشتراك في النشرة — HORUS')
    const body = encodeURIComponent(`طلب اشتراك من العنوان: ${email}`)
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`
  }

  return (
    <section className="pre-footer" aria-labelledby="pre-footer-title">
      <div className="pre-footer-inner">
        {settings.preFooterTitle.trim() ? (
          <h2 id="pre-footer-title" className="pre-footer-title">
            {settings.preFooterTitle}
          </h2>
        ) : null}
        {settings.preFooterText.trim() ? (
          <p className="pre-footer-text">{settings.preFooterText}</p>
        ) : null}
        {settings.preFooterNewsletterEnabled ? (
          <form className="pre-footer-form" onSubmit={onNewsletter}>
            <input
              type="email"
              required
              name="newsletter-email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={settings.preFooterNewsletterPlaceholder}
              className="pre-footer-input"
            />
            <button type="submit" className="btn pre-footer-btn">
              {settings.preFooterNewsletterButtonLabel || 'اشتراك'}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  )
}
