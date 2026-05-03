import { useEffect } from 'react'
import { resolveMediaUrl } from '../config'
import type { PublicSiteSettings } from '../types'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function applyTitleTemplate(template: string, name: string): string {
  const n = name.trim()
  return template.replace(/\{name\}/gi, n).replace(/\{اسم المنتج\}/g, n)
}

export type UseSEOArgs = {
  siteSettings: PublicSiteSettings
  /** عنوان كامل — يتخطى القالب والعنوان الافتراضي */
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  /** عند التمرير يُنشأ العنوان من siteSeo.titleTemplate */
  productName?: string
}

export function useSEO({
  siteSettings,
  title,
  description,
  keywords,
  ogImage,
  productName,
}: UseSEOArgs) {
  useEffect(() => {
    const se = siteSettings.siteSeo
    let pageTitle = title?.trim()
    if (!pageTitle && productName?.trim()) {
      pageTitle = applyTitleTemplate(se.titleTemplate, productName)
    }
    if (!pageTitle) {
      pageTitle = (se.defaultTitle || siteSettings.storeName || 'HORUS').trim()
    }

    const desc = (
      description ??
      se.defaultDescription ??
      siteSettings.siteMetaDescription ??
      ''
    ).trim()
    const kw = (keywords ?? se.defaultKeywords ?? '').trim()
    const ogRaw = (ogImage ?? se.ogImageUrl ?? '').trim()

    document.title = pageTitle
    if (desc) setMeta('name', 'description', desc)
    if (kw) setMeta('name', 'keywords', kw)
    setMeta('property', 'og:title', pageTitle)
    if (desc) setMeta('property', 'og:description', desc)
    const ogAbs = resolveMediaUrl(ogRaw)
    if (ogAbs) setMeta('property', 'og:image', ogAbs)
  }, [siteSettings, title, description, keywords, ogImage, productName])
}
