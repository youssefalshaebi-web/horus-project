import { useMemo } from 'react'
import { useCart } from '../context/CartContext'
import { useShopChrome } from '../context/ShopChromeContext'
import { ProductCard } from './ProductCard'
import type { Product } from '../types'
import { filterProductsByQuery } from '../utils/searchProducts'

type Props = {
  products: Product[]
}

export function InlineSearchResults({ products }: Props) {
  const { addToCart } = useCart()
  const { searchQuery } = useShopChrome()

  const filtered = useMemo(
    () => filterProductsByQuery(products, searchQuery),
    [products, searchQuery],
  )

  const q = searchQuery.trim()

  return (
    <main className="home-main" id="main-search-results">
      <section className="products-section" aria-label="نتائج البحث">
        <h2 className="section-heading section-heading-plain">
          <span className="section-heading-text">نتائج البحث</span>
        </h2>
        {products.length === 0 ? (
          <p className="checkout-warn">جاري تحميل المنتجات…</p>
        ) : filtered.length === 0 ? (
          <p className="checkout-warn">لا توجد منتجات تطابق «{q}».</p>
        ) : (
          <div className="products-grid products-grid-tight">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
