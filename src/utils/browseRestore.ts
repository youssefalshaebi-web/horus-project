/** حفظ موضع التصفح والبحث قبل فتح صفحة منتج — تُستعاد عند العودة للرئيسية */
export const BROWSE_STASH_KEY = 'horus-pre-product-browse'
export const SEARCH_SNAP_KEY = 'horus-search-snap'

export function stashBrowseState(): void {
  try {
    const search = sessionStorage.getItem(SEARCH_SNAP_KEY) || ''
    sessionStorage.setItem(
      BROWSE_STASH_KEY,
      JSON.stringify({
        scrollY: window.scrollY,
        search,
        hash: window.location.hash || '',
      }),
    )
  } catch {
    /* ignore */
  }
}

export function readStashedBrowseState(): {
  scrollY: number
  search: string
  hash: string
} | null {
  try {
    const raw = sessionStorage.getItem(BROWSE_STASH_KEY)
    if (!raw) return null
    sessionStorage.removeItem(BROWSE_STASH_KEY)
    const o = JSON.parse(raw) as { scrollY?: number; search?: string; hash?: string }
    return {
      scrollY: typeof o.scrollY === 'number' ? o.scrollY : 0,
      search: typeof o.search === 'string' ? o.search : '',
      hash: typeof o.hash === 'string' ? o.hash : '',
    }
  } catch {
    return null
  }
}
