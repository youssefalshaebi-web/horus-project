import { useRef, useState } from 'react'
import { apiJson, getAdminToken } from '../../api/client'
import { apiUrl } from '../../config'
import type { HomeVideoSettings, PublicSiteSettings } from '../../types'
import { mergePublicSiteSettings } from '../../utils/siteSettingsMerge'

type Props = {
  homeVideo: HomeVideoSettings
  onPatch: (partial: Partial<HomeVideoSettings>) => void
  onSettingsMerged: (settings: PublicSiteSettings) => void
}

function uploadVideoWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', apiUrl('/api/admin/upload/video'))
    const token = getAdminToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.min(100, Math.round((100 * e.loaded) / e.total)))
      }
    }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}') as { url?: string; error?: string }
        if (xhr.status >= 200 && xhr.status < 300 && typeof data.url === 'string') {
          resolve({ url: data.url })
        } else {
          reject(new Error(data.error || xhr.statusText || 'فشل الرفع'))
        }
      } catch {
        reject(new Error('استجابة غير متوقعة من الخادم'))
      }
    }
    xhr.onerror = () => reject(new Error('تعذّر الاتصال أثناء الرفع'))
    const fd = new FormData()
    fd.append('file', file)
    xhr.send(fd)
  })
}

export function AdminVideoSettings({ homeVideo, onPatch, onSettingsMerged }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  function clearNotices() {
    setError(null)
    setSaved(false)
    setUploadNotice(null)
  }

  async function handleSaveClick() {
    setSaving(true)
    setSaved(false)
    setError(null)
    setUploadNotice(null)
    try {
      const d = await apiJson<PublicSiteSettings>('/api/admin/settings/video', {
        method: 'PATCH',
        body: JSON.stringify({
          enabled: homeVideo.enabled,
          url: homeVideo.url,
          posterUrl: homeVideo.posterUrl ?? '',
        }),
      })
      onSettingsMerged(mergePublicSiteSettings(d))
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const name = file.name.toLowerCase()
    if (!name.endsWith('.mp4') && !name.endsWith('.webm')) {
      setSaved(false)
      setUploadNotice(null)
      setError('الملف يجب أن يكون بصيغة mp4 أو webm')
      return
    }
    setError(null)
    setSaved(false)
    setUploadNotice(null)
    setUploadPct(0)
    setUploading(true)
    try {
      const { url } = await uploadVideoWithProgress(file, setUploadPct)
      onPatch({ url })
      setUploadPct(100)
      setUploadNotice('تم رفع الفيديو وتحديث الحقل أعلاه. اضغط «حفظ إعدادات الفيديو» ليتم عرضه للزوار.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الرفع')
      setUploadPct(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-card admin-video-settings">
      <h2 className="admin-subtitle" style={{ marginTop: 0 }}>
        فيديو الرئيسية
      </h2>
      <p className="checkout-lead">
        فيديو صامت يُعرض أسفل أقسام المنتجات في الصفحة الرئيسية فقط. بعد الرفع يُحفظ الملف ضمن{' '}
        <code className="admin-code">/uploads/</code> — اضغط «حفظ إعدادات الفيديو» لتثبيت القيم على
        الخادم.
      </p>

      <label className="field">
        <span>تفعيل عرض الفيديو</span>
        <div className="admin-news-checkbox-row">
          <input
            id="home-video-enabled"
            type="checkbox"
            checked={homeVideo.enabled}
            onChange={(e) => {
              clearNotices()
              onPatch({ enabled: e.target.checked })
            }}
          />
          <label htmlFor="home-video-enabled" className="admin-muted" style={{ margin: 0, cursor: 'pointer' }}>
            إظهار قسم الفيديو في الرئيسية
          </label>
        </div>
      </label>

      <label className="field">
        <span>رابط الفيديو (مسار نسبي أو رابط كامل)</span>
        <input
          dir="ltr"
          spellCheck={false}
          value={homeVideo.url}
          onChange={(e) => {
            clearNotices()
            onPatch({ url: e.target.value })
          }}
          placeholder="/uploads/… أو https://…"
        />
      </label>

      <label className="field">
        <span>صورة ملصقة (poster) — اختياري</span>
        <input
          dir="ltr"
          spellCheck={false}
          value={homeVideo.posterUrl ?? ''}
          onChange={(e) => {
            clearNotices()
            onPatch({ posterUrl: e.target.value })
          }}
          placeholder="/uploads/… أو رابط صورة"
        />
      </label>

      <div className="field">
        <span>رفع فيديو جديد (حتى 100 ميجابايت — mp4 أو webm)</span>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,.mp4,.webm"
          hidden
          onChange={(e) => void onFilePick(e)}
        />
        <button
          type="button"
          className="btn btn-ghost"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'جاري الرفع…' : 'اختر ملف فيديو'}
        </button>
        {uploadPct !== null ? (
          <div className="admin-video-upload-progress" aria-hidden>
            <div className="admin-video-upload-progress-bar" style={{ width: `${uploadPct}%` }} />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="admin-feedback admin-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
      {uploadNotice ? (
        <p className="admin-feedback admin-feedback--success" role="status">
          {uploadNotice}
        </p>
      ) : null}
      {saved ? (
        <p className="admin-feedback admin-feedback--success" role="status">
          تم حفظ إعدادات الفيديو على الخادم بنجاح.
        </p>
      ) : null}

      <button type="button" className="btn btn-primary btn-block" disabled={saving} onClick={() => void handleSaveClick()}>
        {saving ? 'جاري الحفظ…' : 'حفظ إعدادات الفيديو'}
      </button>
    </div>
  )
}
