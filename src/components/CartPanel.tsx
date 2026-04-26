import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'
import type { Product, UiCart } from '../types'
import { maxOrderableQty } from '../utils/stock'

type Props = {
  open: boolean
  onClose: () => void
  onCheckout: () => void
  productsById: Map<string, Product>
  ui: UiCart
}

export function CartPanel({ open, onClose, onCheckout, productsById, ui }: Props) {
  const { lines, subtotal, setQuantity, removeLine } = useCart()

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
          <p className="cart-empty">{ui.emptyMessage}</p>
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
