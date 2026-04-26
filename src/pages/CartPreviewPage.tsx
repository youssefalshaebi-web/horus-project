import { useMemo } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'
import type { ShopOutletContext } from '../types'
import { maxOrderableQty } from '../utils/stock'

export function CartPreviewPage() {
  const navigate = useNavigate()
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  const { lines, subtotal } = useCart()
  const ui = siteSettings.uiCart

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  return (
    <main className="cart-preview-page checkout">
      <button type="button" className="link-btn back-link" onClick={() => navigate(-1)}>
        رجوع
      </button>

      <h1 className="checkout-title">معاينة السلة</h1>
      <p className="checkout-lead">
        مراجعة محتويات طلبك فقط — لتغيير الكمية أو الحذف افتح سلة المشتريات من أيقونة السلة أو من
        القائمة.
      </p>

      {lines.length === 0 ? (
        <p className="checkout-warn">{ui.emptyMessage}</p>
      ) : (
        <>
          <ul className="cart-preview-lines">
            {lines.map((line) => {
              const p = productsById.get(line.productId)
              if (!p) return null
              const cap = maxOrderableQty(p)
              return (
                <li key={line.productId} className="cart-preview-line">
                  <div className="cart-preview-line-img-wrap">
                    <img src={p.image} alt="" className="cart-preview-line-img" />
                  </div>
                  <div className="cart-preview-line-body">
                    <span className="cart-preview-line-name">{p.name}</span>
                    <span className="cart-preview-line-meta">
                      {formatPrice(p.price)} × {line.quantity}
                      {cap != null ? ` — ${ui.capLabel}: ${cap}` : null}
                    </span>
                  </div>
                  <div className="cart-preview-line-total">{formatPrice(p.price * line.quantity)}</div>
                </li>
              )
            })}
          </ul>

          <div className="cart-preview-total">
            <span>{ui.totalLabel}</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate('/checkout')}
          >
            {ui.checkoutLabel}
          </button>
        </>
      )}

      {lines.length === 0 ? (
        <p className="cart-preview-shop-link-wrap">
          <Link to="/" className="btn btn-ghost">
            تصفح المنتجات
          </Link>
        </p>
      ) : null}
    </main>
  )
}
