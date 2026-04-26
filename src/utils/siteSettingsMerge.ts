import { defaultPublicSiteSettings } from '../siteDefaults'
import { DEFAULT_SITE_THEME } from '../siteThemeDefaults'
import type { PublicSiteSettings, SiteTheme } from '../types'

/** دمج إعدادات الخادم مع الافتراضيات (بما فيها واجهات الصفحات) */
export function mergePublicSiteSettings(raw: Partial<PublicSiteSettings> | null): PublicSiteSettings {
  const d = defaultPublicSiteSettings()
  if (!raw || typeof raw !== 'object') return d
  const homeSections =
    Array.isArray(raw.homeSections) && raw.homeSections.length > 0 ? raw.homeSections : d.homeSections
  const homeFeatures =
    Array.isArray(raw.homeFeatures) && raw.homeFeatures.length > 0 ? raw.homeFeatures : d.homeFeatures
  return {
    storeName:
      typeof raw.storeName === 'string' && raw.storeName.trim() ? raw.storeName.trim() : d.storeName,
    announcementBar:
      typeof raw.announcementBar === 'string' ? raw.announcementBar : d.announcementBar,
    heroTitle: typeof raw.heroTitle === 'string' ? raw.heroTitle : d.heroTitle,
    heroSubtitle: typeof raw.heroSubtitle === 'string' ? raw.heroSubtitle : d.heroSubtitle,
    heroImage: typeof raw.heroImage === 'string' ? raw.heroImage : d.heroImage,
    footerTagline: typeof raw.footerTagline === 'string' ? raw.footerTagline : d.footerTagline,
    footerEmail: typeof raw.footerEmail === 'string' ? raw.footerEmail : d.footerEmail,
    footerPhone: typeof raw.footerPhone === 'string' ? raw.footerPhone : d.footerPhone,
    footerCopyright:
      typeof raw.footerCopyright === 'string' ? raw.footerCopyright : d.footerCopyright,
    whatsappPhoneE164:
      typeof raw.whatsappPhoneE164 === 'string' ? raw.whatsappPhoneE164 : d.whatsappPhoneE164,
    categoriesBlockTitle:
      typeof raw.categoriesBlockTitle === 'string'
        ? raw.categoriesBlockTitle
        : d.categoriesBlockTitle,
    headerLogoUrl: typeof raw.headerLogoUrl === 'string' ? raw.headerLogoUrl : d.headerLogoUrl,
    headerLogoAlt: typeof raw.headerLogoAlt === 'string' ? raw.headerLogoAlt : d.headerLogoAlt,
    homeSections,
    homeFeatures,
    preFooterEnabled: raw.preFooterEnabled !== false,
    preFooterTitle: typeof raw.preFooterTitle === 'string' ? raw.preFooterTitle : d.preFooterTitle,
    preFooterText: typeof raw.preFooterText === 'string' ? raw.preFooterText : d.preFooterText,
    preFooterNewsletterEnabled: raw.preFooterNewsletterEnabled !== false,
    preFooterNewsletterPlaceholder:
      typeof raw.preFooterNewsletterPlaceholder === 'string'
        ? raw.preFooterNewsletterPlaceholder
        : d.preFooterNewsletterPlaceholder,
    preFooterNewsletterButtonLabel:
      typeof raw.preFooterNewsletterButtonLabel === 'string'
        ? raw.preFooterNewsletterButtonLabel
        : d.preFooterNewsletterButtonLabel,
    footerNavGroups:
      Array.isArray(raw.footerNavGroups) && raw.footerNavGroups.length > 0
        ? raw.footerNavGroups
        : d.footerNavGroups,
    uiHome: {
      ...d.uiHome,
      ...(raw.uiHome && typeof raw.uiHome === 'object' ? raw.uiHome : {}),
    },
    uiProduct: {
      ...d.uiProduct,
      ...(raw.uiProduct && typeof raw.uiProduct === 'object' ? raw.uiProduct : {}),
      copy: {
        ...d.uiProduct.copy,
        ...(raw.uiProduct?.copy && typeof raw.uiProduct.copy === 'object' ? raw.uiProduct.copy : {}),
      },
    },
    uiCart: {
      ...d.uiCart,
      ...(raw.uiCart && typeof raw.uiCart === 'object' ? raw.uiCart : {}),
    },
    uiCheckout: {
      ...d.uiCheckout,
      ...(raw.uiCheckout && typeof raw.uiCheckout === 'object' ? raw.uiCheckout : {}),
    },
    uiOrderSuccess: {
      ...d.uiOrderSuccess,
      ...(raw.uiOrderSuccess && typeof raw.uiOrderSuccess === 'object' ? raw.uiOrderSuccess : {}),
    },
    uiTrack: {
      ...d.uiTrack,
      ...(raw.uiTrack && typeof raw.uiTrack === 'object' ? raw.uiTrack : {}),
    },
    promoSlots: Array.isArray(raw.promoSlots) ? raw.promoSlots : d.promoSlots,
    siteTheme: mergeSiteTheme(raw.siteTheme, d.siteTheme),
  }
}

function mergeSiteTheme(raw: Partial<SiteTheme> | undefined, fallback: SiteTheme): SiteTheme {
  const base = { ...DEFAULT_SITE_THEME, ...fallback }
  if (!raw || typeof raw !== 'object') return base
  const out = { ...base }
  for (const k of Object.keys(DEFAULT_SITE_THEME) as (keyof SiteTheme)[]) {
    const v = raw[k]
    if (typeof v === 'string' && v.trim()) out[k] = v.trim()
  }
  return out
}
