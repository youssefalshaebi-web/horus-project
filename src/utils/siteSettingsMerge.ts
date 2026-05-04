import { defaultPublicSiteSettings } from '../siteDefaults'
import { DEFAULT_SITE_THEME } from '../siteThemeDefaults'
import type {
  AboutPageSettings,
  HeroBannerSettings,
  HeroSlide,
  HomeVideoSettings,
  PublicSiteSettings,
  SiteSeoSettings,
  SiteTheme,
} from '../types'

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
    whatsappNumber:
      typeof raw.whatsappNumber === 'string'
        ? raw.whatsappNumber
        : typeof raw.whatsappPhoneE164 === 'string'
          ? raw.whatsappPhoneE164
          : d.whatsappNumber,
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
    homeVideo: mergeHomeVideo(raw.homeVideo, d.homeVideo),
    heroBanner: mergeHeroBanner(raw.heroBanner, d.heroBanner),
    aboutPage: mergeAboutPage(raw.aboutPage, d.aboutPage),
    siteSeo: mergeSiteSeo(raw.siteSeo, d.siteSeo),
    faviconUrl: typeof raw.faviconUrl === 'string' ? raw.faviconUrl : d.faviconUrl,
    siteMetaDescription:
      typeof raw.siteMetaDescription === 'string' ? raw.siteMetaDescription : d.siteMetaDescription,
    socialInstagram: typeof raw.socialInstagram === 'string' ? raw.socialInstagram : d.socialInstagram,
    socialTiktok: typeof raw.socialTiktok === 'string' ? raw.socialTiktok : d.socialTiktok,
    socialSnapchat: typeof raw.socialSnapchat === 'string' ? raw.socialSnapchat : d.socialSnapchat,
    socialTwitter: typeof raw.socialTwitter === 'string' ? raw.socialTwitter : d.socialTwitter,
    whatsappPhoneE164Secondary:
      typeof raw.whatsappPhoneE164Secondary === 'string'
        ? raw.whatsappPhoneE164Secondary
        : d.whatsappPhoneE164Secondary,
    whatsappWelcomeMessage:
      typeof raw.whatsappWelcomeMessage === 'string'
        ? raw.whatsappWelcomeMessage
        : d.whatsappWelcomeMessage,
  }
}

function mergeHomeVideo(
  raw: Partial<HomeVideoSettings> | undefined,
  fallback: HomeVideoSettings,
): HomeVideoSettings {
  if (!raw || typeof raw !== 'object') return { ...fallback }
  return {
    enabled: raw.enabled !== false,
    url: typeof raw.url === 'string' ? raw.url : fallback.url,
    posterUrl: typeof raw.posterUrl === 'string' ? raw.posterUrl : fallback.posterUrl ?? '',
  }
}

function mergeHeroSlide(raw: Partial<HeroSlide> | undefined, fallback: HeroSlide): HeroSlide {
  if (!raw || typeof raw !== 'object') return { ...fallback }
  let fb = String(raw.fallbackBg ?? fallback.fallbackBg).trim()
  if (!/^#[0-9A-Fa-f]{6}$/.test(fb)) {
    const h = fb.replace(/^#/, '')
    if (/^[0-9A-Fa-f]{6}$/.test(h)) fb = `#${h.toLowerCase()}`
    else fb = fallback.fallbackBg
  } else fb = fb.toLowerCase()
  return {
    id: String(raw.id ?? fallback.id).trim() || fallback.id,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : fallback.imageUrl,
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : fallback.subtitle,
    ctaLabel: typeof raw.ctaLabel === 'string' ? raw.ctaLabel : fallback.ctaLabel,
    ctaTo: typeof raw.ctaTo === 'string' ? raw.ctaTo : fallback.ctaTo,
    fallbackBg: fb,
  }
}

function mergeHeroBanner(
  raw: Partial<HeroBannerSettings> | undefined,
  fallback: HeroBannerSettings,
): HeroBannerSettings {
  if (!raw || typeof raw !== 'object')
    return { ...fallback, slides: fallback.slides.map((s) => ({ ...s })) }
  const slideFallback: HeroSlide = {
    id: 'default',
    imageUrl: '',
    title: '',
    subtitle: '',
    ctaLabel: '',
    ctaTo: '',
    fallbackBg: '#1a1816',
  }
  const slides = Array.isArray(raw.slides)
    ? raw.slides.map((s) => mergeHeroSlide(s && typeof s === 'object' ? s : {}, slideFallback))
    : fallback.slides.map((s) => ({ ...s }))
  return {
    enabled: raw.enabled === true,
    slides,
  }
}

function mergeAboutPage(
  raw: Partial<AboutPageSettings> | undefined,
  fallback: AboutPageSettings,
): AboutPageSettings {
  if (!raw || typeof raw !== 'object') return { ...fallback }
  return {
    enabled: raw.enabled === true,
    pageTitle:
      typeof raw.pageTitle === 'string' && raw.pageTitle.trim()
        ? raw.pageTitle.trim()
        : fallback.pageTitle,
    heroImageUrl: typeof raw.heroImageUrl === 'string' ? raw.heroImageUrl : fallback.heroImageUrl,
    body: typeof raw.body === 'string' ? raw.body : fallback.body,
    section2Title: typeof raw.section2Title === 'string' ? raw.section2Title : fallback.section2Title,
    section2Body: typeof raw.section2Body === 'string' ? raw.section2Body : fallback.section2Body,
    section2ImageUrl:
      typeof raw.section2ImageUrl === 'string' ? raw.section2ImageUrl : fallback.section2ImageUrl,
  }
}

function mergeSiteSeo(raw: Partial<SiteSeoSettings> | undefined, fallback: SiteSeoSettings): SiteSeoSettings {
  if (!raw || typeof raw !== 'object') return { ...fallback }
  return {
    defaultTitle:
      typeof raw.defaultTitle === 'string' && raw.defaultTitle.trim()
        ? raw.defaultTitle.trim()
        : fallback.defaultTitle,
    titleTemplate:
      typeof raw.titleTemplate === 'string' && raw.titleTemplate.trim()
        ? raw.titleTemplate.trim()
        : fallback.titleTemplate,
    defaultDescription:
      typeof raw.defaultDescription === 'string' ? raw.defaultDescription : fallback.defaultDescription,
    defaultKeywords:
      typeof raw.defaultKeywords === 'string' ? raw.defaultKeywords : fallback.defaultKeywords,
    ogImageUrl: typeof raw.ogImageUrl === 'string' ? raw.ogImageUrl : fallback.ogImageUrl,
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
