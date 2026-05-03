import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onHome: () => void
  onOpenCart: () => void
  /** معاينة الطلب فقط (بدون نموذج إتمام) */
  onCartPreview: () => void
  onCheckout: () => void
  onTrack: () => void
  onAbout?: () => void
}

function IconCartBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  )
}

/** نفس الأيقونة لـ «معاينة السلة» و«إتمام الطلب» */
function IconOrderFlow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function NavDrawer({
  open,
  onClose,
  onHome,
  onOpenCart,
  onCartPreview,
  onCheckout,
  onTrack,
  onAbout,
}: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="search-drawer-backdrop"
        aria-label="إغلاق القائمة"
        onClick={onClose}
      />
      <div
        id="nav-drawer"
        className="search-drawer is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-drawer-title"
      >
        <div className="search-drawer-head">
          <h2 id="nav-drawer-title" className="search-drawer-title">
            القائمة
          </h2>
          <button
            type="button"
            className="icon-btn search-drawer-close"
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            ×
          </button>
        </div>

        <div className="search-drawer-body nav-drawer-body">
          <ul className="nav-menu-drawer-list">
            <li>
              <button type="button" className="nav-menu-drawer-link" onClick={onHome}>
                الرئيسية
              </button>
            </li>
            {onAbout ? (
              <li>
                <button type="button" className="nav-menu-drawer-link" onClick={onAbout}>
                  عن المتجر
                </button>
              </li>
            ) : null}
            <li>
              <button type="button" className="nav-menu-drawer-link nav-menu-drawer-link--row" onClick={onOpenCart}>
                <span className="nav-menu-drawer-icon" aria-hidden>
                  <IconCartBag />
                </span>
                <span>سلة المشتريات</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-menu-drawer-link nav-menu-drawer-link--row"
                onClick={onCartPreview}
              >
                <span className="nav-menu-drawer-icon" aria-hidden>
                  <IconOrderFlow />
                </span>
                <span>معاينة السلة</span>
              </button>
            </li>
            <li>
              <button type="button" className="nav-menu-drawer-link nav-menu-drawer-link--row" onClick={onCheckout}>
                <span className="nav-menu-drawer-icon" aria-hidden>
                  <IconOrderFlow />
                </span>
                <span>إتمام الطلب</span>
              </button>
            </li>
            <li>
              <button type="button" className="nav-menu-drawer-link" onClick={onTrack}>
                تتبع الطلب
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
