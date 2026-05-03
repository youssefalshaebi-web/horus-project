import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../config'
import { DEFAULT_PRODUCT_PRIMARY_IMAGE, productPrimaryImageUrl } from '../constants/productMedia'
import type { Product } from '../types'
import { stashBrowseState } from '../utils/browseRestore'
import { formatPrice } from '../utils/formatPrice'
import { isProductOutOfStock } from '../utils/stock'

type Props = {
  product: Product
  open: boolean
  onClose: () => void
  onAdd: (productId: string) => void
}

export function ProductQuickPreview({ product, open, onClose, onAdd }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const hero = resolveMediaUrl(DEFAULT_PRODUCT_PRIMARY_IMAGE)
  const thumb = resolveMediaUrl(productPrimaryImageUrl(product.image))
  const compare =
    product.compareAtPrice != null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null
  const out = isProductOutOfStock(product)

  return (
    <>
      <button type="button" className="product-preview-scrim" aria-label="إغلاق" onClick={onClose} />
      <div
        className="product-preview-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-preview-title"
      >
        <div className="product-preview-head">
          <h2 id="product-preview-title" className="product-preview-title">
            {product.name}
          </h2>
          <button type="button" className="icon-btn product-preview-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="product-preview-visuals">
          <img src={hero} alt="" className="product-preview-hero" loading="lazy" />
          <img src={thumb} alt="" className="product-preview-thumb" loading="lazy" width={72} height={72} />
        </div>
        <div className="product-preview-prices">
          <span className="product-price-sale">{formatPrice(product.price)}</span>
          {compare != null ? <span className="product-price-was">{formatPrice(compare)}</span> : null}
        </div>
        <button
          type="button"
          className="btn btn-block btn-product-card-add"
          disabled={out}
          onClick={() => {
            if (!out) onAdd(product.id)
            onClose()
          }}
        >
          {out ? 'غير متوفر حالياً' : 'أضف إلى السلة'}
        </button>
        <Link
          to={`/product/${encodeURIComponent(product.id)}`}
          className="btn btn-ghost btn-block product-preview-full-link"
          onClick={() => {
            stashBrowseState()
            onClose()
          }}
        >
          صفحة المنتج الكاملة
        </Link>
      </div>
    </>
  )
}
