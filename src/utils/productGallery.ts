import { DEFAULT_PRODUCT_PRIMARY_IMAGE } from '../constants/productMedia'
import type { Product } from '../types'

/** صور المعرض: الصورة الرئيسية أولاً ثم الروابط الإضافية بدون تكرار */
export function productGalleryUrls(p: Product): string[] {
  const main = (p.image || '').trim() || DEFAULT_PRODUCT_PRIMARY_IMAGE
  const extras = Array.isArray(p.images)
    ? p.images.map((u) => String(u).trim()).filter(Boolean)
    : []
  const seen = new Set<string>()
  const out: string[] = []
  if (main) {
    seen.add(main)
    out.push(main)
  }
  for (const u of extras) {
    if (!seen.has(u)) {
      seen.add(u)
      out.push(u)
    }
  }
  return out.length ? out : []
}
