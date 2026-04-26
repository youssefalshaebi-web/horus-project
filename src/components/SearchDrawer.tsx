import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShopChrome } from '../context/ShopChromeContext'
import type { Product } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { filterProductsByQuery } from '../utils/searchProducts'

type Props = {
  products: Product[]
  open: boolean
  onClose: () => void
}

export function SearchDrawer({ products, open, onClose }: Props) {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useShopChrome()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () => filterProductsByQuery(products, searchQuery),
    [products, searchQuery],
  )

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handlePickProduct(id: string) {
    onClose()
    navigate(`/product/${encodeURIComponent(id)}`)
  }

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="search-drawer-backdrop"
        aria-label="إغلاق البحث"
        onClick={onClose}
      />
      <div
        id="search-drawer"
        className="search-drawer is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-drawer-title"
      >
        <div className="search-drawer-head">
          <h2 id="search-drawer-title" className="search-drawer-title">
            بحث
          </h2>
          <button
            type="button"
            className="icon-btn search-drawer-close"
            onClick={onClose}
            aria-label="إغلاق البحث"
          >
            ×
          </button>
        </div>

        <div className="search-drawer-input-shell">
          <label className="sr-only" htmlFor="search-drawer-input">
            ابحث عن عطر
          </label>
          <input
            id="search-drawer-input"
            ref={inputRef}
            type="search"
            dir="auto"
            autoComplete="off"
            className="search-drawer-input"
            placeholder="ابحث عن عطر أو وصف…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-drawer-input-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M16 16l4.2 4.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>

        <div className="search-drawer-body">
          {!searchQuery.trim() ? (
            <p className="search-drawer-hint">اكتب للبحث في العطور المتوفرة.</p>
          ) : filtered.length === 0 ? (
            <p className="search-drawer-empty">لا نتائج مطابقة.</p>
          ) : (
            <ul className="search-drawer-results">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="search-drawer-result"
                    onClick={() => handlePickProduct(p.id)}
                  >
                    <img
                      src={p.image}
                      alt=""
                      className="search-drawer-result-img"
                      width={48}
                      height={48}
                    />
                    <span className="search-drawer-result-text">
                      <span className="search-drawer-result-name">{p.name}</span>
                      <span className="search-drawer-result-price">
                        {formatPrice(p.price)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
