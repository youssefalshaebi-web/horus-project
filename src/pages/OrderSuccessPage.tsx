import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import type { OrderStatus, PublicOrder, ShopOutletContext } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { apiJson } from '../api/client'
import { whatsappChatUrl } from '../utils/whatsappLink'

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

/** نص رسالة واتساب للمالك — يُكمَل برقم المخزَّن في الإعدادات كـ whatsappPhoneE164 */
function buildCustomerWhatsAppOrderMessage(order: PublicOrder): string {
  const productsLines = order.lines.map((l) => `• ${l.name} × ${l.quantity}`).join('\n')
  const parts: string[] = [
    'مرحباً، أرسل طلبي التالي عبر الموقع:',
    '',
    `رقم الطلب: ${order.publicCode}`,
    `الاسم: ${order.customerName}`,
    '',
    'المنتجات:',
    productsLines,
    '',
    `المبلغ الإجمالي: ${formatPrice(order.total)}`,
    '',
    'عنوان التوصيل:',
    order.address,
  ]
  if (order.region?.trim()) {
    parts.push(`المنطقة/الحي: ${order.region.trim()}`)
  }
  parts.push(`المدينة: ${order.city}`, `الدولة: ${order.country}`)
  return parts.join('\n')
}

export function OrderSuccessPage() {
  const { code } = useParams<{ code: string }>()
  const { siteSettings } = useOutletContext<ShopOutletContext>()
  const uo = siteSettings.uiOrderSuccess

  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  /** رقم واتساب المالك (يُزوَّد من الخادم كـ `whatsappNumber` متماثل مع `whatsappPhoneE164`) */
  const ownerWhatsappNumber = siteSettings.whatsappNumber

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

  const sendOrderWhatsappHref = useMemo(() => {
    if (!order) return null
    const digits = ownerWhatsappNumber.replace(/\D/g, '')
    if (digits.length < 8) return null
    return whatsappChatUrl(ownerWhatsappNumber, buildCustomerWhatsAppOrderMessage(order))
  }, [order, ownerWhatsappNumber])

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
        {sendOrderWhatsappHref ? (
          <a
            href={sendOrderWhatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="order-success-whatsapp-btn"
          >
            أرسل طلبك عبر واتساب 📲
          </a>
        ) : null}
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

      <Link to="/" className="link-btn back-link">
        {uo.continueLabel}
      </Link>
    </main>
  )
}
