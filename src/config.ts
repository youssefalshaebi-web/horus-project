/** عرض السعر في الواجهة — يطابق تنسيق رسالة الواتساب على السيرفر */
export const CURRENCY_LABEL = 'ر.س'

/**
 * عنوان الـ API بدون شرطة مائلة أخيرة.
 * فارغ في التطوير → نفس أصل Vite مع البروكسي لـ /api و /uploads.
 * في الإنتاج (Netlify + API على Render): VITE_API_BASE_URL=https://your-service.onrender.com
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || typeof raw !== 'string') return ''
  return raw.replace(/\/+$/, '').trim()
}

/** مسار مطلق للـ fetch (مثال: /api/settings → https://api.../api/settings عند تعيين القاعدة). */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}

/**
 * صور من السيرفر (/uploads/…) تحتاج نفس نطاق الـ API عندما الواجهة على نطاق آخر.
 * روابط https:// أو مسارات الموقع الثابتة تُعاد كما هي.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (url == null || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/uploads/')) {
    const base = getApiBaseUrl()
    return base ? `${base}${t}` : t
  }
  return t
}
