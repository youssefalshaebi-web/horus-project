import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useShopChrome } from '../context/ShopChromeContext'
import { CategoryTiles } from '../components/home/CategoryTiles'
import { FeaturesBlock } from '../components/home/FeaturesBlock'
import { HomeHero } from '../components/home/HomeHero'
import { PreFooterBlock } from '../components/home/PreFooterBlock'
import { ProductSection } from '../components/home/ProductSection'
import { SiteFooter } from '../components/home/SiteFooter'
import { ProductCard } from '../components/ProductCard'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import type { HomeSectionConfig, Product, ShopOutletContext } from '../types'
import { CATALOG_HASH, subtitleLinkTo } from '../utils/homeNav'
import { filterProductsByQuery } from '../utils/searchProducts'

function byCategory(products: Product[], cat: string) {
  return products.filter((p) => (p.category || 'all').toLowerCase() === cat.toLowerCase())
}

function onSale(products: Product[]) {
  return products.filter(
    (p) => p.compareAtPrice != null && p.compareAtPrice > p.price,
  )
}

function productsForSection(products: Product[], s: HomeSectionConfig) {
  if (s.sectionType === 'sale') return onSale(products)
  if (s.sectionType === 'all') return products
  return byCategory(products, s.categoryId || s.id)
}

export function ShopPage() {
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  const uh = siteSettings.uiHome
  const { addToCart } = useCart()
  const { searchQuery } = useShopChrome()
  const location = useLocation()
  const navigate = useNavigate()
  const catalogMode = location.hash === CATALOG_HASH

  useEffect(() => {
    if (catalogMode) {
      window.scrollTo(0, 0)
    }
  }, [catalogMode])

  const filtered = useMemo(
    () => filterProductsByQuery(products, searchQuery),
    [products, searchQuery],
  )

  const visibleSections = useMemo(
    () =>
      [...siteSettings.homeSections]
        .filter((s) => s.visible)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [siteSettings.homeSections],
  )

  const searching = searchQuery.trim().length > 0

  function exitCatalog() {
    navigate({ pathname: '/', hash: '' }, { replace: false })
    window.scrollTo(0, 0)
  }

  if (catalogMode && !searching) {
    return (
      <main className="home-main home-main--catalog">
        <div className="catalog-view-head">
          <button type="button" className="btn btn-ghost catalog-back-btn" onClick={exitCatalog}>
            ← العودة للرئيسية
          </button>
          <h1 className="catalog-view-title">جميع العطور</h1>
          <p className="catalog-view-hint">تصفّح كامل المنتجات. للعودة لعروض النساء والرجال استخدم الزر أعلاه.</p>
        </div>
        {products.length === 0 ? (
          <p className="checkout-warn">جاري تحميل المنتجات…</p>
        ) : (
          <div className="products-grid products-grid-tight">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}
        {uh.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}
      </main>
    )
  }

  if (searching) {
    return (
      <main className="home-main">
        <section className="products-section" aria-label="نتائج البحث">
          <h2 className="section-heading section-heading-plain">
            <span className="section-heading-text">نتائج البحث</span>
          </h2>
          {products.length === 0 ? (
            <p className="checkout-warn">جاري تحميل المنتجات…</p>
          ) : filtered.length === 0 ? (
            <p className="checkout-warn">
              لا توجد منتجات تطابق «{searchQuery.trim()}».
            </p>
          ) : (
            <div className="products-grid products-grid-tight">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="home-main">
      {uh.showHero ? (
        <HomeHero
          title={siteSettings.heroTitle || siteSettings.storeName}
          subtitle={siteSettings.heroSubtitle}
          imageUrl={siteSettings.heroImage}
        />
      ) : null}

      {uh.showHero ? <div className="home-divider" aria-hidden /> : null}

      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="home_after_hero" />

      {uh.showCategoryTiles ? (
        <CategoryTiles
          categoriesBlockTitle={siteSettings.categoriesBlockTitle}
          sections={siteSettings.homeSections}
        />
      ) : null}

      {uh.showCategoryTiles ? <div className="home-divider home-divider-spaced" aria-hidden /> : null}

      {uh.showProductSections
        ? visibleSections.map((s) => (
            <ProductSection
              key={s.id}
              id={`section-${s.id}`}
              title={s.sectionTitle}
              intro={s.sectionIntro.trim() || undefined}
              bannerImage={s.bannerImage.trim() || undefined}
              subtitleLink={
                s.subtitleLinkLabel.trim() && s.subtitleLinkHash.trim()
                  ? {
                      to: subtitleLinkTo(s.subtitleLinkHash),
                      label: s.subtitleLinkLabel.trim(),
                    }
                  : undefined
              }
              products={productsForSection(products, s)}
              onAdd={addToCart}
              emptyHint={s.emptyHint.trim() || undefined}
            />
          ))
        : null}

      {uh.showProductSections && (uh.showFeatures || uh.showPreFooter || uh.showSiteFooter) ? (
        <div className="home-divider home-divider-spaced" aria-hidden />
      ) : null}

      {uh.showFeatures ? <FeaturesBlock features={siteSettings.homeFeatures} /> : null}

      {uh.showPreFooter ? <PreFooterBlock settings={siteSettings} /> : null}

      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="home_before_footer" />

      {uh.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}
    </main>
  )
}
