import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { SiteFooter } from '../components/home/SiteFooter'
import { StorefrontPromoStrip } from '../components/storefront/StorefrontPromoStrip'
import type { ShopOutletContext } from '../types'
import { formatPrice } from '../utils/formatPrice'
import { productCategoryLabelAr } from '../utils/productCategoryLabel'
import { productGalleryUrls } from '../utils/productGallery'
import { isProductOutOfStock, maxOrderableQty } from '../utils/stock'

function StarsRow({ filled = 5 }: { filled?: number }) {
  return (
    <span className="pd-stars" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? 'pd-star pd-star--on' : 'pd-star'}>
          ★
        </span>
      ))}
    </span>
  )
}

function SimpleAccordion({
  id,
  title,
  children,
  defaultOpen = false,
}: {
  id: string
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="pd-accordion">
      <button
        type="button"
        className="pd-accordion-trigger"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-heading`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        <span className="pd-accordion-chevron" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open ? (
        <div
          className="pd-accordion-panel"
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-heading`}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

function ProductImageGallery({
  gallery,
  productName,
}: {
  gallery: string[]
  productName: string
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const thumbsRef = useRef<HTMLDivElement>(null)

  const goPrev = useCallback(() => {
    setActiveIdx((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0))
  }, [gallery.length])

  const goNext = useCallback(() => {
    setActiveIdx((i) => (gallery.length ? (i + 1) % gallery.length : 0))
  }, [gallery.length])

  const scrollThumbs = useCallback((dir: -1 | 1) => {
    const el = thumbsRef.current
    if (!el) return
    el.scrollBy({ left: dir * 120, behavior: 'smooth' })
  }, [])

  const mainSrc = gallery[activeIdx] || ''

  return (
    <section className="pd-gallery" aria-label="معرض الصور">
      <div className="pd-gallery-main">
        <button
          type="button"
          className="pd-gallery-nav pd-gallery-nav--prev"
          onClick={goPrev}
          disabled={gallery.length < 2}
          aria-label="الصورة السابقة"
        >
          ‹
        </button>
        <div className="pd-gallery-frame">
          <img src={mainSrc} alt={productName} className="pd-gallery-img" loading="eager" />
        </div>
        <button
          type="button"
          className="pd-gallery-nav pd-gallery-nav--next"
          onClick={goNext}
          disabled={gallery.length < 2}
          aria-label="الصورة التالية"
        >
          ›
        </button>
      </div>
      {gallery.length > 1 ? (
        <div className="pd-thumbs-wrap">
          <button
            type="button"
            className="pd-thumbs-nav"
            onClick={() => scrollThumbs(-1)}
            aria-label="تحريك المصغرات"
          >
            ‹
          </button>
          <div className="pd-thumbs" ref={thumbsRef}>
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className={i === activeIdx ? 'pd-thumb pd-thumb--active' : 'pd-thumb'}
                onClick={() => setActiveIdx(i)}
                aria-label={`صورة ${i + 1}`}
              >
                <img src={src} alt="" width={72} height={90} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pd-thumbs-nav"
            onClick={() => scrollThumbs(1)}
            aria-label="تحريك المصغرات"
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  )
}

const STATIC_TESTIMONIALS = [
  {
    name: 'سارة م.',
    text: 'ثبات ممتاز على الملابس، والتوصيل كان أسرع مما توقعت. سأكرر الطلب قريباً.',
  },
  {
    name: 'عمر ك.',
    text: 'التغليف أنيق والرائحة قريبة جداً من الوصف. مناسب كهدية.',
  },
  {
    name: 'ليان ر.',
    text: 'جودة واضحة من أول رشّة. دعم واتساب سريع لما استفسرت عن المقاس.',
  },
]

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, siteSettings } = useOutletContext<ShopOutletContext>()
  const { addToCart } = useCart()

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  )

  const gallery = useMemo(() => (product ? productGalleryUrls(product) : []), [product])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  if (!productId) {
    return <Navigate to="/" replace />
  }
  if (!product) {
    return <Navigate to="/" replace />
  }

  const compare =
    product.compareAtPrice != null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null

  const showInspired =
    (product.inspiredNote && product.inspiredNote.trim()) ||
    (product.inspiredImage && product.inspiredImage.trim())

  const out = isProductOutOfStock(product)
  const cap = maxOrderableQty(product)
  const lowStock = cap != null && cap > 0 && cap <= 5 ? cap : null

  const inspiredLines = (product.inspiredNote || '')
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const ui = siteSettings.uiProduct
  const c = ui.copy
  const shipBullets = c.accordionShipBullets
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <main className="pd-page">
      {ui.showToolbar ? (
        <div className="pd-toolbar">
          <button type="button" className="btn btn-ghost pd-back" onClick={() => navigate(-1)}>
            ← رجوع
          </button>
          <Link to="/" className="pd-toolbar-home">
            الرئيسية
          </Link>
        </div>
      ) : null}

      {ui.showGallery ? (
        <>
          <ProductImageGallery
            key={productId}
            gallery={gallery.length ? gallery : [product.image]}
            productName={product.name}
          />
          <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="product_after_gallery" />
        </>
      ) : null}

      <section className="pd-block pd-summary">
        {ui.showRatingRow ? (
          <div className="pd-rating-row">
            <StarsRow />
            <span className="pd-rating-text">{c.ratingHint}</span>
          </div>
        ) : null}
        <h1 className="pd-title">{product.name}</h1>
        {ui.showCategoryBadge ? (
          <p className="pd-badge">{productCategoryLabelAr(product.category)}</p>
        ) : null}
        <div className="pd-prices">
          <span className="pd-price">{formatPrice(product.price)}</span>
          {compare != null ? (
            <span className="pd-price-was">{formatPrice(compare)}</span>
          ) : null}
        </div>
      </section>

      {showInspired && ui.showInspiredBlock ? (
        <section className="pd-block pd-inspired" aria-labelledby="pd-inspired-h">
          <h2 id="pd-inspired-h" className="pd-inspired-title">
            {c.inspiredTitle}
          </h2>
          <ul className="pd-inspired-list">
            {inspiredLines.length > 0
              ? inspiredLines.map((line, idx) => (
                  <li key={idx} className="pd-inspired-row">
                    {product.inspiredImage && idx === 0 ? (
                      <img
                        src={product.inspiredImage}
                        alt=""
                        className="pd-inspired-bottle"
                        width={44}
                        height={44}
                      />
                    ) : (
                      <span className="pd-inspired-placeholder" aria-hidden />
                    )}
                    <span className="pd-inspired-line">{line}</span>
                  </li>
                ))
              : (
                  <li className="pd-inspired-row">
                    {product.inspiredImage ? (
                      <img
                        src={product.inspiredImage}
                        alt=""
                        className="pd-inspired-bottle"
                        width={44}
                        height={44}
                      />
                    ) : (
                      <span className="pd-inspired-placeholder" aria-hidden />
                    )}
                    <span className="pd-inspired-line">عطور مرجعية بروائح مشابهة</span>
                  </li>
                )}
          </ul>
          <p className="pd-inspired-foot">{c.inspiredDisclaimer}</p>
        </section>
      ) : null}

      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="product_after_inspired" />

      {ui.addToCartMode === 'after_inspired' ? (
        <section className="pd-block pd-add-cart-inline">
          <button
            type="button"
            className="btn btn-cta btn-block"
            disabled={out}
            onClick={() => addToCart(product.id)}
          >
            {out ? c.outOfStock : c.addToCart}
          </button>
          {!out ? (
            <p className="pd-inline-cta-hint">
              <span className="pd-stock-ok">{c.stockIn}</span>
              {lowStock != null
                ? ` — ${c.stockLow} ${lowStock} ${c.stockSuffix}`
                : ` — ${c.stockCta}`}
            </p>
          ) : null}
        </section>
      ) : null}

      {ui.showStockUrgency ? (
        <section className="pd-block pd-urgency" aria-live="polite">
          {out ? (
            <p className="pd-stock pd-stock--out">{c.stockOut}</p>
          ) : (
            <p className="pd-stock">
              <span className="pd-stock-ok">{c.stockIn}</span>
              {lowStock != null ? (
                <>
                  {' '}
                  — {c.stockLow} {lowStock} {c.stockSuffix}
                </>
              ) : null}
              {' — '}
              {c.stockCta}
            </p>
          )}
        </section>
      ) : null}

      {ui.showDescription && product.description.trim() ? (
        <section className="pd-block pd-desc">
          <p className="pd-desc-text">{product.description.trim()}</p>
        </section>
      ) : null}

      {ui.showLongevityBanner ? (
        <section className="pd-block pd-longevity-banner" aria-label="ثبات العطر">
          <div className="pd-longevity-icon" aria-hidden>
            12h
          </div>
          <p className="pd-longevity-text">{c.longevityBlurb}</p>
        </section>
      ) : null}

      {ui.showTrustBlocks ? (
        <section className="pd-block pd-trust">
          <div className="pd-trust-card">
            <span className="pd-trust-icon" aria-hidden>
              🧴
            </span>
            <div>
              <h3 className="pd-trust-title">{c.trustQualityTitle}</h3>
              <p className="pd-trust-text">{c.trustQualityBody}</p>
            </div>
          </div>
          <div className="pd-trust-card">
            <span className="pd-trust-icon" aria-hidden>
              🛡️
            </span>
            <div>
              <h3 className="pd-trust-title">{c.trustReturnsTitle}</h3>
              <p className="pd-trust-text">{c.trustReturnsBody}</p>
            </div>
          </div>
        </section>
      ) : null}

      {ui.showAccordions ? (
        <section className="pd-accordions">
          <SimpleAccordion id="ship" title={c.accordionShipTitle} defaultOpen>
            <ul className="pd-list">
              {shipBullets.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </SimpleAccordion>
          <SimpleAccordion id="more" title={c.accordionMoreTitle}>
            <p className="pd-muted">{c.accordionMoreBody}</p>
          </SimpleAccordion>
        </section>
      ) : null}

      {ui.showTestimonials ? (
        <section className="pd-block pd-social-proof" aria-labelledby="pd-sp-h">
          <h2 id="pd-sp-h" className="pd-section-title-lines">
            <span className="pd-section-title-lines-text">{c.testimonialsTitle}</span>
          </h2>
          <p className="pd-sp-lead">{c.testimonialsLead}</p>
          <ul className="pd-chat-list">
            {STATIC_TESTIMONIALS.map((t) => (
              <li key={t.name} className="pd-chat-item">
                <span className="pd-chat-avatar" aria-hidden>
                  {t.name.charAt(0)}
                </span>
                <div className="pd-chat-bubble">
                  <strong className="pd-chat-name">{t.name}</strong>
                  <p className="pd-chat-text">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ui.showReviewsBlock ? (
        <section className="pd-block pd-reviews-block" aria-labelledby="pd-rev-h">
          <h2 id="pd-rev-h" className="pd-reviews-heading">
            {c.reviewsTitle}
          </h2>
          <div className="pd-reviews-summary">
            <div className="pd-reviews-stars-line">
              <StarsRow />
              <span className="pd-reviews-score">{c.reviewsScore}</span>
            </div>
            <p className="pd-reviews-count">{c.reviewsSub}</p>
          </div>
          <div className="pd-bars" aria-hidden>
            {[92, 5, 2, 0.5, 0.5].map((pct, i) => (
              <div key={i} className="pd-bar-row">
                <span className="pd-bar-label">{5 - i} ★</span>
                <div className="pd-bar-track">
                  <div className="pd-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn pd-write-review" disabled title="قريباً">
            {c.reviewsButton}
          </button>
          <p className="pd-muted pd-reviews-note">{c.reviewsNote}</p>
        </section>
      ) : null}

      {ui.showWhyBlock ? (
        <section className="pd-why" aria-labelledby="pd-why-h">
          <h2 id="pd-why-h" className="pd-why-title">
            <span className="pd-why-title-text">
              لماذا {siteSettings.storeName}
              {c.whyTitleSuffix}
            </span>
          </h2>
          <p className="pd-why-desc">{c.whyBody}</p>
          <div className="pd-why-dots" aria-hidden>
            <span className="pd-dot pd-dot--on" />
            <span className="pd-dot" />
            <span className="pd-dot" />
          </div>
        </section>
      ) : null}

      {ui.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}

      {ui.addToCartMode === 'sticky_bottom' ? (
        <>
          <div className="pd-sticky-spacer" aria-hidden />
          <div className="pd-sticky-cta">
            <button
              type="button"
              className="btn btn-cta pd-sticky-btn"
              disabled={out}
              onClick={() => addToCart(product.id)}
            >
              {out ? c.outOfStock : c.addToCart}
            </button>
            {!out ? (
              <p className="pd-sticky-hint">
                <span className="pd-stock-ok">{c.stockIn}</span>
                {lowStock != null
                  ? ` — ${c.stockLow} ${lowStock} ${c.stockSuffix}`
                  : null}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </main>
  )
}
