import {
  getDefaultFooterNavGroups,
  getDefaultHomeFeatures,
  getDefaultHomeSections,
} from './seed.mjs'
import { getDefaultUiSettings } from './storefrontUiDefaults.mjs'
import { getDefaultSiteTheme } from './themeDefaults.mjs'

const SECTION_TYPES = new Set(['category', 'sale', 'all', 'news', 'lowprice'])
const ICON_KEYS = new Set(['package', 'clock', 'support', 'truck', 'sparkles'])

function slugId(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
}

/** @param {unknown} input */
export function sanitizeHomeSections(input) {
  if (!Array.isArray(input)) return structuredClone(getDefaultHomeSections())
  const out = []
  let fallback = 0
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    let id = slugId(raw.id)
    if (!id) id = `section-${fallback}`
    const sectionType = SECTION_TYPES.has(raw.sectionType) ? raw.sectionType : 'category'
    let categoryId = slugId(raw.categoryId || raw.id || id)
    if (sectionType !== 'category') categoryId = categoryId || ''
    const sortOrder = Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : fallback
    out.push({
      id,
      label: String(raw.label ?? '').trim() || id,
      tileImage: String(raw.tileImage ?? '').trim(),
      tileEmoji: String(raw.tileEmoji ?? '').trim(),
      sectionTitle: String(raw.sectionTitle ?? '').trim() || String(raw.label ?? '').trim() || id,
      sectionIntro: String(raw.sectionIntro ?? '').trim(),
      bannerImage: String(raw.bannerImage ?? '').trim(),
      subtitleLinkLabel: String(raw.subtitleLinkLabel ?? '').trim(),
      subtitleLinkHash: String(raw.subtitleLinkHash ?? '')
        .trim()
        .replace(/^#/, '')
        .replace(/^section-/i, ''),
      sectionType,
      categoryId: sectionType === 'category' ? categoryId || id : '',
      visible: raw.visible !== false,
      showInTiles: raw.showInTiles !== false,
      sortOrder,
      emptyHint: String(raw.emptyHint ?? '').trim(),
    })
    fallback++
  }
  return out.length ? out : structuredClone(getDefaultHomeSections())
}

/** @param {unknown} input */
export function sanitizeHomeFeatures(input) {
  if (!Array.isArray(input)) return structuredClone(getDefaultHomeFeatures())
  const out = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    let iconKey = String(raw.iconKey ?? 'package').trim()
    if (!ICON_KEYS.has(iconKey)) iconKey = 'package'
    out.push({
      iconKey,
      title: String(raw.title ?? '').trim(),
      text: String(raw.text ?? '').trim(),
    })
  }
  if (out.length < 1) return structuredClone(getDefaultHomeFeatures())
  return out.slice(0, 6)
}

/** @param {unknown} input */
export function sanitizeFooterNavGroups(input) {
  if (!Array.isArray(input)) return structuredClone(getDefaultFooterNavGroups())
  const out = []
  for (const raw of input.slice(0, 4)) {
    if (!raw || typeof raw !== 'object') continue
    const title = String(raw.title ?? '').trim() || 'روابط'
    const links = []
    if (Array.isArray(raw.links)) {
      for (const l of raw.links.slice(0, 16)) {
        if (!l || typeof l !== 'object') continue
        const label = String(l.label ?? '').trim()
        let href = String(l.href ?? '').trim()
        if (!label) continue
        if (!href) href = '#'
        links.push({ label, href })
      }
    }
    out.push({ title, links })
  }
  return out.length ? out : structuredClone(getDefaultFooterNavGroups())
}

const PROMO_PLACEMENTS = new Set([
  'global_after_header',
  'global_before_footer',
  'home_after_hero',
  'home_before_footer',
  'product_after_gallery',
  'product_after_inspired',
  'checkout_top',
  'order_success_after_summary',
  'track_top',
])
const PROMO_KINDS = new Set(['marquee', 'banner', 'card'])

function clip(s, n) {
  const t = String(s ?? '').trim()
  return t.length > n ? t.slice(0, n) : t
}

/** @param {unknown} input */
export function sanitizePromoSlots(input) {
  const defs = getDefaultUiSettings()
  if (!Array.isArray(input)) return defs.promoSlots
  const out = []
  let i = 0
  for (const raw of input.slice(0, 24)) {
    if (!raw || typeof raw !== 'object') continue
    const id = clip(raw.id, 80) || `promo-${i}`
    const placement = PROMO_PLACEMENTS.has(raw.placement) ? raw.placement : 'home_after_hero'
    const kind = PROMO_KINDS.has(raw.kind) ? raw.kind : 'banner'
    out.push({
      id,
      enabled: raw.enabled !== false,
      placement,
      kind,
      title: clip(raw.title, 200),
      body: clip(raw.body, 4000),
      imageUrl: clip(raw.imageUrl, 2000),
      linkUrl: clip(raw.linkUrl, 2000),
      sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : i,
    })
    i++
  }
  return out
}

function mergeProductCopy(defsCopy, patch) {
  const p = patch && typeof patch === 'object' ? patch : {}
  const out = { ...defsCopy, ...p }
  for (const k of Object.keys(defsCopy)) {
    if (typeof out[k] === 'string') {
      const max =
        k.includes('Body') ||
        k.includes('Bullets') ||
        k.includes('Note') ||
        k.includes('Blurb') ||
        k.includes('Disclaimer')
          ? 4000
          : 500
      out[k] = clip(out[k], max)
    }
  }
  return out
}

/** @param {unknown} input */
export function sanitizeUiProduct(input) {
  const defs = getDefaultUiSettings().uiProduct
  if (!input || typeof input !== 'object') return { ...defs }
  const raw = input
  const mode = raw.addToCartMode === 'sticky_bottom' ? 'sticky_bottom' : 'after_inspired'
  return {
    addToCartMode: mode,
    showToolbar: raw.showToolbar !== false,
    showGallery: raw.showGallery !== false,
    showRatingRow: raw.showRatingRow !== false,
    showCategoryBadge: raw.showCategoryBadge !== false,
    showInspiredBlock: raw.showInspiredBlock !== false,
    showStockUrgency: raw.showStockUrgency !== false,
    showDescription: raw.showDescription !== false,
    showLongevityBanner: raw.showLongevityBanner !== false,
    showTrustBlocks: raw.showTrustBlocks !== false,
    showAccordions: raw.showAccordions !== false,
    showTestimonials: raw.showTestimonials !== false,
    showReviewsBlock: raw.showReviewsBlock !== false,
    showWhyBlock: raw.showWhyBlock !== false,
    showSiteFooter: raw.showSiteFooter !== false,
    copy: mergeProductCopy(defs.copy, raw.copy),
  }
}

/** @param {unknown} input */
export function sanitizeUiHome(input) {
  const defs = getDefaultUiSettings().uiHome
  if (!input || typeof input !== 'object') return { ...defs }
  const raw = input
  return {
    showAnnouncement: raw.showAnnouncement !== false,
    showHero: raw.showHero !== false,
    showCategoryTiles: raw.showCategoryTiles !== false,
    showProductSections: raw.showProductSections !== false,
    showFeatures: raw.showFeatures !== false,
    showPreFooter: raw.showPreFooter !== false,
    showSiteFooter: raw.showSiteFooter !== false,
  }
}

function sanitizeUiCart(input) {
  const d = getDefaultUiSettings().uiCart
  if (!input || typeof input !== 'object') return { ...d }
  const r = input
  return {
    title: clip(r.title, 120) || d.title,
    emptyMessage: clip(r.emptyMessage, 500) || d.emptyMessage,
    totalLabel: clip(r.totalLabel, 80) || d.totalLabel,
    checkoutLabel: clip(r.checkoutLabel, 80) || d.checkoutLabel,
    capLabel: clip(r.capLabel, 80) || d.capLabel,
    removeLabel: clip(r.removeLabel, 80) || d.removeLabel,
    qtyLabel: clip(r.qtyLabel, 80) || d.qtyLabel,
  }
}

function sanitizeUiCheckout(input) {
  const d = getDefaultUiSettings().uiCheckout
  if (!input || typeof input !== 'object') return { ...d }
  const r = input
  return {
    pageTitle: clip(r.pageTitle, 200) || d.pageTitle,
    leadText: clip(r.leadText, 2000) || d.leadText,
    emptyCartWarning: clip(r.emptyCartWarning, 500) || d.emptyCartWarning,
    backLabel: clip(r.backLabel, 120) || d.backLabel,
    submitLabel: clip(r.submitLabel, 120) || d.submitLabel,
    showExtraNotes: r.showExtraNotes !== false,
    fieldNameLabel: clip(r.fieldNameLabel, 120) || d.fieldNameLabel,
    fieldPhoneLabel: clip(r.fieldPhoneLabel, 120) || d.fieldPhoneLabel,
    fieldEmailLabel: clip(r.fieldEmailLabel, 120) || d.fieldEmailLabel,
    fieldCountryLabel: clip(r.fieldCountryLabel, 120) || d.fieldCountryLabel,
    fieldCityLabel: clip(r.fieldCityLabel, 120) || d.fieldCityLabel,
    fieldRegionLabel: clip(r.fieldRegionLabel, 120) || d.fieldRegionLabel,
    fieldAddressLabel: clip(r.fieldAddressLabel, 120) || d.fieldAddressLabel,
    fieldNotesLabel: clip(r.fieldNotesLabel, 120) || d.fieldNotesLabel,
  }
}

function sanitizeUiOrderSuccess(input) {
  const d = getDefaultUiSettings().uiOrderSuccess
  if (!input || typeof input !== 'object') return { ...d }
  const r = input
  return {
    eyebrow: clip(r.eyebrow, 200) || d.eyebrow,
    title: clip(r.title, 200) || d.title,
    showLinesDetail: r.showLinesDetail !== false,
    linesTitle: clip(r.linesTitle, 200) || d.linesTitle,
    orderCodeLabel: clip(r.orderCodeLabel, 120) || d.orderCodeLabel,
    statusLabel: clip(r.statusLabel, 120) || d.statusLabel,
    trackingLabel: clip(r.trackingLabel, 120) || d.trackingLabel,
    trackingPlaceholder: clip(r.trackingPlaceholder, 200) || d.trackingPlaceholder,
    totalLabel: clip(r.totalLabel, 120) || d.totalLabel,
    footerLead: clip(r.footerLead, 2000) || d.footerLead,
    trackLinkLabel: clip(r.trackLinkLabel, 120) || d.trackLinkLabel,
    whatsappLabel: clip(r.whatsappLabel, 200) || d.whatsappLabel,
    continueLabel: clip(r.continueLabel, 200) || d.continueLabel,
  }
}

function sanitizeUiTrack(input) {
  const d = getDefaultUiSettings().uiTrack
  if (!input || typeof input !== 'object') return { ...d }
  const r = input
  return {
    pageTitle: clip(r.pageTitle, 200) || d.pageTitle,
    leadText: clip(r.leadText, 2000) || d.leadText,
    backLabel: clip(r.backLabel, 120) || d.backLabel,
    codeFieldLabel: clip(r.codeFieldLabel, 120) || d.codeFieldLabel,
    codePlaceholder: clip(r.codePlaceholder, 120) || d.codePlaceholder,
    submitLabel: clip(r.submitLabel, 120) || d.submitLabel,
    searchingLabel: clip(r.searchingLabel, 120) || d.searchingLabel,
    orderCodeLabel: clip(r.orderCodeLabel, 120) || d.orderCodeLabel,
    statusLabel: clip(r.statusLabel, 120) || d.statusLabel,
    trackingLabel: clip(r.trackingLabel, 120) || d.trackingLabel,
    totalLabel: clip(r.totalLabel, 120) || d.totalLabel,
  }
}

export function sanitizeUiPatch(body) {
  const out = {}
  if (body.uiHome !== undefined) out.uiHome = sanitizeUiHome(body.uiHome)
  if (body.uiProduct !== undefined) out.uiProduct = sanitizeUiProduct(body.uiProduct)
  if (body.uiCart !== undefined) out.uiCart = sanitizeUiCart(body.uiCart)
  if (body.uiCheckout !== undefined) out.uiCheckout = sanitizeUiCheckout(body.uiCheckout)
  if (body.uiOrderSuccess !== undefined) out.uiOrderSuccess = sanitizeUiOrderSuccess(body.uiOrderSuccess)
  if (body.uiTrack !== undefined) out.uiTrack = sanitizeUiTrack(body.uiTrack)
  if (body.promoSlots !== undefined) out.promoSlots = sanitizePromoSlots(body.promoSlots)
  return out
}

function slideId(raw) {
  const t = String(raw || '').trim()
  if (t) return t
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** @param {unknown} input */
export function sanitizeHeroBanner(input) {
  const du = { enabled: false, slides: [] }
  if (!input || typeof input !== 'object') return du
  const enabled = input.enabled === true
  const slidesIn = Array.isArray(input.slides) ? input.slides : []
  const slides = []
  for (const raw of slidesIn) {
    if (!raw || typeof raw !== 'object') continue
    let fb = String(raw.fallbackBg ?? '').trim()
    if (!/^#[0-9A-Fa-f]{6}$/.test(fb)) {
      const h = fb.replace(/^#/, '')
      if (/^[0-9A-Fa-f]{6}$/.test(h)) fb = `#${h.toLowerCase()}`
      else fb = '#1a1816'
    } else fb = fb.toLowerCase()
    slides.push({
      id: slideId(raw.id),
      imageUrl: String(raw.imageUrl ?? '').trim(),
      title: String(raw.title ?? '').trim(),
      subtitle: String(raw.subtitle ?? '').trim(),
      ctaLabel: String(raw.ctaLabel ?? '').trim(),
      ctaTo: String(raw.ctaTo ?? '').trim(),
      fallbackBg: fb,
    })
  }
  return { enabled, slides }
}

/** @param {unknown} input */
export function sanitizeAboutPage(input) {
  const du = {
    enabled: false,
    pageTitle: 'عن المتجر',
    heroImageUrl: '',
    body: '',
    section2Title: '',
    section2Body: '',
    section2ImageUrl: '',
  }
  if (!input || typeof input !== 'object') return { ...du }
  return {
    enabled: input.enabled === true,
    pageTitle: String(input.pageTitle ?? du.pageTitle).trim() || du.pageTitle,
    heroImageUrl: String(input.heroImageUrl ?? '').trim(),
    body: String(input.body ?? '').trim(),
    section2Title: String(input.section2Title ?? '').trim(),
    section2Body: String(input.section2Body ?? '').trim(),
    section2ImageUrl: String(input.section2ImageUrl ?? '').trim(),
  }
}

/** @param {unknown} input */
export function sanitizeSiteSeo(input) {
  const du = {
    defaultTitle: 'HORUS parfum',
    titleTemplate: '{name} | HORUS parfum',
    defaultDescription: '',
    defaultKeywords: '',
    ogImageUrl: '',
  }
  if (!input || typeof input !== 'object') return { ...du }
  return {
    defaultTitle: String(input.defaultTitle ?? du.defaultTitle).trim() || du.defaultTitle,
    titleTemplate: String(input.titleTemplate ?? du.titleTemplate).trim() || du.titleTemplate,
    defaultDescription: String(input.defaultDescription ?? '').trim(),
    defaultKeywords: String(input.defaultKeywords ?? '').trim(),
    ogImageUrl: String(input.ogImageUrl ?? '').trim(),
  }
}

/** @param {unknown} input */
export function sanitizeSiteTheme(input) {
  const d = getDefaultSiteTheme()
  if (!input || typeof input !== 'object') return { ...d }
  const out = { ...d }
  for (const k of Object.keys(d)) {
    const v = input[k]
    if (typeof v !== 'string') continue
    const h = String(v).trim()
    if (/^#[0-9A-Fa-f]{6}$/.test(h)) out[k] = h.toLowerCase()
    else if (/^[0-9A-Fa-f]{6}$/.test(h)) out[k] = `#${h.toLowerCase()}`
  }
  return out
}
