import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import { apiJson } from '../api/client'
import type { OrderStatus, PublicOrder, ShopOutletContext } from '../types'
import { formatPrice } from '../utils/formatPrice'

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

export function TrackOrderPage() {
  const { siteSettings } = useOutletContext<ShopOutletContext>()
  const ut = siteSettings.uiTrack
  const [code, setCode] = useState('')
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) {
      setError('أدخل رقم الطلب')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiJson<OrderRes>(
        `/api/orders/public/${encodeURIComponent(c)}`,
      )
      setOrder(data.order)
    } catch (err) {
      setOrder(null)
      setError(err instanceof Error ? err.message : 'لم يُعثر على الطلب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="checkout track-page">
      <Link to="/" className="link-btn back-link">
        {ut.backLabel}
      </Link>
      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="track_top" />
      <h1 className="checkout-title">{ut.pageTitle}</h1>
      <p className="checkout-lead">{ut.leadText}</p>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>{ut.codeFieldLabel}</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={ut.codePlaceholder}
            autoComplete="off"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? ut.searchingLabel : ut.submitLabel}
        </button>
      </form>

      {order ? (
        <div className="order-summary-card track-result">
          <div className="order-code-row">
            <span>{ut.orderCodeLabel}</span>
            <strong className="order-code">{order.publicCode}</strong>
          </div>
          <div className="order-code-row">
            <span>{ut.statusLabel}</span>
            <strong>{statusLabel(order.status)}</strong>
          </div>
          <div className="order-code-row">
            <span>{ut.trackingLabel}</span>
            <strong>{order.trackingNumber || '—'}</strong>
          </div>
          <div className="order-code-row">
            <span>{ut.totalLabel}</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
          <ul className="order-lines-list compact">
            {order.lines.map((l) => (
              <li key={`${l.productId}-${l.quantity}`} className="order-line-item">
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span>{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  )
}
