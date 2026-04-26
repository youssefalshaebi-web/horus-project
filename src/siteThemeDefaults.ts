import type { SiteTheme } from './types'

/** ألوان الواجهة — تُطبَّق كمتغيرات CSS على :root */
export const DEFAULT_SITE_THEME: SiteTheme = {
  bg: '#faf9f7',
  bgElevated: '#ffffff',
  surface: '#f2f1ed',
  text: '#1a1816',
  muted: '#5e5a54',
  accent: '#9a7209',
  accentHover: '#7d5e07',
  danger: '#c45c52',
  salePrice: '#b42318',
  ctaBg: '#9c4a3c',
  ctaBgHover: '#863d31',
  sectionUnderline: '#c01515',
  announcementBg: '#fff5f0',
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6 || !/^[0-9a-fA-F]+$/.test(h)) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbaFromHex(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(26,24,22,${alpha})`
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

/** تطبيق المظهر على الصفحة (متجر + لوحة تحكم تستخدم نفس الإعدادات عند التحميل) */
export function applySiteThemeToDocument(theme: Partial<SiteTheme> | undefined): void {
  const t = { ...DEFAULT_SITE_THEME, ...theme }
  const r = document.documentElement
  r.style.setProperty('--bg', t.bg)
  r.style.setProperty('--bg-elevated', t.bgElevated)
  r.style.setProperty('--surface', t.surface)
  r.style.setProperty('--text', t.text)
  r.style.setProperty('--muted', t.muted)
  r.style.setProperty('--accent', t.accent)
  r.style.setProperty('--accent-hover', t.accentHover)
  r.style.setProperty('--accent-dim', rgbaFromHex(t.accent, 0.12))
  r.style.setProperty('--danger', t.danger)
  r.style.setProperty('--sale-price', t.salePrice)
  r.style.setProperty('--cta-bg', t.ctaBg)
  r.style.setProperty('--cta-bg-hover', t.ctaBgHover)
  r.style.setProperty('--section-underline', t.sectionUnderline)
  r.style.setProperty('--announcement-bg', t.announcementBg)
  r.style.setProperty('--border', rgbaFromHex(t.text, 0.12))
  r.style.setProperty('--announcement-border', rgbaFromHex(t.sectionUnderline, 0.2))
}

export const SITE_THEME_LABELS: { key: keyof SiteTheme; label: string }[] = [
  { key: 'bg', label: 'خلفية الصفحة' },
  { key: 'bgElevated', label: 'خلفية البطاقات والطبقات' },
  { key: 'surface', label: 'سطح ثانوي (خلفيات خفيفة)' },
  { key: 'text', label: 'لون النص الأساسي' },
  { key: 'muted', label: 'نص ثانوي / توضيحات' },
  { key: 'accent', label: 'لون التمييز (روابط، تمييز)' },
  { key: 'accentHover', label: 'تمييز عند المرور' },
  { key: 'danger', label: 'تنبيه / خطأ' },
  { key: 'salePrice', label: 'سعر التخفيض' },
  { key: 'ctaBg', label: 'خلفية أزرار التنفيذ (سلة، تأكيد)' },
  { key: 'ctaBgHover', label: 'زر التنفيذ عند المرور' },
  { key: 'sectionUnderline', label: 'خط العناوين والشريط' },
  { key: 'announcementBg', label: 'خلفية شريط الإعلان' },
]
