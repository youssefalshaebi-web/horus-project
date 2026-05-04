import { getDefaultUiSettings } from './storefrontUiDefaults.mjs'
import { getDefaultSiteTheme } from './themeDefaults.mjs'
import { DEFAULT_PRODUCT_PRIMARY_IMAGE } from './productDefaults.mjs'

/** أقسام الصفحة الرئيسية — تُدار من لوحة التحكم */
export function getDefaultHomeSections() {
  return [
    {
      id: 'news',
      label: 'الأخبار',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'الأخبار',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: '',
      subtitleLinkHash: '',
      sectionType: 'news',
      categoryId: '',
      visible: false,
      showInTiles: true,
      sortOrder: 0,
      emptyHint: '',
    },
    {
      id: 'gifts',
      label: 'مجموعات الهدايا',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'مجموعات الهدايا',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: 'عرض الكل',
      subtitleLinkHash: 'catalog-gifts',
      sectionType: 'category',
      categoryId: 'gifts',
      visible: false,
      showInTiles: true,
      sortOrder: 1,
      emptyHint: 'أضف منتجات بفئة gifts من لوحة التحكم.',
    },
    {
      id: 'bestsellers',
      label: 'الأكثر مبيعاً',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'الأكثر مبيعاً والعروض',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: 'جميع العروض',
      subtitleLinkHash: 'catalog-sale',
      sectionType: 'sale',
      categoryId: '',
      visible: false,
      showInTiles: true,
      sortOrder: 2,
      emptyHint: 'لا توجد عروض حالياً — تابعنا قريباً.',
    },
    {
      id: 'all-products',
      label: 'جميع العطور',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'جميع العطور',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: '',
      subtitleLinkHash: '',
      sectionType: 'all',
      categoryId: '',
      visible: false,
      showInTiles: true,
      sortOrder: 3,
      emptyHint: '',
    },
    {
      id: 'low-price',
      label: 'السعر المنخفض',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'السعر المنخفض',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: '',
      subtitleLinkHash: '',
      sectionType: 'lowprice',
      categoryId: '',
      visible: false,
      showInTiles: true,
      sortOrder: 4,
      emptyHint: '',
    },
    {
      id: 'womens',
      label: 'عطور نسائية',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'عطور نسائية',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: 'اطلع على جميع العطور',
      subtitleLinkHash: 'catalog-womens',
      sectionType: 'category',
      categoryId: 'womens',
      visible: true,
      showInTiles: false,
      sortOrder: 10,
      emptyHint: '',
    },
    {
      id: 'mens',
      label: 'عطور رجالية',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'عطور رجالية',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: 'اطلع على جميع العطور',
      subtitleLinkHash: 'catalog-mens',
      sectionType: 'category',
      categoryId: 'mens',
      visible: true,
      showInTiles: false,
      sortOrder: 11,
      emptyHint: '',
    },
    {
      id: 'offers',
      label: 'تخفيضات',
      tileImage: '',
      tileEmoji: '',
      sectionTitle: 'تخفيضات',
      sectionIntro: '',
      bannerImage: '',
      subtitleLinkLabel: 'جميع المنتجات',
      subtitleLinkHash: 'catalog',
      sectionType: 'sale',
      categoryId: '',
      visible: false,
      showInTiles: false,
      sortOrder: 12,
      emptyHint: 'لا توجد عروض حالياً — تابعنا قريباً.',
    },
  ]
}

export function getDefaultHomeFeatures() {
  return [
    {
      iconKey: 'package',
      title: 'التوصيل والإرجاع',
      text: 'نسعى لإيصال طلبك بأسرع وقت ممكن. تفاصيل الشحن والاستبدال تُحدَّد عند تأكيد الطلب عبر واتساب.',
    },
    {
      iconKey: 'clock',
      title: 'ثبات يدوم لساعات',
      text: 'نختار خلاصات بعناية لضمان أداء ممتاز على البشرة والملابس، مع تركيز على الجودة والتناغم.',
    },
    {
      iconKey: 'support',
      title: 'دعم العملاء',
      text: 'تواصل معنا عبر واتساب لأي استفسار حول الطلب أو المنتجات. نرد في أقرب وقت ممكن.',
    },
  ]
}

export function getDefaultFooterNavGroups() {
  return [
    {
      title: 'المتجر',
      links: [
        { label: 'الرئيسية', href: '/' },
        { label: 'إتمام الطلب', href: '/checkout' },
        { label: 'تتبع الطلب', href: '/track' },
      ],
    },
    {
      title: 'الدعم',
      links: [
        { label: 'تواصل واتساب', href: '#' },
        { label: 'الأسئلة الشائعة', href: '#' },
      ],
    },
  ]
}

/** بيانات أولية عند أول تشغيل — يمكن تعديلها من لوحة التحكم لاحقاً */
export function getDefaultSettings() {
  return {
    storeName: 'HORUS parfum',
    whatsappPhoneE164: '966500000000',
    announcementBar: 'خلاصات تدوم لأكثر من 12 ساعة — عطور مختارة بعناية',
    heroTitle: 'عطور تليق بك',
    heroSubtitle:
      'تشكيلة مدروسة، جودة عالية، وإتمام طلبك بسهولة مع تتبع ودعم عبر واتساب.',
    heroImage:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80',
    footerTagline:
      'في HORUS parfum نقدّم عطوراً عالية الجودة، مستوحاة من أرقى الصيغ العالمية.',
    footerEmail: '',
    footerPhone: '',
    footerCopyright: '© 2026 HORUS parfum. جميع الحقوق محفوظة.',
    categoriesBlockTitle: 'فئات',
    headerLogoUrl: '',
    headerLogoAlt: '',
    homeSections: getDefaultHomeSections(),
    homeFeatures: getDefaultHomeFeatures(),
    preFooterEnabled: true,
    preFooterTitle: 'اشترك واستفد من العروض',
    preFooterText: 'أدخل بريدك ليصلك جديد العطور والتخفيضات الحصرية.',
    preFooterNewsletterEnabled: true,
    preFooterNewsletterPlaceholder: 'بريدك الإلكتروني',
    preFooterNewsletterButtonLabel: 'اشتراك',
    footerNavGroups: getDefaultFooterNavGroups(),
    siteTheme: getDefaultSiteTheme(),
    homeVideo: {
      enabled: true,
      url: '/home-bottom-loop.mp4',
      posterUrl: '',
    },
    heroBanner: {
      enabled: false,
      slides: [],
    },
    aboutPage: {
      enabled: false,
      pageTitle: 'عن المتجر',
      heroImageUrl: '',
      body: '',
      section2Title: '',
      section2Body: '',
      section2ImageUrl: '',
    },
    siteSeo: {
      defaultTitle: 'HORUS parfum',
      titleTemplate: '{name} | HORUS parfum',
      defaultDescription:
        'عطور مختارة بعناية، جودة عالية، وإتمام الطلب مع تتبع ودعم عبر واتساب.',
      defaultKeywords: 'عطور، متجر عطور، HORUS',
      ogImageUrl: '',
    },
    faviconUrl: '',
    siteMetaDescription:
      'عطور مختارة بعناية، جودة عالية، وإتمام الطلب مع تتبع ودعم عبر واتساب.',
    socialInstagram: '',
    socialTiktok: '',
    socialSnapchat: '',
    socialTwitter: '',
    whatsappPhoneE164Secondary: '',
    whatsappWelcomeMessage: '',
    ...getDefaultUiSettings(),
  }
}

/** منتجات أساسية للعرض — يمكنك الاحتفاظ بها أو تعديلها */
export function getBaseProducts() {
  return [
    {
      id: 'oud-noir',
      name: 'عود نوار',
      description: 'مزيج دافئ من العود والتبغ والفانيليا — مناسب للمساء.',
      price: 349,
      compareAtPrice: null,
      category: 'womens',
      inspiredNote: 'ملاحظات شرقية دافئة بإحساس فاخر',
      inspiredImage:
        'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'rose-amber',
      name: 'ورد وعنبر',
      description: 'ورد بلغاري ناعم مع عنبر لطيف ولمسة مسك.',
      price: 289,
      compareAtPrice: 329,
      category: 'womens',
      inspiredNote: 'ورد ناعم مع لمسة عنبر كلاسيكية',
      inspiredImage:
        'https://images.unsplash.com/photo-1587017539500-4bccb56316af?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'velvet-iris',
      name: 'آيريس مخملي',
      description: 'آيريس وبخور خفيف مع جلد ناعم.',
      price: 319,
      compareAtPrice: null,
      category: 'womens',
      inspiredNote: 'بودرة أنيقة مع بخور خفيف',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'citrus-veil',
      name: 'حجاب الحمضيات',
      description: 'برغموت وليمون مع خشب أرز — انتعاش يومي.',
      price: 199,
      compareAtPrice: 229,
      category: 'mens',
      inspiredNote: 'انتعاش حمضيات مع خشب نظيف',
      inspiredImage:
        'https://images.unsplash.com/photo-1523293182080-32113a5f0cb3?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'sandal-musk',
      name: 'صندل ومسك',
      description: 'صندل كريمي مع مسك أبيض وهيل خفيف.',
      price: 259,
      compareAtPrice: null,
      category: 'mens',
      inspiredNote: 'دفء صندل مع مسك نظيف',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'ocean-sage',
      name: 'ماء ومريمية',
      description: 'أموال بحرية مع مريمية وخشب غامق.',
      price: 229,
      compareAtPrice: null,
      category: 'mens',
      inspiredNote: 'إحساس بحري مع أعشاب معطرة',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
  ]
}

const DEMO_NOTE =
  '[عرض تجريبي — احذف هذا المنتج من لوحة التحكم عند جاهزية المتجر]'

/**
 * منتجات وهمية للتجربة — معرّفاتها تبدأ بـ demo-horus- لسهولة التمييز والحذف من الأدمن.
 */
export function getDemoProducts() {
  return [
    {
      id: 'demo-horus-midnight-jasmine',
      name: 'ياسمين منتصف الليل (تجريبي)',
      description: `${DEMO_NOTE} ياسمين أبيض مع مسك وخشب كشميري.`,
      price: 275,
      compareAtPrice: 310,
      category: 'womens',
      inspiredNote: 'إطلالة مسائية ناعمة',
      inspiredImage:
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-silk-peony',
      name: 'فيونكة الفاوانيا (تجريبي)',
      description: `${DEMO_NOTE} فاوانيا وورد مع لمسة خوخ خفيفة.`,
      price: 265,
      compareAtPrice: null,
      category: 'womens',
      inspiredNote: 'زهور ناعمة للنهار',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-amber-dusk',
      name: 'غسق العنبر (تجريبي)',
      description: `${DEMO_NOTE} عنبر دافئ مع فانيليا وصندل.`,
      price: 299,
      compareAtPrice: 349,
      category: 'womens',
      inspiredNote: 'دفء مسائي مريح',
      inspiredImage:
        'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-noir-leather',
      name: 'جلد نوار (تجريبي)',
      description: `${DEMO_NOTE} جلد ناعم مع أرز وبتشولي.`,
      price: 319,
      compareAtPrice: null,
      category: 'mens',
      inspiredNote: 'حضور قوي وأنيق',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-green-vetiver',
      name: 'فيتيفر أخضر (تجريبي)',
      description: `${DEMO_NOTE} فيتيفر وحمضيات مع أعشاب خضراء.`,
      price: 239,
      compareAtPrice: 279,
      category: 'mens',
      inspiredNote: 'انتعاش ترابي نظيف',
      inspiredImage:
        'https://images.unsplash.com/photo-1587017539500-4bccb56316af?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-coastal-wood',
      name: 'خشب ساحلي (تجريبي)',
      description: `${DEMO_NOTE} ملح بحري مع خشب أرز فاتح.`,
      price: 219,
      compareAtPrice: null,
      category: 'mens',
      inspiredNote: 'نسيم بحر خفيف',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-spiced-oud',
      name: 'عود ممزوج (تجريبي)',
      description: `${DEMO_NOTE} عود مع بهارات دافئة وهيل.`,
      price: 389,
      compareAtPrice: 449,
      category: 'offers',
      inspiredNote: 'عرض تجريبي — قسم العروض',
      inspiredImage:
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=200&q=80',
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
    {
      id: 'demo-horus-rose-oud-mini',
      name: 'ميني ورد وعود (تجريبي)',
      description: `${DEMO_NOTE} حجم تجريبي — ورد مع لمسة عود.`,
      price: 149,
      compareAtPrice: 189,
      category: 'offers',
      inspiredNote: 'مناسب كهدية تجريبية',
      inspiredImage: null,
      image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    },
  ]
}

export function getDefaultStore() {
  return {
    settings: getDefaultSettings(),
    products: [...getBaseProducts(), ...getDemoProducts()],
    orders: [],
    news: [],
    lastOrderNumber: 0,
    _internal: {
      demoProductsSeeded: true,
      homeCatalogLayout: true,
    },
  }
}
