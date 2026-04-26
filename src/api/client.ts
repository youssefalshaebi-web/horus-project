import { apiUrl, getApiBaseUrl } from '../config'

const ADMIN_KEY = 'horus_admin_token'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_KEY)
}

export function setAdminToken(token: string | null) {
  if (token) sessionStorage.setItem(ADMIN_KEY, token)
  else sessionStorage.removeItem(ADMIN_KEY)
}

type ApiError = { error?: string }

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getAdminToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const r = await fetch(apiUrl(path), { ...init, headers })
  const text = await r.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!r.ok) {
    if (r.status === 502 || r.status === 503) {
      throw new Error(
        'تعذر الاتصال بسيرفر المتجر (Bad Gateway). شغّل من مجلد المشروع: npm run dev — يجب أن يعمل سيرفر الـ API على المنفذ المعرّف في .env (مثلاً 3001) مع واجهة Vite.',
      )
    }
    const msg =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as ApiError).error || r.statusText)
        : r.statusText
    throw new Error(msg)
  }
  return data as T
}

type UploadRes = { url: string }

/** رفع صورة للمسار العام /uploads/… (يتطلب تسجيل دخول المشرف) */
export async function apiUploadImage(file: Blob, filename = 'upload.jpg'): Promise<UploadRes> {
  const fd = new FormData()
  fd.append('file', file, filename)
  const headers = new Headers()
  const token = getAdminToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const r = await fetch(apiUrl('/api/admin/upload'), { method: 'POST', body: fd, headers })
  const text = await r.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!r.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error?: string }).error || r.statusText)
        : r.statusText
    throw new Error(msg)
  }
  if (typeof data === 'object' && data !== null && 'url' in data && typeof (data as UploadRes).url === 'string') {
    const base = getApiBaseUrl()
    let url = (data as UploadRes).url
    if (base && url.startsWith('/')) {
      url = `${base}${url}`
    }
    return { url }
  }
  throw new Error('استجابة غير متوقعة من الخادم')
}
