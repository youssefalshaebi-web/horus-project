import { useMemo } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { resolveMediaUrl } from '../config'
import { productPrimaryImageUrl } from '../constants/productMedia'
import { formatPrice } from '../utils/formatPrice'
import type { ShopOutletContext } from '../types'
import { maxOrderableQty } from '../utils/stock'

export function CartPreviewPage() {
  const navigate = useNavigate()
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  const { lines, subtotal, addToCart } = useCart()
  const ui = siteSettings.uiCart

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const suggested = useMemo(() => {
    return products
      .filter(
        (p) =>
          (p.category === 'womens' || p.category === 'mens') && maxOrderableQty(p) !== 0,
      )
      .slice(0, 3)
  }, [products])

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
        <div className="cart-preview-empty-block">
          <p className="checkout-warn">{ui.emptyMessage}</p>
          {siteSettings.whatsappPhoneE164.trim() ? (
            <p className="cart-preview-whatsapp-hint checkout-lead">
              بعد إتمام الطلب يُكمَل التأكيد عبر واتساب — خطوة واحدة مع فريقنا.
            </p>
          ) : null}
          {suggested.length > 0 ? (
            <div className="cart-suggested cart-suggested--page">
              <p className="cart-suggested-title">قد يعجبك أيضاً</p>
              <ul className="cart-suggested-list">
                {suggested.map((p) => (
                  <li key={p.id} className="cart-suggested-row">
                    <Link to={`/product/${encodeURIComponent(p.id)}`} className="cart-suggested-link">
                      <img
                        src={resolveMediaUrl(productPrimaryImageUrl(p.image))}
                        alt=""
                        className="cart-suggested-img"
                        width={48}
                        height={48}
                      />
                      <span className="cart-suggested-name">{p.name}</span>
                      <span className="cart-suggested-price">{formatPrice(p.price)}</span>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost cart-suggested-add"
                      onClick={() => addToCart(p.id)}
                    >
                      أضف
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="cart-preview-shop-link-wrap">
            <Link to="/" className="btn btn-ghost">
              تصفح المنتجات
            </Link>
          </p>
        </div>
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
                    <img
                      src={resolveMediaUrl(productPrimaryImageUrl(p.image))}
                      alt=""
                      className="cart-preview-line-img"
                    />
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
    </main>
  )
}
