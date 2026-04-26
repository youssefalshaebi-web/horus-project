import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import type { OrderStatus, PublicOrder, ShopOutletContext } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { apiJson } from '../api/client'

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case 'pending':
      return 'قيد المراجعة'
    case 'confirmed':
      return 'تم التأكيد'
    case 'shipped':
      return 'تم الشحن'
    case 'cancelled':
      return 'ملغى'
    default:
      return s
  }
}

type OrderRes = { order: PublicOrder }
type WaRes = { whatsappUrl: string }

export function OrderSuccessPage() {
  const { code } = useParams<{ code: string }>()
  const { siteSettings } = useOutletContext<ShopOutletContext>()
  const uo = siteSettings.uiOrderSuccess
  const location = useLocation()
  const initialWa =
    (location.state as { whatsappUrl?: string } | null)?.whatsappUrl ?? null

  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(initialWa)

  const loadOrder = useCallback(async () => {
    if (!code) return
    try {
      const data = await apiJson<OrderRes>(`/api/orders/public/${encodeURIComponent(code)}`)
      setOrder(data.order)
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'تعذر تحميل الطلب')
    }
  }, [code])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- جلب الطلب من API عند التحميل
    void loadOrder()
  }, [loadOrder])

  useEffect(() => {
    if (!code) return
    const t = window.setInterval(() => void loadOrder(), 20_000)
    return () => window.clearInterval(t)
  }, [code, loadOrder])

  useEffect(() => {
    if (whatsappUrl || !code) return
    ;(async () => {
      try {
        const data = await apiJson<WaRes>(
          `/api/orders/public/${encodeURIComponent(code)}/whatsapp`,
        )
        setWhatsappUrl(data.whatsappUrl)
      } catch {
        /* يكفي زر غير متوفر */
      }
    })()
  }, [code, whatsappUrl])

  if (!code) {
    return (
      <main className="checkout">
        <p>رقم الطلب غير صالح.</p>
        <Link to="/">العودة للمتجر</Link>
      </main>
    )
  }

  if (loadError || !order) {
    return (
      <main className="checkout order-success">
        <p className="form-error">{loadError || 'جاري التحميل…'}</p>
        <Link to="/" className="link-btn">
          العودة للمتجر
        </Link>
      </main>
    )
  }

  return (
    <main className="checkout order-success">
      <p className="hero-eyebrow">{uo.eyebrow}</p>
      <h1 className="checkout-title">{uo.title}</h1>
      <div className="order-summary-card">
        <div className="order-code-row">
          <span>{uo.orderCodeLabel}</span>
          <strong className="order-code">{order.publicCode}</strong>
        </div>
        <div className="order-code-row">
          <span>{uo.statusLabel}</span>
          <strong>{statusLabel(order.status)}</strong>
        </div>
        <div className="order-code-row">
          <span>{uo.trackingLabel}</span>
          <strong>{order.trackingNumber || uo.trackingPlaceholder}</strong>
        </div>
        <div className="order-code-row">
          <span>{uo.totalLabel}</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </div>

      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="order_success_after_summary" />

      {uo.showLinesDetail ? (
        <section className="order-lines-block" aria-label={uo.linesTitle}>
          <h2 className="order-lines-title">{uo.linesTitle}</h2>
          <ul className="order-lines-list">
            {order.lines.map((l) => (
              <li key={`${l.productId}-${l.quantity}`} className="order-line-item">
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span>{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="checkout-lead">
        {uo.footerLead}{' '}
        <Link to="/track" className="inline-link">
          {uo.trackLinkLabel}
        </Link>
        .
      </p>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-block wa-notify"
        >
          {uo.whatsappLabel}
        </a>
      ) : null}

      <Link to="/" className="link-btn back-link">
        {uo.continueLabel}
      </Link>
    </main>
  )
}
