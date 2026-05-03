export function productCategoryLabelAr(category: string | undefined): string {
  const c = (category || 'all').toLowerCase().replace(/\s+/g, '-')
  if (c === 'womens' || c === 'women' || c === 'نسائي') return 'نسائي'
  if (c === 'mens' || c === 'men' || c === 'رجالي') return 'رجالي'
  if (c === 'offers') return 'تخفيضات'
  if (c === 'gifts' || c === 'gift' || c === 'هدايا') return 'مجموعات هدايا'
  if (c === 'all') return 'عام'
  return c || 'عام'
}
