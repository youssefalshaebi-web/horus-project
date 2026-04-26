import { resolveMediaUrl } from '../../config'
import type { Product } from '../../types'
import { ProductCard } from '../ProductCard'

type Props = {
  id: string
  title: string
  intro?: string
  bannerImage?: string
  subtitleLink?: { to: string; label: string }
  products: Product[]
  onAdd: (id: string) => void
  emptyHint?: string
}

export function ProductSection({
  id,
  title,
  intro,
  bannerImage,
  subtitleLink,
  products,
  onAdd,
  emptyHint,
}: Props) {
  return (
    <section
      id={id}
      className="product-section"
      aria-labelledby={`${id}-title`}
    >
      {bannerImage ? (
        <div className="product-section-banner">
          <img src={resolveMediaUrl(bannerImage)} alt="" className="product-section-banner-img" loading="lazy" />
        </div>
      ) : null}
      <header className="product-section-head">
        <h2 id={`${id}-title`} className="product-section-title">
          {title}
        </h2>
        {subtitleLink ? (
          <a href={subtitleLink.to} className="product-section-link">
            {subtitleLink.label}
          </a>
        ) : null}
      </header>
      {intro ? <p className="product-section-intro">{intro}</p> : null}
      {products.length === 0 ? (
        <p className="product-section-empty">
          {emptyHint || 'لا توجد منتجات في هذا القسم حالياً.'}
        </p>
      ) : (
        <div className="products-grid products-grid-tight">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      )}
    </section>
  )
}
