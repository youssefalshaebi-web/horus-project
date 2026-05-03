import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import { apiUrl } from '../config'
import { defaultPublicSiteSettings } from '../siteDefaults'
import { applySiteThemeToDocument } from '../siteThemeDefaults'
import type { Product, PublicSiteSettings, ShopOutletContext } from '../types'
import { mergePublicSiteSettings } from '../utils/siteSettingsMerge'

function normalizeTags(raw: unknown): string[] | null {
  if (raw == null) return null
  if (Array.isArray(raw)) {
    const t = raw
      .map((x) => String(x).trim().toLowerCase())
      .filter(Boolean)
    const uniq = [...new Set(t)]
    return uniq.length ? uniq.slice(0, 16) : null
  }
  if (typeof raw === 'string') {
    const t = raw
      .split(/[\n,،]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    const uniq = [...new Set(t)]
    return uniq.length ? uniq.slice(0, 16) : null
  }
  return null
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    category: p.category || 'all',
    inspiredNote: p.inspiredNote ?? null,
    inspiredImage: p.inspiredImage ?? null,
    tags: normalizeTags(p.tags),
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
          fetch(apiUrl('/api/products')).then((r) => r.json()),
          fetch(apiUrl('/api/settings')).then((r) => r.json()),
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
