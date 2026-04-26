import type { Product } from '../types'

/** إن وُجد رقم: أقصى كمية يمكن طلبها؛ وإلا لا يوجد سقف */
export function maxOrderableQty(product: Product | undefined): number | null {
  if (!product) return null
  const s = product.stockQuantity
  if (s == null || !Number.isFinite(s)) return null
  return Math.max(0, Math.floor(s))
}

export function isProductOutOfStock(product: Product): boolean {
  const m = maxOrderableQty(product)
  return m !== null && m <= 0
}
