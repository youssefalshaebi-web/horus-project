import type { To } from 'react-router-dom'
import type { HomeSectionConfig } from '../types'

/** عرض كامل المنتجات */
export const CATALOG_HASH = '#catalog'
export const CATALOG_HASH_PRICE_ASC = '#catalog-price-asc'
export const CATALOG_HASH_SALE = '#catalog-sale'
export const CATALOG_HASH_GIFTS = '#catalog-gifts'
export const CATALOG_HASH_WOMENS = '#catalog-womens'
export const CATALOG_HASH_MENS = '#catalog-mens'

export type CatalogViewMode = 'all' | 'priceAsc' | 'sale' | 'gifts' | 'womens' | 'mens'

export function catalogViewModeFromHash(hash: string): CatalogViewMode | null {
  switch (hash) {
    case '#catalog':
      return 'all'
    case CATALOG_HASH_PRICE_ASC:
      return 'priceAsc'
    case CATALOG_HASH_SALE:
      return 'sale'
    case CATALOG_HASH_GIFTS:
      return 'gifts'
    case CATALOG_HASH_WOMENS:
      return 'womens'
    case CATALOG_HASH_MENS:
      return 'mens'
    default:
      return null
  }
}

export function isCatalogHash(hash: string): boolean {
  return catalogViewModeFromHash(hash) != null
}

/** رابط بلاطة الفئة — للتنقل داخل التطبيق */
export function tileToForSection(section: HomeSectionConfig): To {
  if (section.sectionType === 'news') return '/news'
  if (section.sectionType === 'lowprice') return { pathname: '/', hash: 'catalog-price-asc' }
  if (section.sectionType === 'all' || section.id === 'all-products') {
    return { pathname: '/', hash: 'catalog' }
  }
  if (section.sectionType === 'sale') {
    return { pathname: '/', hash: 'catalog-sale' }
  }
  const cat = (section.categoryId || section.id).toLowerCase()
  if (section.sectionType === 'category' && cat === 'gifts') {
    return { pathname: '/', hash: 'catalog-gifts' }
  }
  return { pathname: '/', hash: `section-${section.id}` }
}

/** رابط نصّي فرعي (اطلع على جميع العطور) */
export function subtitleLinkTo(hashRaw: string): string {
  const h = hashRaw.replace(/^section-/i, '').trim()
  if (h === 'catalog' || h === 'all-products') return CATALOG_HASH
  if (h === 'catalog-gifts') return CATALOG_HASH_GIFTS
  if (h === 'catalog-sale') return CATALOG_HASH_SALE
  if (h === 'catalog-price-asc') return CATALOG_HASH_PRICE_ASC
  if (h === 'catalog-womens') return CATALOG_HASH_WOMENS
  if (h === 'catalog-mens') return CATALOG_HASH_MENS
  return `#section-${h}`
}
