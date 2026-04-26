import { useCallback, useId, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { apiUploadImage } from '../../api/client'
import { getCroppedImageBlob } from '../../utils/cropImage'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  /** عرض÷ارتفاع منطقة القص (مثال: 16/9 للهيرو، 1 للشعار، 4/5 لصورة منتج) */
  aspect: number
  hint?: string
}

export function AdminImageUploadField({ label, value, onChange, aspect, hint }: Props) {
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setCroppedAreaPixels(areaPx)
  }, [])

  function closeModal() {
    setOpen(false)
    setImgSrc((s) => {
      if (s?.startsWith('blob:')) URL.revokeObjectURL(s)
      return null
    })
    setCroppedAreaPixels(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setErr(null)
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f || !/^image\//.test(f.type)) {
      setErr('اختر ملف صورة')
      return
    }
    setErr(null)
    const url = URL.createObjectURL(f)
    setImgSrc(url)
    setOpen(true)
  }

  async function confirmCrop() {
    if (!imgSrc || !croppedAreaPixels) return
    setBusy(true)
    setErr(null)
    try {
      const blob = await getCroppedImageBlob(imgSrc, croppedAreaPixels)
      const { url } = await apiUploadImage(blob, 'image.jpg')
      onChange(url)
      closeModal()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'فشل الرفع')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-image-field">
      <div className="field">
        <span>{label}</span>
        <div className="admin-image-field-row">
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… أو ارفع صورة"
            dir="ltr"
          />
          <label className="btn btn-ghost admin-image-upload-btn">
            رفع وتقطيع
            <input type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
          </label>
        </div>
        {hint ? <span className="admin-muted admin-image-hint">{hint}</span> : null}
        {err ? <span className="form-error admin-image-err">{err}</span> : null}
      </div>

      {open && imgSrc ? (
        <>
          <button
            type="button"
            className="admin-crop-scrim"
            aria-label="إغلاق"
            onClick={closeModal}
          />
          <div className="admin-crop-modal" role="dialog" aria-modal="true" aria-label="قص الصورة">
            <div className="admin-crop-stage">
              <Cropper
                image={imgSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <label className="admin-crop-zoom">
              تكبير
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <div className="admin-crop-actions">
              <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={busy}>
                إلغاء
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void confirmCrop()} disabled={busy}>
                {busy ? 'جاري الرفع…' : 'تأكيد ورفع'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
