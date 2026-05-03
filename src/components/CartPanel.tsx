import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { resolveMediaUrl } from '../config'
import { productPrimaryImageUrl } from '../constants/productMedia'
import { formatPrice } from '../utils/formatPrice'
import type { Product, UiCart } from '../types'
import { maxOrderableQty } from '../utils/stock'

type Props = {
  open: boolean
  onClose: () => void
  onCheckout: () => void
  productsById: Map<string, Product>
  ui: UiCart
  /** نص توضيحي — مثلاً إكمال الطلب عبر واتساب */
  whatsappHint?: string
}

export function CartPanel({ open, onClose, onCheckout, productsById, ui, whatsappHint }: Props) {
  const { lines, subtotal, setQuantity, removeLine, addToCart } = useCart()

  const suggested = useMemo(() => {
    const list = [...productsById.values()].filter(
      (p) =>
        (p.category === 'womens' || p.category === 'mens') && maxOrderableQty(p) !== 0,
    )
    return list.slice(0, 3)
  }, [productsById])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="cart-scrim"
        aria-label="إغلاق السلة"
        onClick={onClose}
      />
      <aside className="cart-panel" role="dialog" aria-modal="true" aria-label={ui.title}>
        <div className="cart-panel-head">
          <h2 className="cart-panel-title">{ui.title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty-block">
            <p className="cart-empty">{ui.emptyMessage}</p>
            {suggested.length > 0 ? (
              <div className="cart-suggested">
                <p className="cart-suggested-title">قد يعجبك أيضاً</p>
                <ul className="cart-suggested-list">
                  {suggested.map((p) => (
                    <li key={p.id} className="cart-suggested-row">
                      <Link
                        to={`/product/${encodeURIComponent(p.id)}`}
                        className="cart-suggested-link"
                        onClick={onClose}
                      >
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
                        className="btn btn-ghost btn-sm cart-suggested-add"
                        onClick={() => addToCart(p.id)}
                      >
                        أضف
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="cart-lines">
            {lines.map((line) => {
              const p = productsById.get(line.productId)
              if (!p) return null
              const cap = maxOrderableQty(p)
              return (
                <li key={line.productId} className="cart-line">
                  <div className="cart-line-info">
                    <span className="cart-line-name">{p.name}</span>
                    <span className="cart-line-unit">{formatPrice(p.price)}</span>
                  </div>
                  <div className="cart-line-actions">
                    <label className="qty">
                      <span className="sr-only">{ui.qtyLabel}</span>
                      <input
                        type="number"
                        min={1}
                        max={cap ?? undefined}
                        value={line.quantity}
                        onChange={(e) =>
                          setQuantity(line.productId, Number(e.target.value) || 1)
                        }
                      />
                    </label>
                    {cap != null ? (
                      <span className="cart-line-cap">
                        {ui.capLabel}: {cap}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => removeLine(line.productId)}
                    >
                      {ui.removeLabel}
                    </button>
                  </div>
                  <div className="cart-line-sub">
                    {formatPrice(p.price * line.quantity)}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {lines.length > 0 ? (
          <div className="cart-panel-foot">
            {whatsappHint ? <p className="cart-whatsapp-hint">{whatsappHint}</p> : null}
            <div className="cart-total-row">
              <span>{ui.totalLabel}</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={onCheckout}>
              {ui.checkoutLabel}
            </button>
          </div>
        ) : null}
      </aside>
    </>
  )
}
