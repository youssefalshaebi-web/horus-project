import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { apiJson } from '../../api/client'
import { AdminImageUploadField } from '../../components/admin/AdminImageUploadField'
import { defaultPublicSiteSettings } from '../../siteDefaults'
import { applySiteThemeToDocument, DEFAULT_SITE_THEME, SITE_THEME_LABELS } from '../../siteThemeDefaults'
import type {
  FooterNavGroup,
  HeroBannerSettings,
  HeroSlide,
  HomeFeatureConfig,
  HomeSectionConfig,
  HomeVideoSettings,
  PublicSiteSettings,
  SiteTheme,
  StorefrontPromoKind,
  StorefrontPromoPlacement,
  StorefrontPromoSlot,
  UiHome,
} from '../../types'
import { mergePublicSiteSettings } from '../../utils/siteSettingsMerge'
import { AdminVideoSettings } from './AdminVideoSettings'

type StorefrontEditorTab = 'content' | 'theme' | 'product' | 'cartflow' | 'promos' | 'homevideo'

const PROMO_PLACE_LABELS: { value: StorefrontPromoPlacement; label: string }[] = [
  { value: 'global_after_header', label: 'عالمي: أسفل الهيدر مباشرة' },
  { value: 'global_before_footer', label: 'عالمي: فوق الفوتر (كل الصفحات)' },
  { value: 'home_after_hero', label: 'الرئيسية: بعد الهيرو' },
  { value: 'home_before_footer', label: 'الرئيسية: قبل الفوتر' },
  { value: 'product_after_gallery', label: 'المنتج: بعد معرض الصور' },
  { value: 'product_after_inspired', label: 'المنتج: بعد «مستوحى من»' },
  { value: 'checkout_top', label: 'إتمام الطلب: أعلى الصفحة' },
  { value: 'order_success_after_summary', label: 'بعد الشراء: بعد ملخص الطلب' },
  { value: 'track_top', label: 'تتبع الطلب: أعلى الصفحة' },
]

const SECTION_TYPE_OPTS: { value: HomeSectionConfig['sectionType']; label: string }[] = [
  { value: 'category', label: 'فئة (اربط المنتجات بـ categoryId)' },
  { value: 'sale', label: 'تخفيضات (سعر قبل التخفيض)' },
  { value: 'all', label: 'جميع المنتجات' },
  { value: 'news', label: 'أخبار (بلاطة → صفحة الأخبار)' },
  { value: 'lowprice', label: 'السعر المنخفض (بلاطة → ترتيب حسب السعر)' },
]

const ICON_OPTS = [
  { value: 'package', label: 'توصيل' },
  { value: 'clock', label: 'وقت' },
  { value: 'support', label: 'دعم' },
  { value: 'truck', label: 'شاحنة' },
  { value: 'sparkles', label: 'لمعة' },
]

function newSection(sortIndex: number): HomeSectionConfig {
  const id = `custom-${Date.now()}`
  return {
    id,
    label: 'قسم جديد',
    tileImage: '',
    tileEmoji: '',
    sectionTitle: 'عنوان القسم',
    sectionIntro: '',
    bannerImage: '',
    subtitleLinkLabel: '',
    subtitleLinkHash: '',
    sectionType: 'category',
    categoryId: id,
    visible: true,
    showInTiles: true,
    sortOrder: sortIndex,
    emptyHint: '',
  }
}

function newFeature(): HomeFeatureConfig {
  return { iconKey: 'package', title: '', text: '' }
}

function newFooterGroup(): FooterNavGroup {
  return { title: 'عنوان المجموعة', links: [{ label: 'رابط', href: '/' }] }
}

function newHeroSlide(): HeroSlide {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `slide-${Date.now()}`,
    imageUrl: '',
    title: '',
    subtitle: '',
    ctaLabel: '',
    ctaTo: '/',
    fallbackBg: '#1a1816',
  }
}

export function AdminStorefront() {
  const [form, setForm] = useState<PublicSiteSettings>(defaultPublicSiteSettings())
  const [storefrontTab, setStorefrontTab] = useState<StorefrontEditorTab>('content')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const d = await apiJson<PublicSiteSettings>('/api/admin/settings')
      setForm(mergePublicSiteSettings(d))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر التحميل')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي من API
    void load()
  }, [load])

  useEffect(() => {
    applySiteThemeToDocument(form.siteTheme)
  }, [form.siteTheme])

  function patch<K extends keyof PublicSiteSettings>(key: K, value: PublicSiteSettings[K]) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  function patchUiHome<K extends keyof UiHome>(key: K, value: UiHome[K]) {
    setForm((s) => ({ ...s, uiHome: { ...s.uiHome, [key]: value } }))
  }

  function patchTheme<K extends keyof SiteTheme>(key: K, value: string) {
    setForm((s) => ({ ...s, siteTheme: { ...s.siteTheme, [key]: value } }))
  }

  function patchHomeVideo(partial: Partial<HomeVideoSettings>) {
    setForm((s) => ({ ...s, homeVideo: { ...s.homeVideo, ...partial } }))
  }

  function updatePromo(index: number, partial: Partial<StorefrontPromoSlot>) {
    setForm((s) => {
      const promoSlots = [...s.promoSlots]
      const cur = promoSlots[index]
      if (!cur) return s
      promoSlots[index] = { ...cur, ...partial }
      return { ...s, promoSlots }
    })
  }

  function removePromo(index: number) {
    if (!window.confirm('حذف هذا الإعلان؟')) return
    setForm((s) => ({ ...s, promoSlots: s.promoSlots.filter((_, i) => i !== index) }))
  }

  function updateSection(index: number, partial: Partial<HomeSectionConfig>) {
    setForm((s) => {
      const homeSections = [...s.homeSections]
      const cur = homeSections[index]
      if (!cur) return s
      homeSections[index] = { ...cur, ...partial }
      return { ...s, homeSections }
    })
  }

  function moveSection(index: number, dir: -1 | 1) {
    setForm((s) => {
      const homeSections = [...s.homeSections]
      const j = index + dir
      if (j < 0 || j >= homeSections.length) return s
      ;[homeSections[index], homeSections[j]] = [homeSections[j], homeSections[index]]
      return { ...s, homeSections }
    })
  }

  function addSection() {
    setForm((s) => ({
      ...s,
      homeSections: [...s.homeSections, newSection(s.homeSections.length)],
    }))
  }

  function removeSection(index: number) {
    if (!window.confirm('حذف هذا القسم من الصفحة الرئيسية؟')) return
    setForm((s) => ({
      ...s,
      homeSections: s.homeSections.filter((_, i) => i !== index),
    }))
  }

  function updateFeature(index: number, partial: Partial<HomeFeatureConfig>) {
    setForm((s) => {
      const homeFeatures = [...s.homeFeatures]
      const cur = homeFeatures[index]
      if (!cur) return s
      homeFeatures[index] = { ...cur, ...partial }
      return { ...s, homeFeatures }
    })
  }

  function addFeature() {
    setForm((s) => ({
      ...s,
      homeFeatures: [...s.homeFeatures, newFeature()].slice(0, 6),
    }))
  }

  function removeFeature(index: number) {
    setForm((s) => ({
      ...s,
      homeFeatures: s.homeFeatures.filter((_, i) => i !== index),
    }))
  }

  function updateFooterGroupTitle(gi: number, title: string) {
    setForm((s) => {
      const footerNavGroups = [...s.footerNavGroups]
      const g = footerNavGroups[gi]
      if (!g) return s
      footerNavGroups[gi] = { ...g, title }
      return { ...s, footerNavGroups }
    })
  }

  function updateFooterLink(
    gi: number,
    li: number,
    partial: Partial<{ label: string; href: string }>,
  ) {
    setForm((s) => {
      const footerNavGroups = [...s.footerNavGroups]
      const g = footerNavGroups[gi]
      if (!g) return s
      const links = [...g.links]
      const cur = links[li]
      if (!cur) return s
      links[li] = { ...cur, ...partial }
      footerNavGroups[gi] = { ...g, links }
      return { ...s, footerNavGroups }
    })
  }

  function addFooterLink(gi: number) {
    setForm((s) => {
      const footerNavGroups = [...s.footerNavGroups]
      const g = footerNavGroups[gi]
      if (!g) return s
      footerNavGroups[gi] = { ...g, links: [...g.links, { label: 'جديد', href: '/' }] }
      return { ...s, footerNavGroups }
    })
  }

  function removeFooterLink(gi: number, li: number) {
    setForm((s) => {
      const footerNavGroups = [...s.footerNavGroups]
      const g = footerNavGroups[gi]
      if (!g || g.links.length < 2) return s
      footerNavGroups[gi] = { ...g, links: g.links.filter((_, i) => i !== li) }
      return { ...s, footerNavGroups }
    })
  }

  function addFooterGroup() {
    setForm((s) => ({
      ...s,
      footerNavGroups: [...s.footerNavGroups, newFooterGroup()].slice(0, 4),
    }))
  }

  function removeFooterGroup(gi: number) {
    setForm((s) => ({
      ...s,
      footerNavGroups: s.footerNavGroups.filter((_, i) => i !== gi),
    }))
  }

  function patchHeroBanner(partial: Partial<HeroBannerSettings>) {
    setForm((s) => ({ ...s, heroBanner: { ...s.heroBanner, ...partial } }))
  }

  function updateHeroSlide(index: number, partial: Partial<HeroSlide>) {
    setForm((s) => {
      const slides = [...s.heroBanner.slides]
      const cur = slides[index]
      if (!cur) return s
      slides[index] = { ...cur, ...partial }
      return { ...s, heroBanner: { ...s.heroBanner, slides } }
    })
  }

  function moveHeroSlide(index: number, dir: -1 | 1) {
    setForm((s) => {
      const slides = [...s.heroBanner.slides]
      const j = index + dir
      if (j < 0 || j >= slides.length) return s
      ;[slides[index], slides[j]] = [slides[j], slides[index]]
      return { ...s, heroBanner: { ...s.heroBanner, slides } }
    })
  }

  function addHeroSlide() {
    setForm((s) => ({
      ...s,
      heroBanner: { ...s.heroBanner, slides: [...s.heroBanner.slides, newHeroSlide()] },
    }))
  }

  function removeHeroSlide(index: number) {
    if (!window.confirm('حذف هذه الشريحة؟')) return
    setForm((s) => ({
      ...s,
      heroBanner: {
        ...s.heroBanner,
        slides: s.heroBanner.slides.filter((_, i) => i !== index),
      },
    }))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    try {
      const homeSections = form.homeSections.map((s, i) => ({ ...s, sortOrder: i }))
      await apiJson('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          announcementBar: form.announcementBar,
          heroTitle: form.heroTitle,
          heroSubtitle: form.heroSubtitle,
          heroImage: form.heroImage,
          categoriesBlockTitle: form.categoriesBlockTitle,
          headerLogoUrl: form.headerLogoUrl,
          headerLogoAlt: form.headerLogoAlt,
          homeSections,
          homeFeatures: form.homeFeatures.filter((f) => f.title.trim() || f.text.trim()),
          preFooterEnabled: form.preFooterEnabled,
          preFooterTitle: form.preFooterTitle,
          preFooterText: form.preFooterText,
          preFooterNewsletterEnabled: form.preFooterNewsletterEnabled,
          preFooterNewsletterPlaceholder: form.preFooterNewsletterPlaceholder,
          preFooterNewsletterButtonLabel: form.preFooterNewsletterButtonLabel,
          footerNavGroups: form.footerNavGroups,
          uiHome: form.uiHome,
          uiProduct: form.uiProduct,
          uiCart: form.uiCart,
          uiCheckout: form.uiCheckout,
          uiOrderSuccess: form.uiOrderSuccess,
          uiTrack: form.uiTrack,
          promoSlots: form.promoSlots,
          siteTheme: form.siteTheme,
          heroBanner: form.heroBanner,
        }),
      })
      await load()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    }
  }

  if (loading) {
    return <p className="checkout-lead">جاري التحميل…</p>
  }

  return (
    <form className="checkout-form admin-storefront" onSubmit={handleSave}>
      <div className="admin-storefront-tabs" role="tablist" aria-label="أقسام واجهة المتجر">
        {(
          [
            ['content', 'المحتوى والرئيسية'],
            ['theme', 'الألوان والمظهر'],
            ['homevideo', 'فيديو الرئيسية'],
            ['product', 'صفحة المنتج'],
            ['cartflow', 'السلة والطلب'],
            ['promos', 'شرائط وبطاقات'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={storefrontTab === id}
            className={`admin-storefront-tab${storefrontTab === id ? ' is-active' : ''}`}
            onClick={() => setStorefrontTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {storefrontTab === 'theme' ? (
        <>
          <p className="checkout-lead">
            غيّر ألوان الخلفية، النص، التمييز، والأزرار وشريط الإعلان. المعاينة تظهر هنا في لوحة التحكم؛
            احفظ أسفل الصفحة لتثبيت الإعدادات على واجهة الزبائن (ثم حدّث صفحة المتجر).
          </p>
          <div className="admin-card admin-theme-colors">
            <div className="admin-grid-2">
              {SITE_THEME_LABELS.map(({ key, label }) => (
                <label key={key} className="field admin-theme-color-row">
                  <span>{label}</span>
                  <div className="admin-theme-color-inputs">
                    <input
                      type="color"
                      aria-label={label}
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(form.siteTheme[key])
                          ? form.siteTheme[key]
                          : '#888888'
                      }
                      onChange={(e) => patchTheme(key, e.target.value)}
                    />
                    <input
                      type="text"
                      value={form.siteTheme[key]}
                      onChange={(e) => patchTheme(key, e.target.value)}
                      dir="ltr"
                      spellCheck={false}
                    />
                  </div>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setForm((s) => ({ ...s, siteTheme: { ...DEFAULT_SITE_THEME } }))}
            >
              استعادة الألوان الافتراضية
            </button>
          </div>
        </>
      ) : null}

      {storefrontTab === 'homevideo' ? (
        <AdminVideoSettings
          homeVideo={form.homeVideo}
          onPatch={patchHomeVideo}
          onSettingsMerged={(s) => setForm(mergePublicSiteSettings(s))}
        />
      ) : null}

      {storefrontTab === 'content' ? (
        <>
          <p className="checkout-lead">
            تحكّم بشريط الإعلان، شعار الهيدر، بلاطات الفئات، أقسام المنتجات (بانر لكل قسم)،
            ومربعات «لماذا نحن». يمكنك لصق رابط صورة أو استخدام «رفع وتقطيع» من الكمبيوتر أو الهاتف.
          </p>

          <h2 className="admin-subtitle">الرئيسية — إظهار أو إخفاء الأقسام</h2>
          <p className="admin-muted">
            عطّل أي عنصر لإخفائه من المتجر دون حذف المحتوى المحفوظ (يمكن إعادة التفعيل لاحقاً).
          </p>
          <div className="admin-card admin-grid-2">
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiHome.showAnnouncement}
                onChange={(e) => patchUiHome('showAnnouncement', e.target.checked)}
              />
              <span>شريط الإعلان العلوي</span>
            </label>
            <div className="admin-card admin-muted" style={{ gridColumn: '1 / -1', padding: '0.85rem 1rem' }}>
              لافتة أعلى الصفحة الرئيسية (تحت البحث) ثابتة في التطبيق — صورة العبوة والنص المعروضان
              للزبائن لا يُعدَّلان من لوحة التحكم.
            </div>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiHome.showCategoryTiles}
                onChange={(e) => patchUiHome('showCategoryTiles', e.target.checked)}
              />
              <span>بلاطات الفئات</span>
            </label>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiHome.showProductSections}
                onChange={(e) => patchUiHome('showProductSections', e.target.checked)}
              />
              <span>أقسام المنتجات في الرئيسية</span>
            </label>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiHome.showFeatures}
                onChange={(e) => patchUiHome('showFeatures', e.target.checked)}
              />
              <span>مربعات «لماذا نحن»</span>
            </label>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiHome.showPreFooter}
                onChange={(e) => patchUiHome('showPreFooter', e.target.checked)}
              />
              <span>قسم ما قبل الفوتر (اشتراك / عروض)</span>
            </label>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiHome.showSiteFooter}
                onChange={(e) => patchUiHome('showSiteFooter', e.target.checked)}
              />
              <span>فوتر الموقع</span>
            </label>
          </div>

          <h2 className="admin-subtitle">بانر الرئيسية (سلايدر)</h2>
          <p className="admin-muted">
            يظهر أعلى البلاطات في الرئيسية. أكثر من شريحة تُفعّل التنقّل التلقائي كل 5 ثوانٍ
            والنقاط.
          </p>
          <div className="admin-card admin-grid-2">
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.heroBanner.enabled}
                onChange={(e) => patchHeroBanner({ enabled: e.target.checked })}
              />
              <span>تفعيل بانر الرئيسية</span>
            </label>
          </div>
          <div className="admin-section-list">
            {form.heroBanner.slides.map((slide, index) => (
              <div key={slide.id} className="admin-card admin-section-editor">
                <div className="admin-section-editor-head">
                  <strong>شريحة {index + 1}</strong>
                  <div className="admin-section-editor-actions">
                    <button
                      type="button"
                      className="link-btn"
                      disabled={index === 0}
                      onClick={() => moveHeroSlide(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="link-btn"
                      disabled={index === form.heroBanner.slides.length - 1}
                      onClick={() => moveHeroSlide(index, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" className="link-btn" onClick={() => removeHeroSlide(index)}>
                      حذف
                    </button>
                  </div>
                </div>
                <AdminImageUploadField
                  label="صورة الخلفية"
                  value={slide.imageUrl}
                  onChange={(url) => updateHeroSlide(index, { imageUrl: url })}
                  aspect={16 / 9}
                />
                <label className="field">
                  <span>العنوان الرئيسي</span>
                  <input
                    value={slide.title}
                    onChange={(e) => updateHeroSlide(index, { title: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>العنوان الفرعي</span>
                  <textarea
                    rows={2}
                    value={slide.subtitle}
                    onChange={(e) => updateHeroSlide(index, { subtitle: e.target.value })}
                  />
                </label>
                <div className="admin-grid-2">
                  <label className="field">
                    <span>نص الزر</span>
                    <input
                      value={slide.ctaLabel}
                      onChange={(e) => updateHeroSlide(index, { ctaLabel: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>رابط الزر (مسار، #قسم، أو https)</span>
                    <input
                      dir="ltr"
                      value={slide.ctaTo}
                      onChange={(e) => updateHeroSlide(index, { ctaTo: e.target.value })}
                      placeholder="/about أو #catalog-womens"
                    />
                  </label>
                </div>
                <label className="field admin-theme-color-row">
                  <span>لون خلفية احتياطي</span>
                  <div className="admin-theme-color-inputs">
                    <input
                      type="color"
                      aria-label="لون الخلفية"
                      value={/^#[0-9A-Fa-f]{6}$/.test(slide.fallbackBg) ? slide.fallbackBg : '#1a1816'}
                      onChange={(e) => updateHeroSlide(index, { fallbackBg: e.target.value })}
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={slide.fallbackBg}
                      onChange={(e) => updateHeroSlide(index, { fallbackBg: e.target.value })}
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={addHeroSlide}>
            + إضافة شريحة
          </button>

          <h2 className="admin-subtitle">الهيدر والإعلان</h2>
      <label className="field">
        <span>شريط الإعلان أعلى الموقع</span>
        <input
          value={form.announcementBar}
          onChange={(e) => patch('announcementBar', e.target.value)}
        />
      </label>
      <AdminImageUploadField
        label="شعار الهيدر (فارغ = الشعار النصي الافتراضي)"
        value={form.headerLogoUrl}
        onChange={(url) => patch('headerLogoUrl', url)}
        aspect={1}
        hint="صورة مربعة تقريباً؛ رابط أو رفع من الجهاز."
      />
      <label className="field">
        <span>نص بديل للشعار (وصف للصورة)</span>
        <input
          value={form.headerLogoAlt}
          onChange={(e) => patch('headerLogoAlt', e.target.value)}
        />
      </label>

      <h2 className="admin-subtitle">لافتة أعلى الرئيسية</h2>
      <p className="admin-muted admin-card" style={{ padding: '1rem' }}>
        العنوان «عطور، تليق بك»، النص التعريفي، وصورة عبوة OMBRA تُعرض دائماً تحت شريط البحث؛ لا
        تُخزَّن في إعدادات المتجر ولا يمكن تعديلها من هنا.
      </p>

      <h2 className="admin-subtitle">بلاطات الفئات</h2>
      <label className="field">
        <span>عنوان كتلة «الفئات»</span>
        <input
          value={form.categoriesBlockTitle}
          onChange={(e) => patch('categoriesBlockTitle', e.target.value)}
        />
      </label>

      <h2 className="admin-subtitle">أقسام الصفحة الرئيسية</h2>
      <p className="admin-muted">
        المعرف <code className="admin-code">id</code> يُستخدم في الرابط (#section-id). لنوع «فئة»
        ضع نفس القيمة في «معرّف الفئة» كما في المنتج (مثلاً womens).
      </p>

      <div className="admin-section-list">
        {form.homeSections.map((sec, index) => (
          <div key={`${sec.id}-${index}`} className="admin-card admin-section-editor">
            <div className="admin-section-editor-head">
              <strong>قسم {index + 1}: {sec.id}</strong>
              <div className="admin-section-editor-actions">
                <button
                  type="button"
                  className="link-btn"
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="link-btn"
                  disabled={index === form.homeSections.length - 1}
                  onClick={() => moveSection(index, 1)}
                >
                  ↓
                </button>
                <button type="button" className="link-btn" onClick={() => removeSection(index)}>
                  حذف
                </button>
              </div>
            </div>

            <div className="admin-grid-2">
              <label className="field">
                <span>معرّف القسم (لاتيني)</span>
                <input
                  value={sec.id}
                  onChange={(e) => updateSection(index, { id: e.target.value.trim() })}
                />
              </label>
              <label className="field">
                <span>نوع القسم</span>
                <select
                  value={sec.sectionType}
                  onChange={(e) =>
                    updateSection(index, {
                      sectionType: e.target.value as HomeSectionConfig['sectionType'],
                    })
                  }
                >
                  {SECTION_TYPE_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {sec.sectionType === 'category' ? (
              <label className="field">
                <span>معرّف الفئة للمنتجات (category في المنتج)</span>
                <input
                  value={sec.categoryId}
                  onChange={(e) => updateSection(index, { categoryId: e.target.value.trim() })}
                />
              </label>
            ) : null}

            <div className="admin-grid-2">
              <label className="field">
                <span>نص البلاطة (القائمة السريعة)</span>
                <input
                  value={sec.label}
                  onChange={(e) => updateSection(index, { label: e.target.value })}
                />
              </label>
              <label className="field">
                <span>إيموجي البلاطة (اختياري)</span>
                <input
                  value={sec.tileEmoji}
                  onChange={(e) => updateSection(index, { tileEmoji: e.target.value })}
                />
              </label>
            </div>
            <AdminImageUploadField
              label="صورة البلاطة (اختياري)"
              value={sec.tileImage}
              onChange={(url) => updateSection(index, { tileImage: url })}
              aspect={1}
            />
            <label className="field">
              <span>عنوان القسم</span>
              <input
                value={sec.sectionTitle}
                onChange={(e) => updateSection(index, { sectionTitle: e.target.value })}
              />
            </label>
            <label className="field">
              <span>نص تحت العنوان (اختياري)</span>
              <textarea
                rows={2}
                value={sec.sectionIntro}
                onChange={(e) => updateSection(index, { sectionIntro: e.target.value })}
              />
            </label>
            <AdminImageUploadField
              label="بانر القسم (صورة واسعة، اختياري)"
              value={sec.bannerImage}
              onChange={(url) => updateSection(index, { bannerImage: url })}
              aspect={16 / 9}
            />
            <div className="admin-grid-2">
              <label className="field">
                <span>نص الرابط بجانب العنوان</span>
                <input
                  value={sec.subtitleLinkLabel}
                  onChange={(e) => updateSection(index, { subtitleLinkLabel: e.target.value })}
                />
              </label>
              <label className="field">
                <span>يربط بقسم (معرّف هدف بدون section-)</span>
                <input
                  value={sec.subtitleLinkHash}
                  onChange={(e) => updateSection(index, { subtitleLinkHash: e.target.value })}
                  placeholder="مثال: all-products"
                />
              </label>
            </div>
            <label className="field">
              <span>رسالة عند عدم وجود منتجات</span>
              <input
                value={sec.emptyHint}
                onChange={(e) => updateSection(index, { emptyHint: e.target.value })}
              />
            </label>
            <div className="admin-grid-2">
              <label className="field admin-checkbox-field">
                <input
                  type="checkbox"
                  checked={sec.visible}
                  onChange={(e) => updateSection(index, { visible: e.target.checked })}
                />
                <span>إظهار القسم في الصفحة</span>
              </label>
              <label className="field admin-checkbox-field">
                <input
                  type="checkbox"
                  checked={sec.showInTiles}
                  onChange={(e) => updateSection(index, { showInTiles: e.target.checked })}
                />
                <span>إظهار في بلاطات الفئات</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-block" onClick={addSection}>
        + إضافة قسم
      </button>

      <h2 className="admin-subtitle">مربعات «لماذا نحن»</h2>
      {form.homeFeatures.map((f, index) => (
        <div key={`feat-${index}`} className="admin-card">
          <div className="admin-section-editor-head">
            <strong>ميزة {index + 1}</strong>
            <button type="button" className="link-btn" onClick={() => removeFeature(index)}>
              حذف
            </button>
          </div>
          <label className="field">
            <span>الأيقونة</span>
            <select
              value={f.iconKey}
              onChange={(e) => updateFeature(index, { iconKey: e.target.value })}
            >
              {ICON_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>العنوان</span>
            <input
              value={f.title}
              onChange={(e) => updateFeature(index, { title: e.target.value })}
            />
          </label>
          <label className="field">
            <span>النص</span>
            <textarea
              rows={3}
              value={f.text}
              onChange={(e) => updateFeature(index, { text: e.target.value })}
            />
          </label>
        </div>
      ))}
      {form.homeFeatures.length < 6 ? (
        <button type="button" className="btn btn-ghost btn-block" onClick={addFeature}>
          + إضافة ميزة
        </button>
      ) : null}

      <h2 className="admin-subtitle">قسم ما قبل الفوتر (اشتراك / عروض)</h2>
      <p className="admin-muted">
        يظهر بعد «لماذا نحن» مباشرة. زر الاشتراك يفتح بريدك لإرسال طلب للعنوان المعرّف في الفوتر.
      </p>
      <label className="field admin-checkbox-field">
        <input
          type="checkbox"
          checked={form.preFooterEnabled}
          onChange={(e) => patch('preFooterEnabled', e.target.checked)}
        />
        <span>تفعيل القسم</span>
      </label>
      <label className="field">
        <span>عنوان القسم</span>
        <input value={form.preFooterTitle} onChange={(e) => patch('preFooterTitle', e.target.value)} />
      </label>
      <label className="field">
        <span>نص توضيحي</span>
        <textarea
          rows={2}
          value={form.preFooterText}
          onChange={(e) => patch('preFooterText', e.target.value)}
        />
      </label>
      <label className="field admin-checkbox-field">
        <input
          type="checkbox"
          checked={form.preFooterNewsletterEnabled}
          onChange={(e) => patch('preFooterNewsletterEnabled', e.target.checked)}
        />
        <span>إظهار حقل البريد وزر الاشتراك</span>
      </label>
      <div className="admin-grid-2">
        <label className="field">
          <span>نص حقل البريد (placeholder)</span>
          <input
            value={form.preFooterNewsletterPlaceholder}
            onChange={(e) => patch('preFooterNewsletterPlaceholder', e.target.value)}
          />
        </label>
        <label className="field">
          <span>نص الزر</span>
          <input
            value={form.preFooterNewsletterButtonLabel}
            onChange={(e) => patch('preFooterNewsletterButtonLabel', e.target.value)}
          />
        </label>
      </div>

      <h2 className="admin-subtitle">فوتر المتجر (روابط)</h2>
      <p className="admin-muted">
        على الهاتف تظهر كقوائم قابلة للطي؛ على الشاشة العريضة عمودان بجانب «اتصال» و«العلامة».
        استخدم روابط نسبية للصفحات الداخلية مثل /checkout
      </p>
      {form.footerNavGroups.map((g, gi) => (
        <div key={`fg-${gi}`} className="admin-card">
          <div className="admin-section-editor-head">
            <strong>مجموعة {gi + 1}</strong>
            <button type="button" className="link-btn" onClick={() => removeFooterGroup(gi)}>
              حذف المجموعة
            </button>
          </div>
          <label className="field">
            <span>عنوان المجموعة (مثلاً المتجر)</span>
            <input
              value={g.title}
              onChange={(e) => updateFooterGroupTitle(gi, e.target.value)}
            />
          </label>
          {g.links.map((l, li) => (
            <div key={`${gi}-${li}`} className="admin-grid-2">
              <label className="field">
                <span>نص الرابط</span>
                <input
                  value={l.label}
                  onChange={(e) => updateFooterLink(gi, li, { label: e.target.value })}
                />
              </label>
              <label className="field">
                <span>الوجهة ( /track أو https://… )</span>
                <input
                  value={l.href}
                  onChange={(e) => updateFooterLink(gi, li, { href: e.target.value })}
                />
              </label>
              <div className="admin-section-editor-actions" style={{ gridColumn: '1 / -1' }}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => removeFooterLink(gi, li)}
                  disabled={g.links.length < 2}
                >
                  حذف الرابط
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-block" onClick={() => addFooterLink(gi)}>
            + رابط في هذه المجموعة
          </button>
        </div>
      ))}
      {form.footerNavGroups.length < 4 ? (
        <button type="button" className="btn btn-ghost btn-block" onClick={addFooterGroup}>
          + مجموعة روابط جديدة
        </button>
      ) : null}
        </>
      ) : null}

      {storefrontTab === 'product' ? (
        <>
          <h2 className="admin-subtitle">صفحة تفاصيل المنتج</h2>
          <p className="admin-muted">
            حدّد ما يظهر في صفحة العطر، ومكان زر «أضف إلى السلة»: بشكل طبيعي تحت «مستوحى من»، أو
            شريطاً عائماً أسفل الشاشة.
          </p>
          <label className="field">
            <span>وضع زر إضافة للسلة</span>
            <select
              value={form.uiProduct.addToCartMode}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  uiProduct: {
                    ...s.uiProduct,
                    addToCartMode: e.target.value as 'after_inspired' | 'sticky_bottom',
                  },
                }))
              }
            >
              <option value="after_inspired">داخل الصفحة — تحت «مستوحى من» (مُستحسن)</option>
              <option value="sticky_bottom">شريط سفلي عائم</option>
            </select>
          </label>
          <div className="admin-card admin-grid-2">
            {(
              [
                ['showToolbar', 'شريط الرجوع والرئيسية'],
                ['showGallery', 'معرض الصور'],
                ['showRatingRow', 'صف النجوم والتلميح'],
                ['showCategoryBadge', 'شارة الفئة'],
                ['showInspiredBlock', 'قسم مستوحى من'],
                ['showStockUrgency', 'فقرة المخزون والتوصيل'],
                ['showDescription', 'وصف المنتج'],
                ['showLongevityBanner', 'بانر الثبات (12h)'],
                ['showTrustBlocks', 'بطاقتا الثقة'],
                ['showAccordions', 'أكورديون التوصيل ومعلومات إضافية'],
                ['showTestimonials', 'شهادات العملاء'],
                ['showReviewsBlock', 'كتلة آراء العملاء'],
                ['showWhyBlock', 'قسم «لماذا المتجر»'],
                ['showSiteFooter', 'فوتر الموقع في الصفحة'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="field admin-checkbox-field">
                <input
                  type="checkbox"
                  checked={form.uiProduct[key]}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      uiProduct: { ...s.uiProduct, [key]: e.target.checked },
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <h3 className="admin-subtitle">نصوص صفحة المنتج</h3>
          <div className="admin-card">
            <label className="field">
              <span>زر الإضافة للسلة</span>
              <input
                value={form.uiProduct.copy.addToCart}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiProduct: {
                      ...s.uiProduct,
                      copy: { ...s.uiProduct.copy, addToCart: e.target.value },
                    },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>عنوان «مستوحى من»</span>
              <input
                value={form.uiProduct.copy.inspiredTitle}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiProduct: {
                      ...s.uiProduct,
                      copy: { ...s.uiProduct.copy, inspiredTitle: e.target.value },
                    },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>تنبيه أسفل «مستوحى من»</span>
              <textarea
                rows={2}
                value={form.uiProduct.copy.inspiredDisclaimer}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiProduct: {
                      ...s.uiProduct,
                      copy: { ...s.uiProduct.copy, inspiredDisclaimer: e.target.value },
                    },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>نقاط التوصيل (سطر لكل نقطة)</span>
              <textarea
                rows={4}
                value={form.uiProduct.copy.accordionShipBullets}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiProduct: {
                      ...s.uiProduct,
                      copy: { ...s.uiProduct.copy, accordionShipBullets: e.target.value },
                    },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>نص تذييل «لماذا المتجر» (بعد اسم المتجر يُضاف تلقائياً لاحقة العنوان)</span>
              <input
                value={form.uiProduct.copy.whyTitleSuffix}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiProduct: {
                      ...s.uiProduct,
                      copy: { ...s.uiProduct.copy, whyTitleSuffix: e.target.value },
                    },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>وصف قسم «لماذا المتجر»</span>
              <textarea
                rows={2}
                value={form.uiProduct.copy.whyBody}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiProduct: {
                      ...s.uiProduct,
                      copy: { ...s.uiProduct.copy, whyBody: e.target.value },
                    },
                  }))
                }
              />
            </label>
          </div>
        </>
      ) : null}

      {storefrontTab === 'cartflow' ? (
        <>
          <h2 className="admin-subtitle">سلة المشتريات</h2>
          <div className="admin-card admin-grid-2">
            <label className="field">
              <span>عنوان اللوحة</span>
              <input
                value={form.uiCart.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, uiCart: { ...s.uiCart, title: e.target.value } }))
                }
              />
            </label>
            <label className="field">
              <span>رسالة السلة الفارغة</span>
              <input
                value={form.uiCart.emptyMessage}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiCart: { ...s.uiCart, emptyMessage: e.target.value },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>زر إتمام الطلب</span>
              <input
                value={form.uiCart.checkoutLabel}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiCart: { ...s.uiCart, checkoutLabel: e.target.value },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>تسمية المجموع</span>
              <input
                value={form.uiCart.totalLabel}
                onChange={(e) =>
                  setForm((s) => ({ ...s, uiCart: { ...s.uiCart, totalLabel: e.target.value } }))
                }
              />
            </label>
          </div>

          <h2 className="admin-subtitle">إتمام الطلب</h2>
          <div className="admin-card">
            <label className="field">
              <span>عنوان الصفحة</span>
              <input
                value={form.uiCheckout.pageTitle}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiCheckout: { ...s.uiCheckout, pageTitle: e.target.value },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>مقدمة تحت العنوان</span>
              <textarea
                rows={2}
                value={form.uiCheckout.leadText}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiCheckout: { ...s.uiCheckout, leadText: e.target.value },
                  }))
                }
              />
            </label>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiCheckout.showExtraNotes}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiCheckout: { ...s.uiCheckout, showExtraNotes: e.target.checked },
                  }))
                }
              />
              <span>إظهار حقل الملاحظات الإضافية</span>
            </label>
            <label className="field">
              <span>نص زر التأكيد</span>
              <input
                value={form.uiCheckout.submitLabel}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiCheckout: { ...s.uiCheckout, submitLabel: e.target.value },
                  }))
                }
              />
            </label>
          </div>

          <h2 className="admin-subtitle">صفحة بعد تأكيد الطلب</h2>
          <div className="admin-card">
            <label className="field">
              <span>عنوان فرعي (فوق العنوان)</span>
              <input
                value={form.uiOrderSuccess.eyebrow}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiOrderSuccess: { ...s.uiOrderSuccess, eyebrow: e.target.value },
                  }))
                }
              />
            </label>
            <label className="field">
              <span>العنوان الرئيسي</span>
              <input
                value={form.uiOrderSuccess.title}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiOrderSuccess: { ...s.uiOrderSuccess, title: e.target.value },
                  }))
                }
              />
            </label>
            <label className="field admin-checkbox-field">
              <input
                type="checkbox"
                checked={form.uiOrderSuccess.showLinesDetail}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiOrderSuccess: { ...s.uiOrderSuccess, showLinesDetail: e.target.checked },
                  }))
                }
              />
              <span>إظهار قائمة المنتجات والأسعار</span>
            </label>
            <label className="field">
              <span>نص قبل رابط التتبع (بدون تكرار اسم الرابط)</span>
              <textarea
                rows={2}
                value={form.uiOrderSuccess.footerLead}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    uiOrderSuccess: { ...s.uiOrderSuccess, footerLead: e.target.value },
                  }))
                }
              />
            </label>
          </div>

          <h2 className="admin-subtitle">تتبع الطلب</h2>
          <div className="admin-card">
            <label className="field">
              <span>عنوان الصفحة</span>
              <input
                value={form.uiTrack.pageTitle}
                onChange={(e) =>
                  setForm((s) => ({ ...s, uiTrack: { ...s.uiTrack, pageTitle: e.target.value } }))
                }
              />
            </label>
            <label className="field">
              <span>المقدمة</span>
              <textarea
                rows={2}
                value={form.uiTrack.leadText}
                onChange={(e) =>
                  setForm((s) => ({ ...s, uiTrack: { ...s.uiTrack, leadText: e.target.value } }))
                }
              />
            </label>
          </div>
        </>
      ) : null}

      {storefrontTab === 'promos' ? (
        <>
          <h2 className="admin-subtitle">شرائط وبطاقات ترويجية</h2>
          <p className="admin-muted">
            أضف شريطاً متحركاً (marquee)، بانراً نصياً، أو بطاقة بصورة. اختر المكان من القائمة — لا
            حاجة لبرمجة. يمكنك إضافة عدة عناصر وترتيبها برقم الترتيب.
          </p>
          {form.promoSlots.map((slot, index) => (
            <div key={slot.id} className="admin-card">
              <div className="admin-section-editor-head">
                <strong>عنصر {index + 1}</strong>
                <button type="button" className="link-btn" onClick={() => removePromo(index)}>
                  حذف
                </button>
              </div>
              <div className="admin-grid-2">
                <label className="field admin-checkbox-field">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={(e) => updatePromo(index, { enabled: e.target.checked })}
                  />
                  <span>مفعّل</span>
                </label>
                <label className="field">
                  <span>النوع</span>
                  <select
                    value={slot.kind}
                    onChange={(e) =>
                      updatePromo(index, { kind: e.target.value as StorefrontPromoKind })
                    }
                  >
                    <option value="marquee">شريط متحرك</option>
                    <option value="banner">بانر / نص</option>
                    <option value="card">بطاقة (صورة + نص)</option>
                  </select>
                </label>
                <label className="field">
                  <span>المكان</span>
                  <select
                    value={slot.placement}
                    onChange={(e) =>
                      updatePromo(index, {
                        placement: e.target.value as StorefrontPromoPlacement,
                      })
                    }
                  >
                    {PROMO_PLACE_LABELS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>ترتيب العرض (رقم أصغر يظهر أولاً)</span>
                  <input
                    type="number"
                    value={slot.sortOrder}
                    onChange={(e) =>
                      updatePromo(index, { sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </label>
              </div>
              <label className="field">
                <span>عنوان (للشريط المتحرك: يُعرض إن وُجد وإلا النص)</span>
                <input
                  value={slot.title}
                  onChange={(e) => updatePromo(index, { title: e.target.value })}
                />
              </label>
              <label className="field">
                <span>نص / محتوى</span>
                <textarea
                  rows={2}
                  value={slot.body}
                  onChange={(e) => updatePromo(index, { body: e.target.value })}
                />
              </label>
              <AdminImageUploadField
                label="صورة (لبطاقة أو بانر بصورة)"
                value={slot.imageUrl}
                onChange={(url) => updatePromo(index, { imageUrl: url })}
                aspect={slot.kind === 'card' ? 1 : 16 / 9}
              />
              <label className="field">
                <span>رابط عند النقر (اختياري)</span>
                <input
                  value={slot.linkUrl}
                  onChange={(e) => updatePromo(index, { linkUrl: e.target.value })}
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() =>
              setForm((s) => {
                const n = s.promoSlots.length
                const next: StorefrontPromoSlot = {
                  id: `promo-${Date.now()}`,
                  enabled: true,
                  placement: 'home_after_hero',
                  kind: 'banner',
                  title: '',
                  body: '',
                  imageUrl: '',
                  linkUrl: '',
                  sortOrder: n,
                }
                return { ...s, promoSlots: [...s.promoSlots, next] }
              })
            }
          >
            + إضافة شريط أو بطاقة
          </button>
        </>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="checkout-lead">تم حفظ واجهة المتجر. حدّث صفحة المتجر لمعاينة التغييرات.</p> : null}
      <button type="submit" className="btn btn-primary btn-block">
        حفظ واجهة المتجر
      </button>
    </form>
  )
}
