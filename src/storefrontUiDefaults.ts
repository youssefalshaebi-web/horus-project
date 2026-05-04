import type {
  UiCart,
  UiCheckout,
  UiHome,
  UiOrderSuccess,
  UiProduct,
  UiTrack,
} from './types'

/** نصوص افتراضية لصفحة المنتج — يمكن للمالك استبدالها من لوحة التحكم */
export const DEFAULT_UI_PRODUCT_COPY: UiProduct['copy'] = {
  addToCart: 'أضف إلى السلة',
  outOfStock: 'غير متوفر',
  ratingHint: 'تقييم ممتاز من المتسوقين',
  inspiredTitle: 'مستوحى من',
  inspiredDisclaimer:
    'روائح عطرية في نفس العائلة؛ التشابه إلهامي وليس منتجاً أصلياً للعلامات المذكورة.',
  stockIn: 'متوفر في المخزون',
  stockOut: 'غير متوفر حالياً في المخزون',
  stockLow: 'متبقي',
  stockSuffix: 'قطع',
  stockCta: 'اطلب الآن وسنتواصل معك عبر واتساب لترتيب التوصيل.',
  longevityBlurb:
    'صيغ مركّزة تمنح أداءً يدوم لساعات على البشرة والملابس — كما يذكر عملاؤنا في آرائهم.',
  trustQualityTitle: 'جودة مضمونة',
  trustQualityBody:
    'نختار خامات بعناية ونركّز على التناغم والثبات. إن كان لديك أي ملاحظة، راسلنا عبر واتساب.',
  trustReturnsTitle: 'استبدال خلال 14 يوماً',
  trustReturnsBody:
    'إن لم تكن راضياً عن المنتج، يمكنك التواصل معنا لترتيب الاستبدال أو الاسترجاع وفق سياسة المتجر.',
  accordionShipTitle: 'التوصيل والإرجاع',
  accordionShipBullets:
    'تفاصيل الشحن والتكلفة تُحدَّد عند تأكيد الطلب عبر واتساب.\nنستهدف أوقات تسليم معقولة داخل نطاق التغطية المتفق عليها.\nللاستفسارات عن التتبع استخدم صفحة «تتبع الطلب».',
  accordionMoreTitle: 'معلومات إضافية',
  accordionMoreBody:
    'الرجاء الاحتفاظ بالعطر بعيداً عن الحرارة المباشرة والرطوبة. تجنّب الرشّ على المجوهرات المطلية.',
  testimonialsTitle: 'آلاف العملاء الراضين',
  testimonialsLead:
    'نسعى لأن تكون تجربتك سلسة من الطلب حتى الاستلام — ونقدّر كل ملاحظة تصلنا.',
  reviewsTitle: 'آراء العملاء',
  reviewsScore: '4.8 من 5',
  reviewsSub: 'بناءً على تقييمات موثّقة من مشتري المتجر',
  reviewsButton: 'اكتب مراجعة',
  reviewsNote:
    'نعمل على تفعيل المراجعات الكاملة قريباً؛ يمكنك مشاركة رأيك حالياً عبر واتساب.',
  whyTitleSuffix: '؟', // العنوان: لماذا + اسم المتجر + ؟
  whyBody:
    'سواء كنت تفضّل روائح خشبية أو زهرية أو منعشة، نساعدك على اختيار ما يناسبك مع دعم مباشر عند الحاجة.',
}

export const DEFAULT_UI_HOME: UiHome = {
  showAnnouncement: true,
  showHero: true,
  showCategoryTiles: true,
  showProductSections: true,
  showFeatures: true,
  showPreFooter: true,
  showSiteFooter: true,
}

export const DEFAULT_UI_PRODUCT: UiProduct = {
  addToCartMode: 'after_inspired',
  showToolbar: true,
  showGallery: true,
  showRatingRow: true,
  showCategoryBadge: true,
  showInspiredBlock: true,
  showStockUrgency: true,
  showDescription: true,
  showLongevityBanner: true,
  showTrustBlocks: true,
  showAccordions: true,
  showTestimonials: true,
  showReviewsBlock: true,
  showWhyBlock: true,
  showSiteFooter: true,
  copy: { ...DEFAULT_UI_PRODUCT_COPY },
}

export const DEFAULT_UI_CART: UiCart = {
  title: 'سلة المشتريات',
  emptyMessage: 'السلة فارغة. أضف عطوراً من القائمة.',
  totalLabel: 'المجموع',
  checkoutLabel: 'إتمام الطلب',
  capLabel: 'الحد',
  removeLabel: 'حذف',
  qtyLabel: 'الكمية',
}

export const DEFAULT_UI_CHECKOUT: UiCheckout = {
  pageTitle: 'إتمام الطلب',
  leadText:
    'بعد التأكيد سيُحفظ طلبك ويظهر لك رقم الطلب وتفاصيله. يمكنك إشعار المتجر عبر واتساب من الصفحة التالية.',
  emptyCartWarning: 'السلة فارغة. أضف منتجات ثم عد لهذه الصفحة.',
  backLabel: '← العودة للمتجر',
  submitLabel: 'تأكيد الطلب',
  showExtraNotes: true,
  fieldNameLabel: 'الاسم الكامل',
  fieldPhoneLabel: 'رقم الهاتف',
  fieldEmailLabel: 'البريد الإلكتروني',
  fieldCountryLabel: 'الدولة',
  fieldCityLabel: 'المدينة',
  fieldRegionLabel: 'المنطقة / الحي (اختياري)',
  fieldAddressLabel: 'العنوان التفصيلي',
  fieldNotesLabel: 'ملاحظات إضافية (اختياري)',
}

export const DEFAULT_UI_ORDER_SUCCESS: UiOrderSuccess = {
  eyebrow: 'تم استلام الطلب',
  title: 'شكراً لك',
  showLinesDetail: true,
  linesTitle: 'المنتجات',
  orderCodeLabel: 'رقم الطلب',
  statusLabel: 'حالة الطلب',
  trackingLabel: 'رقم التتبع',
  trackingPlaceholder: '— سيُحدَّث من المتجر —',
  totalLabel: 'المجموع',
  footerLead: 'احتفظ برقم الطلب للمراجعة. يمكنك متابعة حالة الطلب ورقم التتبع من صفحة',
  trackLinkLabel: 'تتبع الطلب',
  whatsappLabel: 'إشعار المتجر عبر واتساب',
  continueLabel: 'متابعة التسوق',
}

export const DEFAULT_UI_TRACK: UiTrack = {
  pageTitle: 'تتبع الطلب',
  leadText: 'أدخل رقم الطلب الذي ظهر لك بعد إتمام الشراء.',
  backLabel: '← العودة للمتجر',
  codeFieldLabel: 'رقم الطلب',
  codePlaceholder: 'مثال: 000001',
  submitLabel: 'عرض الطلب',
  searchingLabel: 'جاري البحث…',
  orderCodeLabel: 'رقم الطلب',
  statusLabel: 'الحالة',
  trackingLabel: 'رقم التتبع',
  totalLabel: 'المجموع',
}

