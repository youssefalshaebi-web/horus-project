import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useShopChrome } from '../context/ShopChromeContext'
import { SEARCH_SNAP_KEY } from '../utils/browseRestore'
import { NavDrawer } from './NavDrawer'

type Props = {
  onOpenCart: () => void
  itemCount: number
  /** لوصف رابط الرئيسية لقارئ الشاشة (مثلاً اسم المتجر) */
  homeAriaLabel: string
  /** شعار الصورة — يُعرض بدلاً من الشعار النصي */
  headerLogoSrc?: string
  headerLogoAlt?: string
  showAboutNav?: boolean
}

export function Header({
  onOpenCart,
  itemCount,
  homeAriaLabel,
  headerLogoSrc,
  headerLogoAlt,
  showAboutNav,
}: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { menuOpen, setMenuOpen, searchQuery, setSearchQuery } = useShopChrome()
  const { cartActivityGeneration } = useCart()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const cartBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(SEARCH_SNAP_KEY, searchQuery)
    } catch {
      /* ignore */
    }
  }, [searchQuery])

  useEffect(() => {
    if (cartActivityGeneration === 0) return
    const el = cartBtnRef.current
    if (!el) return
    el.classList.remove('cart-trigger--pulse')
    void el.offsetWidth
    el.classList.add('cart-trigger--pulse')
    const t = window.setTimeout(() => el.classList.remove('cart-trigger--pulse'), 700)
    return () => window.clearTimeout(t)
  }, [cartActivityGeneration])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, setMenuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  function openCartFromMenu() {
    closeMenu()
    onOpenCart()
  }

  function goCheckout() {
    closeMenu()
    navigate('/checkout')
  }

  function goCartPreview() {
    closeMenu()
    navigate('/cart-preview')
  }

  function goTrack() {
    closeMenu()
    navigate('/track')
  }

  function goHome() {
    closeMenu()
    navigate('/')
  }

  function goAbout() {
    closeMenu()
    navigate('/about')
  }

  const logoSrc = headerLogoSrc?.trim()
  const logoAltText = (headerLogoAlt || homeAriaLabel).trim() || 'HORUS parfum'

  return (
    <>
      <div className="header-wrap">
        <header className="site-header">
          <div className="header-edge header-edge-start">
            <button
              type="button"
              className="icon-round"
              onClick={() => {
                setMenuOpen((open) => !open)
              }}
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              aria-haspopup="true"
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              <span className="hamburger" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>

          <div className="header-brand-center">
            <Link
              to="/"
              className="brand-lockup"
              onClick={closeMenu}
              aria-label={homeAriaLabel.trim() || 'HORUS parfum — الرئيسية'}
            >
              {logoSrc ? (
                <img src={logoSrc} alt={logoAltText} className="header-logo-img" />
              ) : (
                <div className="brand-type" dir="ltr">
                  <span className="brand-horus">HORUS</span>
                  <span className="brand-parfum">parfum</span>
                </div>
              )}
            </Link>
          </div>

          <div className="header-edge header-edge-end">
            <button
              type="button"
              className="cart-trigger"
              ref={cartBtnRef}
              onClick={onOpenCart}
              aria-label="فتح سلة المشتريات"
            >
              <span className="cart-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="20" r="1.3" fill="currentColor" />
                  <circle cx="18" cy="20" r="1.3" fill="currentColor" />
                </svg>
              </span>
              {itemCount > 0 ? (
                <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>
              ) : null}
            </button>
          </div>
        </header>

        <div className="header-search-strip">
          <label className="header-search-field" htmlFor="header-search-input">
            <span className="header-search-field-icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
            <input
              ref={searchInputRef}
              id="header-search-input"
              type="search"
              enterKeyHint="search"
              inputMode="search"
              dir="auto"
              autoComplete="off"
              className="header-search-input"
              placeholder="ابحث عن عطر أو النوع…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-controls={searchQuery.trim() ? 'main-search-results' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('')
                  searchInputRef.current?.blur()
                }
              }}
            />
            {searchQuery ? (
              <button
                type="button"
                className="header-search-clear"
                aria-label="مسح البحث"
                onClick={() => {
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
              >
                ×
              </button>
            ) : null}
          </label>
        </div>
      </div>

      <NavDrawer
        open={menuOpen}
        onClose={closeMenu}
        onHome={goHome}
        onOpenCart={openCartFromMenu}
        onCartPreview={goCartPreview}
        onCheckout={goCheckout}
        onTrack={goTrack}
        onAbout={showAboutNav ? goAbout : undefined}
      />
    </>
  )
}
