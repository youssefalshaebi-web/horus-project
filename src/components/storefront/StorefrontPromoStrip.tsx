import type { StorefrontPromoPlacement, StorefrontPromoSlot } from '../../types'

function PromoSlotItem({ slot }: { slot: StorefrontPromoSlot }) {
  if (slot.kind === 'marquee') {
    const text = slot.title.trim() || slot.body.trim()
    if (!text) return null
    return (
      <div className="promo-marquee" role="region" aria-label={slot.title || 'إعلان'}>
        <div className="promo-marquee-track">
          <span>{text}</span>
          <span aria-hidden>{text}</span>
        </div>
      </div>
    )
  }

  if (slot.kind === 'banner') {
    const inner = (
      <>
        {slot.title.trim() ? (
          <strong className="promo-banner-title">{slot.title.trim()}</strong>
        ) : null}
        {slot.body.trim() ? <p className="promo-banner-body">{slot.body.trim()}</p> : null}
      </>
    )
    if (slot.linkUrl.trim()) {
      return (
        <a
          href={slot.linkUrl.trim()}
          className="promo-banner"
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      )
    }
    return <div className="promo-banner">{inner}</div>
  }

  return (
    <div className="promo-card">
      {slot.imageUrl.trim() ? (
        <img src={slot.imageUrl.trim()} alt="" className="promo-card-img" />
      ) : null}
      <div className="promo-card-body">
        {slot.title.trim() ? <h3 className="promo-card-title">{slot.title.trim()}</h3> : null}
        {slot.body.trim() ? <p className="promo-card-text">{slot.body.trim()}</p> : null}
        {slot.linkUrl.trim() ? (
          <a href={slot.linkUrl.trim()} className="inline-link" target="_blank" rel="noreferrer">
            رابط
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function StorefrontPromoStrip({
  slots,
  placement,
}: {
  slots: StorefrontPromoSlot[]
  placement: StorefrontPromoPlacement
}) {
  const list = [...slots]
    .filter((s) => s.enabled && s.placement === placement)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  if (!list.length) return null
  return (
    <div className="promo-strip" data-placement={placement}>
      {list.map((slot) => (
        <PromoSlotItem key={slot.id} slot={slot} />
      ))}
    </div>
  )
}
