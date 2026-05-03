import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../config'
import { DEFAULT_PRODUCT_PRIMARY_IMAGE, productPrimaryImageUrl } from '../constants/productMedia'
import { ProductQuickPreview } from './ProductQuickPreview'
import type { Product } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { stashBrowseState } from '../utils/browseRestore'
import { isProductOutOfStock, maxOrderableQty } from '../utils/stock'

type Props = {
  product: Product
  onAdd: (productId: string) => void
}

/** نص أسفل الصورة الصغيرة: ملاحظة الإلهام أو مقتطف من الوصف */
function variantNoteText(product: Product): string | null {
  const ins = product.inspiredNote?.trim()
  if (ins) return ins
  const desc = product.description?.trim()
  if (desc) {
    const oneLine = desc.split(/\n/)[0].trim()
    if (oneLine.length > 120) return `${oneLine.slice(0, 117)}…`
    return oneLine
  }
  return null
}

const LONG_PRESS_MS = 480

export function ProductCard({ product, onAdd }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextLinkNav = useRef(false)
  const compare =
    product.compareAtPrice != null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null

  const note = variantNoteText(product)
  const realImageSrc = resolveMediaUrl(productPrimaryImageUrl(product.image))
  const fixedHeroSrc = resolveMediaUrl(DEFAULT_PRODUCT_PRIMARY_IMAGE)

  const out = isProductOutOfStock(product)
  const cap = maxOrderableQty(product)
  const lowStock = cap != null && cap > 0 && cap <= 5 ? cap : null

  const cancelLongPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }, [])

  const startLongPress = useCallback(() => {
    cancelLongPress()
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null
      skipNextLinkNav.current = true
      setPreviewOpen(true)
    }, LONG_PRESS_MS)
  }, [cancelLongPress])

  return (
    <article className="product-card">
      <button
        type="button"
        className="product-card-quick-btn"
        aria-label="معاينة سريعة"
        onClick={(e) => {
          e.preventDefault()
          setPreviewOpen(true)
        }}
      >
        ⧉
      </button>
      <Link
        to={`/product/${encodeURIComponent(product.id)}`}
        className="product-card-link"
        onClick={(e) => {
          if (skipNextLinkNav.current) {
            e.preventDefault()
            skipNextLinkNav.current = false
            return
          }
          stashBrowseState()
        }}
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onPointerLeave={cancelLongPress}
      >
        <div className="product-card-hero" aria-hidden>
          <img
            src={fixedHeroSrc}
            alt=""
            className="product-card-hero-img"
            loading="lazy"
            width={400}
            height={400}
          />
        </div>

        <div className="product-card-variant">
          <img
            src={realImageSrc}
            alt=""
            className="product-card-variant-img"
            loading="lazy"
            width={56}
            height={56}
          />
          <div className="product-card-variant-copy">
            {note ? (
              <>
                <span className="product-card-variant-label">ملاحظات</span>
                <p className="product-card-variant-note">{note}</p>
              </>
            ) : (
              <p className="product-card-variant-note product-card-variant-note--muted">
                مستوحى من أرقى التراكيب العطرية
              </p>
            )}
          </div>
        </div>

        <div className="product-card-info-divider" aria-hidden />

        <div className="product-body product-body-link">
          <h2 className="product-name-center product-card-title">{product.name}</h2>
          <div className="product-prices-row product-prices-row--card">
            <span className="product-price-sale">{formatPrice(product.price)}</span>
            {compare != null ? (
              <span className="product-price-was">{formatPrice(compare)}</span>
            ) : null}
          </div>
          {lowStock != null ? (
            <p className="product-stock-hint">متبقي {lowStock} في المخزون</p>
          ) : null}
        </div>
      </Link>
      <div className="product-card-actions">
        <button
          type="button"
          className="btn btn-block btn-product-card-add"
          disabled={out}
          onClick={() => onAdd(product.id)}
        >
          {out ? 'غير متوفر حالياً' : 'أضف إلى السلة'}
        </button>
      </div>

      <ProductQuickPreview
        product={product}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onAdd={onAdd}
      />
    </article>
  )
}
