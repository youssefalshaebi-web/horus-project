import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useShopChrome } from '../context/ShopChromeContext'
import { CategoryTiles } from '../components/home/CategoryTiles'
import { FeaturesBlock } from '../components/home/FeaturesBlock'
import { HeroBanner } from '../components/home/HeroBanner'
import { HomePermanentFeatured } from '../components/home/HomePermanentFeatured'
import { HomeBottomVideoSection } from '../components/home/HomeBottomVideoSection'
import { PreFooterBlock } from '../components/home/PreFooterBlock'
import { ProductSection } from '../components/home/ProductSection'
import { SiteFooter } from '../components/home/SiteFooter'
import { ProductCard } from '../components/ProductCard'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import type { HomeSectionConfig, Product, ShopOutletContext } from '../types'
import { readStashedBrowseState } from '../utils/browseRestore'
import {
  catalogViewModeFromHash,
  subtitleLinkTo,
} from '../utils/homeNav'
import { useSEO } from '../hooks/useSEO'

function byCategory(products: Product[], cat: string) {
  return products.filter((p) => (p.category || 'all').toLowerCase() === cat.toLowerCase())
}

function onSale(products: Product[]) {
  return products.filter(
    (p) => p.compareAtPrice != null && p.compareAtPrice > p.price,
  )
}

function productsForSection(products: Product[], s: HomeSectionConfig) {
  if (s.sectionType === 'news' || s.sectionType === 'lowprice') return []
  if (s.sectionType === 'sale') return onSale(products)
  if (s.sectionType === 'all') return products
  return byCategory(products, s.categoryId || s.id)
}

function catalogListing(products: Product[], mode: NonNullable<ReturnType<typeof catalogViewModeFromHash>>) {
  if (mode === 'all') return [...products]
  if (mode === 'priceAsc') {
    return [...products].sort((a, b) => a.price - b.price)
  }
  if (mode === 'gifts') return byCategory(products, 'gifts')
  if (mode === 'womens') return byCategory(products, 'womens')
  if (mode === 'mens') return byCategory(products, 'mens')
  const saleList = onSale(products)
  return [...saleList].sort((a, b) => {
    const da = (a.compareAtPrice ?? 0) - a.price
    const db = (b.compareAtPrice ?? 0) - b.price
    return db - da
  })
}

const CATALOG_LABELS: Record<
  NonNullable<ReturnType<typeof catalogViewModeFromHash>>,
  { title: string; hint: string }
> = {
  all: {
    title: 'جميع العطور',
    hint: 'تصفّح كامل المنتجات المتوفرة.',
  },
  priceAsc: {
    title: 'السعر المنخفض',
    hint: 'جميع الأصناف مرتبة من الأقل سعراً إلى الأعلى.',
  },
  sale: {
    title: 'الأكثر مبيعاً والعروض',
    hint: 'عطور بسعر مخفّض (وجود سعر قبل التخفيض). مرتبة بحسب قيمة التخفيض.',
  },
  gifts: {
    title: 'مجموعات الهدايا',
    hint: 'منتجات ضمن فئة مجموعات الهدايا.',
  },
  womens: {
    title: 'عطور نسائية',
    hint: 'جميع المنتجات ضمن الفئة النسائية.',
  },
  mens: {
    title: 'عطور رجالية',
    hint: 'جميع المنتجات ضمن الفئة الرجالية.',
  },
}

const HOME_SCROLL_SECTION_IDS = new Set(['womens', 'mens'])

export function ShopPage() {
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  const uh = siteSettings.uiHome
  const { addToCart } = useCart()
  const { setSearchQuery } = useShopChrome()
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const catalogMode = catalogViewModeFromHash(location.hash)

  useSEO({
    siteSettings,
    title: catalogMode
      ? `${CATALOG_LABELS[catalogMode].title} | ${siteSettings.storeName}`.trim()
      : undefined,
  })

  useEffect(() => {
    const stash = readStashedBrowseState()
    if (!stash) return
    setSearchQuery(stash.search)
    requestAnimationFrame(() => {
      requestAnimationFrame(() =>
        window.scrollTo({ top: stash.scrollY, behavior: 'auto' }),
      )
    })
  }, [setSearchQuery])

  useEffect(() => {
    if (catalogMode) {
      window.scrollTo(0, 0)
    }
  }, [catalogMode])

  const tagOptions = useMemo(() => {
    const s = new Set<string>()
    for (const p of products) {
      for (const t of p.tags || []) s.add(t)
    }
    return [...s].sort((a, b) => a.localeCompare(b, 'ar'))
  }, [products])

  const displayProducts = useMemo(
    () =>
      tagFilter ? products.filter((p) => (p.tags || []).includes(tagFilter)) : products,
    [products, tagFilter],
  )

  const visibleSections = useMemo(
    () =>
      [...siteSettings.homeSections]
        .filter((s) => s.visible && HOME_SCROLL_SECTION_IDS.has(s.id))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [siteSettings.homeSections],
  )

  function exitCatalog() {
    navigate({ pathname: '/', hash: '' }, { replace: false })
    window.scrollTo(0, 0)
  }

  if (catalogMode) {
    const labels = CATALOG_LABELS[catalogMode]
    const listed =
      displayProducts.length === 0 ? [] : catalogListing(displayProducts, catalogMode)

    return (
      <main className="home-main home-main--catalog">
        <div className="catalog-view-head">
          <button type="button" className="btn btn-ghost catalog-back-btn" onClick={exitCatalog}>
            ← العودة للرئيسية
          </button>
          <h1 className="catalog-view-title">{labels.title}</h1>
          <p className="catalog-view-hint">{labels.hint}</p>
        </div>
        {displayProducts.length === 0 && products.length === 0 ? (
          <p className="checkout-warn">جاري تحميل المنتجات…</p>
        ) : listed.length === 0 ? (
          <p className="checkout-warn">لا توجد منتجات في هذا العرض حالياً.</p>
        ) : (
          <div className="products-grid products-grid-tight">
            {listed.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}
        {uh.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}
      </main>
    )
  }

  return (
    <main className="home-main">
      <HomePermanentFeatured />

      <div className="home-divider" aria-hidden />

      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="home_after_hero" />

      <HeroBanner heroBanner={siteSettings.heroBanner} />

      {uh.showCategoryTiles ? (
        <CategoryTiles
          categoriesBlockTitle={siteSettings.categoriesBlockTitle}
          sections={siteSettings.homeSections}
        />
      ) : null}

      {uh.showCategoryTiles ? <div className="home-divider home-divider-spaced" aria-hidden /> : null}

      {tagOptions.length > 0 ? (
        <section className="home-tag-filters" aria-label="تصفية حسب الوسم">
          <p className="home-tag-filters-label">تصفية سريعة</p>
          <div className="tag-chip-row">
            <button
              type="button"
              className={tagFilter == null ? 'tag-chip tag-chip--active' : 'tag-chip'}
              onClick={() => setTagFilter(null)}
            >
              الكل
            </button>
            {tagOptions.map((t) => (
              <button
                key={t}
                type="button"
                className={tagFilter === t ? 'tag-chip tag-chip--active' : 'tag-chip'}
                onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {tagOptions.length > 0 ? <div className="home-divider" aria-hidden /> : null}

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
              products={productsForSection(displayProducts, s)}
              onAdd={addToCart}
              emptyHint={s.emptyHint.trim() || undefined}
            />
          ))
        : null}

      {uh.showProductSections && (uh.showFeatures || uh.showPreFooter || uh.showSiteFooter) ? (
        <div className="home-divider home-divider-spaced" aria-hidden />
      ) : null}

      {uh.showFeatures ? <FeaturesBlock features={siteSettings.homeFeatures} /> : null}

      {/* siteSettings.homeVideo من السياق: ProductsLoader → CustomerLayout → ShopPage */}
      <HomeBottomVideoSection homeVideo={siteSettings.homeVideo} />

      {uh.showPreFooter ? <PreFooterBlock settings={siteSettings} /> : null}

      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="home_before_footer" />

      {uh.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}
    </main>
  )
}
