export function productMatchesQuery(
  name: string,
  description: string,
  id: string,
  query: string,
  category?: string,
): boolean {
  const q = query.trim()
  if (!q) return true
  const n = q.toLocaleLowerCase('und')
  const match = (s: string) =>
    s.toLocaleLowerCase('und').includes(n) || s.includes(q)
  return (
    match(name) ||
    match(description) ||
    match(id) ||
    (category != null && category !== '' && match(category))
  )
}

export function filterProductsByQuery<
  T extends { name: string; description: string; id: string; category?: string },
>(products: T[], query: string): T[] {
  return products.filter((p) =>
    productMatchesQuery(p.name, p.description, p.id, query, p.category),
  )
}
