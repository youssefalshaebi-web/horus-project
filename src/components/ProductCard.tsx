import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { isProductOutOfStock, maxOrderableQty } from '../utils/stock'

type Props = {
  product: Product
  onAdd: (productId: string) => void
}

export function ProductCard({ product, onAdd }: Props) {
  const compare =
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null

  const showInspired =
    (product.inspiredNote && product.inspiredNote.trim()) ||
    (product.inspiredImage && product.inspiredImage.trim())

  const out = isProductOutOfStock(product)
  const cap = maxOrderableQty(product)
  const lowStock =
    cap != null && cap > 0 && cap <= 5 ? cap : null

  return (
    <article className="product-card">
      <Link to={`/product/${encodeURIComponent(product.id)}`} className="product-card-link">
        <div className="product-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            width={600}
            height={750}
          />
        </div>
        {showInspired ? (
          <div className="product-inspired">
            {product.inspiredImage ? (
              <img
                src={product.inspiredImage}
                alt=""
                className="product-inspired-thumb"
                width={40}
                height={40}
              />
            ) : null}
            {product.inspiredNote ? (
              <p className="product-inspired-note">{product.inspiredNote}</p>
            ) : null}
          </div>
        ) : null}
        <div className="product-body product-body-link">
          <h2 className="product-name product-name-center">{product.name}</h2>
          <div className="product-prices-row">
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
          className="btn btn-cta btn-block"
          disabled={out}
          onClick={() => onAdd(product.id)}
        >
          {out ? 'غير متوفر حالياً' : 'أضف إلى السلة'}
        </button>
      </div>
    </article>
  )
}
