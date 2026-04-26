/** قيم افتراضية للواجهة — يُفضّل مواءمتها مع server/seed.mjs */
import type {
  FooterNavGroup,
  HomeFeatureConfig,
  HomeSectionConfig,
  PublicSiteSettings,
} from './types'
import {
  DEFAULT_UI_CART,
  DEFAULT_UI_CHECKOUT,
  DEFAULT_UI_HOME,
  DEFAULT_UI_ORDER_SUCCESS,
  DEFAULT_UI_PRODUCT,
  DEFAULT_UI_PRODUCT_COPY,
  DEFAULT_UI_TRACK,
} from './storefrontUiDefaults'
import { DEFAULT_SITE_THEME } from './siteThemeDefaults'

export const DEFAULT_FOOTER_NAV: FooterNavGroup[] = [
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

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'womens',
    label: 'عطور نسائية',
    tileImage: '',
    tileEmoji: '',
    sectionTitle: 'عطور نسائية',
    sectionIntro: '',
    bannerImage: '',
    subtitleLinkLabel: 'اطلع على جميع العطور',
    subtitleLinkHash: 'catalog',
    sectionType: 'category',
    categoryId: 'womens',
    visible: true,
    showInTiles: true,
    sortOrder: 0,
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
    subtitleLinkHash: 'catalog',
    sectionType: 'category',
    categoryId: 'mens',
    visible: true,
    showInTiles: true,
    sortOrder: 1,
    emptyHint: '',
  },
  {
    id: 'offers',
    label: 'تخفيضات',
    tileImage: '',
    tileEmoji: '🔥',
    sectionTitle: 'تخفيضات',
    sectionIntro: '',
    bannerImage: '',
    subtitleLinkLabel: 'جميع المنتجات',
    subtitleLinkHash: 'catalog',
    sectionType: 'sale',
    categoryId: '',
    visible: false,
    showInTiles: false,
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
]

export const DEFAULT_HOME_FEATURES: HomeFeatureConfig[] = [
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

export function defaultPublicSiteSettings(): PublicSiteSettings {
  return {
    storeName: 'HORUS parfum',
    announcementBar: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    footerTagline: '',
    footerEmail: '',
    footerPhone: '',
    footerCopyright: '',
    whatsappPhoneE164: '',
    categoriesBlockTitle: 'فئات',
    headerLogoUrl: '',
    headerLogoAlt: '',
    homeSections: DEFAULT_HOME_SECTIONS.map((s) => ({ ...s })),
    homeFeatures: DEFAULT_HOME_FEATURES.map((f) => ({ ...f })),
    preFooterEnabled: true,
    preFooterTitle: 'اشترك واستفد من العروض',
    preFooterText: 'أدخل بريدك ليصلك جديد العطور والتخفيضات الحصرية.',
    preFooterNewsletterEnabled: true,
    preFooterNewsletterPlaceholder: 'بريدك الإلكتروني',
    preFooterNewsletterButtonLabel: 'اشتراك',
    footerNavGroups: DEFAULT_FOOTER_NAV.map((g) => ({
      title: g.title,
      links: g.links.map((l) => ({ ...l })),
    })),
    uiHome: { ...DEFAULT_UI_HOME },
    uiProduct: {
      ...DEFAULT_UI_PRODUCT,
      copy: { ...DEFAULT_UI_PRODUCT_COPY },
    },
    uiCart: { ...DEFAULT_UI_CART },
    uiCheckout: { ...DEFAULT_UI_CHECKOUT },
    uiOrderSuccess: { ...DEFAULT_UI_ORDER_SUCCESS },
    uiTrack: { ...DEFAULT_UI_TRACK },
    promoSlots: [],
    siteTheme: { ...DEFAULT_SITE_THEME },
  }
}
