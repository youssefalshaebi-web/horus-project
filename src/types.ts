export type Product = {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number | null
  image: string
  /** روابط صور إضافية للمعرض (بعد الصورة الرئيسية) */
  images?: string[] | null
  category: string
  inspiredNote?: string | null
  inspiredImage?: string | null
  /** null أو غير مُعرّف = لا حد أقصى (لا يُخصم من المخزون) */
  stockQuantity?: number | null
}

export type HomeSectionType = 'category' | 'sale' | 'all'

export type HomeSectionConfig = {
  id: string
  label: string
  tileImage: string
  tileEmoji: string
  sectionTitle: string
  sectionIntro: string
  bannerImage: string
  subtitleLinkLabel: string
  /** بدون بادئة section- — مثال: all-products */
  subtitleLinkHash: string
  sectionType: HomeSectionType
  categoryId: string
  visible: boolean
  showInTiles: boolean
  sortOrder: number
  emptyHint: string
}

export type HomeFeatureConfig = {
  iconKey: string
  title: string
  text: string
}

export type FooterNavLink = {
  label: string
  href: string
}

export type FooterNavGroup = {
  title: string
  links: FooterNavLink[]
}

/** أماكن ثابتة لعرض شرائط/بطاقات ترويجية — يختارها المالك */
export type StorefrontPromoPlacement =
  | 'global_after_header'
  | 'global_before_footer'
  | 'home_after_hero'
  | 'home_before_footer'
  | 'product_after_gallery'
  | 'product_after_inspired'
  | 'checkout_top'
  | 'order_success_after_summary'
  | 'track_top'

export type StorefrontPromoKind = 'marquee' | 'banner' | 'card'

export type StorefrontPromoSlot = {
  id: string
  enabled: boolean
  placement: StorefrontPromoPlacement
  kind: StorefrontPromoKind
  title: string
  body: string
  imageUrl: string
  linkUrl: string
  sortOrder: number
}

export type UiHome = {
  showAnnouncement: boolean
  showHero: boolean
  showCategoryTiles: boolean
  showProductSections: boolean
  showFeatures: boolean
  showPreFooter: boolean
  showSiteFooter: boolean
}

export type UiProductCopy = {
  addToCart: string
  outOfStock: string
  ratingHint: string
  inspiredTitle: string
  inspiredDisclaimer: string
  stockIn: string
  stockOut: string
  stockLow: string
  stockSuffix: string
  stockCta: string
  longevityBlurb: string
  trustQualityTitle: string
  trustQualityBody: string
  trustReturnsTitle: string
  trustReturnsBody: string
  accordionShipTitle: string
  accordionShipBullets: string
  accordionMoreTitle: string
  accordionMoreBody: string
  testimonialsTitle: string
  testimonialsLead: string
  reviewsTitle: string
  reviewsScore: string
  reviewsSub: string
  reviewsButton: string
  reviewsNote: string
  /** يُجمَع العنوان: «لماذا » + اسم المتجر + whyTitleSuffix */
  whyTitleSuffix: string
  whyBody: string
}

export type UiProduct = {
  /** بعد مستوحى من = داخل الصفحة؛ sticky = شريط سفلي عائم */
  addToCartMode: 'after_inspired' | 'sticky_bottom'
  showToolbar: boolean
  showGallery: boolean
  showRatingRow: boolean
  showCategoryBadge: boolean
  showInspiredBlock: boolean
  showStockUrgency: boolean
  showDescription: boolean
  showLongevityBanner: boolean
  showTrustBlocks: boolean
  showAccordions: boolean
  showTestimonials: boolean
  showReviewsBlock: boolean
  showWhyBlock: boolean
  showSiteFooter: boolean
  copy: UiProductCopy
}

export type UiCart = {
  title: string
  emptyMessage: string
  totalLabel: string
  checkoutLabel: string
  capLabel: string
  removeLabel: string
  qtyLabel: string
}

export type UiCheckout = {
  pageTitle: string
  leadText: string
  emptyCartWarning: string
  backLabel: string
  submitLabel: string
  showExtraNotes: boolean
  fieldNameLabel: string
  fieldPhoneLabel: string
  fieldCityLabel: string
  fieldAddressLabel: string
  fieldNotesLabel: string
}

export type UiOrderSuccess = {
  eyebrow: string
  title: string
  showLinesDetail: boolean
  linesTitle: string
  orderCodeLabel: string
  statusLabel: string
  trackingLabel: string
  trackingPlaceholder: string
  totalLabel: string
  footerLead: string
  trackLinkLabel: string
  whatsappLabel: string
  continueLabel: string
}

export type UiTrack = {
  pageTitle: string
  leadText: string
  backLabel: string
  codeFieldLabel: string
  codePlaceholder: string
  submitLabel: string
  searchingLabel: string
  orderCodeLabel: string
  statusLabel: string
  trackingLabel: string
  totalLabel: string
}

/** ألوان الواجهة — تُحفظ في الإعدادات وتُطبَّق كمتغيرات CSS */
export type SiteTheme = {
  bg: string
  bgElevated: string
  surface: string
  text: string
  muted: string
  accent: string
  accentHover: string
  danger: string
  salePrice: string
  ctaBg: string
  ctaBgHover: string
  sectionUnderline: string
  announcementBg: string
}

export type PublicSiteSettings = {
  storeName: string
  announcementBar: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  footerTagline: string
  footerEmail: string
  footerPhone: string
  footerCopyright: string
  whatsappPhoneE164: string
  categoriesBlockTitle: string
  headerLogoUrl: string
  headerLogoAlt: string
  homeSections: HomeSectionConfig[]
  homeFeatures: HomeFeatureConfig[]
  /** قسم اختياري بين «المميزات» والفوتر (عروض، اشتراك بريد، إلخ) */
  preFooterEnabled: boolean
  preFooterTitle: string
  preFooterText: string
  preFooterNewsletterEnabled: boolean
  preFooterNewsletterPlaceholder: string
  preFooterNewsletterButtonLabel: string
  /** مجموعات روابط الفوتر (مثلاً المتجر / الدعم) — عمودان على الكمبيوتر، أكورديون على الهاتف */
  footerNavGroups: FooterNavGroup[]

  /** تخصيص الصفحة الرئيسية */
  uiHome: UiHome
  /** صفحة تفاصيل المنتج */
  uiProduct: UiProduct
  /** لوحة السلة */
  uiCart: UiCart
  /** إتمام الطلب */
  uiCheckout: UiCheckout
  /** بعد تأكيد الطلب */
  uiOrderSuccess: UiOrderSuccess
  /** تتبع الطلب */
  uiTrack: UiTrack
  /** شرائط وبطاقات في أماكن محددة */
  promoSlots: StorefrontPromoSlot[]
  /** ألوان الموقع (خلفيات، نص، أزرار، شريط الإعلان، …) */
  siteTheme: SiteTheme
}

export type CartLine = {
  productId: string
  quantity: number
}

export type CheckoutFields = {
  customerName: string
  phone: string
  city: string
  address: string
  extraNotes: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'cancelled'

export type OrderLineSaved = {
  productId: string
  name: string
  price: number
  quantity: number
  lineTotal: number
}

export type PublicOrder = {
  publicCode: string
  createdAt: string
  status: OrderStatus
  trackingNumber: string | null
  customerName: string
  phone: string
  city: string
  address: string
  extraNotes: string
  lines: OrderLineSaved[]
  total: number
}

export type ShopOutletContext = {
  products: Product[]
  siteSettings: PublicSiteSettings
}
