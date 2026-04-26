import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import { defaultPublicSiteSettings } from '../siteDefaults'
import { applySiteThemeToDocument } from '../siteThemeDefaults'
import type { Product, PublicSiteSettings, ShopOutletContext } from '../types'
import { mergePublicSiteSettings } from '../utils/siteSettingsMerge'

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    category: p.category || 'all',
    inspiredNote: p.inspiredNote ?? null,
    inspiredImage: p.inspiredImage ?? null,
    stockQuantity:
      p.stockQuantity === undefined || p.stockQuantity === null
        ? null
        : Number.isFinite(p.stockQuantity)
          ? Math.max(0, Math.floor(p.stockQuantity))
          : null,
  }
}

export function ProductsLoader() {
  const [products, setProducts] = useState<Product[]>([])
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings>(() => defaultPublicSiteSettings())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [pr, st] = await Promise.all([
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/settings').then((r) => r.json()),
        ])
        if (cancelled) return
        const list = Array.isArray(pr.products) ? pr.products.map(normalizeProduct) : []
        setProducts(list)
        setSiteSettings(mergePublicSiteSettings(st))
      } catch {
        if (!cancelled) setSiteSettings(defaultPublicSiteSettings())
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    applySiteThemeToDocument(siteSettings.siteTheme)
  }, [siteSettings.siteTheme])

  const ctx: ShopOutletContext = { products, siteSettings }

  return (
    <CartProvider products={products}>
      <Outlet context={ctx} />
    </CartProvider>
  )
}
