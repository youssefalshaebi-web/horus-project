import { whatsappChatUrl } from '../utils/whatsappLink'

type Props = {
  phoneE164: string
  secondaryPhoneE164?: string
  welcomeMessage?: string
}

export function WhatsAppFab({ phoneE164, secondaryPhoneE164, welcomeMessage }: Props) {
  const digits = phoneE164.replace(/\D/g, '')
  const secDigits = (secondaryPhoneE164 ?? '').replace(/\D/g, '')
  const msg = welcomeMessage?.trim()
  if (digits.length < 8 && secDigits.length < 8) return null

  const primaryHref = digits.length >= 8 ? whatsappChatUrl(phoneE164, msg) : null
  const secondaryHref =
    secDigits.length >= 8 && secondaryPhoneE164
      ? whatsappChatUrl(secondaryPhoneE164, msg)
      : null

  if (primaryHref && !secondaryHref) {
    return (
      <a
        href={primaryHref}
        className="whatsapp-fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
      >
        <WhatsAppIcon />
      </a>
    )
  }

  if (!primaryHref && secondaryHref) {
    return (
      <a
        href={secondaryHref}
        className="whatsapp-fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
      >
        <WhatsAppIcon />
      </a>
    )
  }

  return (
    <div className="whatsapp-fab-stack" aria-label="اختصارات واتساب">
      {secondaryHref ? (
        <a
          href={secondaryHref}
          className="whatsapp-fab whatsapp-fab--secondary"
          target="_blank"
          rel="noopener noreferrer"
          title="واتساب احتياطي"
          aria-label="تواصل عبر واتساب — الرقم الاحتياطي"
        >
          <WhatsAppIcon />
        </a>
      ) : null}
      {primaryHref ? (
        <a
          href={primaryHref}
          className="whatsapp-fab"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل عبر واتساب"
        >
          <WhatsAppIcon />
        </a>
      ) : null}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.59 1.37 5.09L2.05 22l4.99-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.36 14.28c-.24.67-1.18 1.23-1.93 1.4-.49.11-1.13.2-3.28-.7-2.75-1.2-4.52-4.13-4.66-4.32-.14-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 1-2.27.24-.24.53-.3.71-.3.18 0 .36 0 .52.01.17.01.39-.06.61.47.24.55.81 1.9.88 2.04.09.14.15.31.03.5-.12.19-.18.31-.36.48-.18.17-.38.38-.54.51-.18.15-.37.32-.16.63.21.31.93 1.53 2 2.48 1.38 1.23 2.54 1.61 2.9 1.79.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.09.99 2.45 1.17.36.18.6.27.69.42.09.15.09.88-.15 1.55z" />
    </svg>
  )
}
