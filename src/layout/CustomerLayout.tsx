import { useMemo, useState, useEffect } from 'react'
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ShopChromeProvider, useShopChrome } from '../context/ShopChromeContext'
import { resolveMediaUrl } from '../config'
import { Header } from '../components/Header'
import { CartPanel } from '../components/CartPanel'
import { CartUndoToast } from '../components/CartUndoToast'
import { InlineSearchResults } from '../components/InlineSearchResults'
import { AnnouncementBar } from '../components/home/AnnouncementBar'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import { WhatsAppFab } from '../components/WhatsAppFab'
import type { ShopOutletContext } from '../types'

function CustomerLayoutInner({ products, siteSettings }: ShopOutletContext) {
  const productsById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )
  const [cartOpen, setCartOpen] = useState(false)
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { searchQuery } = useShopChrome()
  const searching = searchQuery.trim().length > 0

  useEffect(() => {
    const url = resolveMediaUrl(siteSettings.faviconUrl)
    if (!url) return
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = url
  }, [siteSettings.faviconUrl])

  const showAnn =
    siteSettings.uiHome.showAnnouncement && siteSettings.announcementBar.trim().length > 0

  return (
    <>
      {showAnn ? <AnnouncementBar text={siteSettings.announcementBar} /> : null}
      <Header
        itemCount={itemCount}
        onOpenCart={() => setCartOpen(true)}
        homeAriaLabel={siteSettings.headerLogoAlt || siteSettings.storeName}
        headerLogoSrc={resolveMediaUrl(siteSettings.headerLogoUrl) || undefined}
        headerLogoAlt={siteSettings.headerLogoAlt}
        showAboutNav={siteSettings.aboutPage.enabled === true}
      />
      {!searching ? (
        <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="global_after_header" />
      ) : null}
      {searching ? (
        <InlineSearchResults products={products} />
      ) : (
        <Outlet context={{ products, siteSettings } satisfies ShopOutletContext} />
      )}
      {!searching ? (
        <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="global_before_footer" />
      ) : null}
      <CartPanel
        productsById={productsById}
        ui={siteSettings.uiCart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false)
          navigate('/checkout')
        }}
        whatsappHint={
          siteSettings.whatsappPhoneE164.trim()
            ? 'بعد «إتمام الطلب» يُكمَل الطلب عبر واتساب — خطوة واحدة واضحة.'
            : undefined
        }
      />
      <CartUndoToast />
      <WhatsAppFab
        phoneE164={siteSettings.whatsappPhoneE164}
        secondaryPhoneE164={siteSettings.whatsappPhoneE164Secondary}
        welcomeMessage={siteSettings.whatsappWelcomeMessage}
      />
    </>
  )
}

export function CustomerLayout() {
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  return (
    <ShopChromeProvider>
      <CustomerLayoutInner products={products} siteSettings={siteSettings} />
    </ShopChromeProvider>
  )
}
