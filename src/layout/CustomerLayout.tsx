import { useMemo, useState } from 'react'
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ShopChromeProvider } from '../context/ShopChromeContext'
import { Header } from '../components/Header'
import { CartPanel } from '../components/CartPanel'
import { AnnouncementBar } from '../components/home/AnnouncementBar'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import { WhatsAppFab } from '../components/WhatsAppFab'
import type { ShopOutletContext } from '../types'

export function CustomerLayout() {
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  const productsById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )
  const [cartOpen, setCartOpen] = useState(false)
  const navigate = useNavigate()
  const { itemCount } = useCart()

  const showAnn =
    siteSettings.uiHome.showAnnouncement && siteSettings.announcementBar.trim().length > 0

  return (
    <ShopChromeProvider>
      {showAnn ? <AnnouncementBar text={siteSettings.announcementBar} /> : null}
      <Header
        products={products}
        itemCount={itemCount}
        onOpenCart={() => setCartOpen(true)}
        logoSrc={siteSettings.headerLogoUrl}
        logoAlt={siteSettings.headerLogoAlt || siteSettings.storeName}
      />
      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="global_after_header" />
      <Outlet context={{ products, siteSettings } satisfies ShopOutletContext} />
      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="global_before_footer" />
      <CartPanel
        productsById={productsById}
        ui={siteSettings.uiCart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false)
          navigate('/checkout')
        }}
      />
      <WhatsAppFab phoneE164={siteSettings.whatsappPhoneE164} />
    </ShopChromeProvider>
  )
}
