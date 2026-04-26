import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useShopChrome } from '../context/ShopChromeContext'
import { NavDrawer } from './NavDrawer'
import { SearchDrawer } from './SearchDrawer'
import { resolveMediaUrl } from '../config'
import type { Product } from '../types'

const LOGO_FALLBACK = '/horus-logo.png'

type Props = {
  products: Product[]
  onOpenCart: () => void
  itemCount: number
  logoSrc: string
  logoAlt: string
}

export function Header({ products, onOpenCart, itemCount, logoSrc, logoAlt }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { menuOpen, setMenuOpen, searchOpen, setSearchOpen } = useShopChrome()

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

  return (
    <>
      <div className="header-wrap">
        <header className="site-header">
          <div className="header-edge header-edge-start">
            <button
              type="button"
              className="icon-round"
              onClick={() => {
                setSearchOpen(false)
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
            <Link to="/" className="brand-lockup" onClick={closeMenu}>
              <img
                src={resolveMediaUrl(logoSrc.trim()) || LOGO_FALLBACK}
                alt={logoAlt.trim() || 'Logo'}
                className="brand-logo-img"
                width={48}
                height={48}
              />
              <div className="brand-type" dir="ltr">
                <span className="brand-horus">HORUS</span>
                <span className="brand-parfum">parfum</span>
              </div>
            </Link>
          </div>

          <div className="header-edge header-edge-end">
            <button
              type="button"
              className="icon-round"
              onClick={() => {
                setMenuOpen(false)
                setSearchOpen((v) => !v)
              }}
              aria-expanded={searchOpen}
              aria-controls="search-drawer"
              aria-label={searchOpen ? 'إغلاق البحث' : 'بحث في المنتجات'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
            </button>
            <button
              type="button"
              className="cart-trigger"
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
      </div>

      <NavDrawer
        open={menuOpen}
        onClose={closeMenu}
        onHome={goHome}
        onOpenCart={openCartFromMenu}
        onCartPreview={goCartPreview}
        onCheckout={goCheckout}
        onTrack={goTrack}
      />
      <SearchDrawer
        products={products}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}
