/** عرض كل المنتجات بدون بقية أقسام الصفحة */
export const CATALOG_HASH = '#catalog'

export function tileHrefForSection(section: {
  id: string
  sectionType: string
}): string {
  if (section.sectionType === 'all' || section.id === 'all-products') {
    return CATALOG_HASH
  }
  return `#section-${section.id}`
}

/** رابط نصّي فرعي (اطلع على جميع العطور) */
export function subtitleLinkTo(hashRaw: string): string {
  const h = hashRaw.replace(/^section-/i, '').trim()
  if (h === 'catalog' || h === 'all-products') return CATALOG_HASH
  return `#section-${h}`
}
