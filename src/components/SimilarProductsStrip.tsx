import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../config'
import { productPrimaryImageUrl } from '../constants/productMedia'
import type { Product } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { stashBrowseState } from '../utils/browseRestore'

type Props = {
  current: Product
  products: Product[]
}

export function SimilarProductsStrip({ current, products }: Props) {
  const similar = products
    .filter((p) => p.id !== current.id && (p.category || '').toLowerCase() === (current.category || '').toLowerCase())
    .slice(0, 4)

  if (similar.length === 0) return null

  return (
    <section className="pd-block pd-similar" aria-labelledby="pd-similar-h">
      <h2 id="pd-similar-h" className="pd-section-title-lines">
        <span className="pd-section-title-lines-text">من نفس العائلة</span>
      </h2>
      <ul className="pd-similar-grid">
        {similar.map((p) => (
          <li key={p.id}>
            <Link
              to={`/product/${encodeURIComponent(p.id)}`}
              className="pd-similar-card"
              onClick={() => stashBrowseState()}
            >
              <img
                src={resolveMediaUrl(productPrimaryImageUrl(p.image))}
                alt=""
                className="pd-similar-img"
                width={80}
                height={80}
                loading="lazy"
              />
              <span className="pd-similar-name">{p.name}</span>
              <span className="pd-similar-price">{formatPrice(p.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
