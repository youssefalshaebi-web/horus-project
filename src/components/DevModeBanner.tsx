/**
 * يظهر فقط عند تشغيل `npm run dev` — لا يُضمَّن في بناء الإنتاج.
 */
export function DevModeBanner() {
  if (!import.meta.env.DEV) return null

  return (
    <div className="dev-mode-banner" role="status" aria-live="polite">
      <span className="dev-mode-banner-badge">تطوير</span>
      <p className="dev-mode-banner-text">
        واجهة التطوير: Vite يوجّه <code className="dev-mode-banner-code">/api</code> و
        <code className="dev-mode-banner-code">/uploads</code> إلى السيرفر المحلي (افتراضياً
        المنفذ من <code className="dev-mode-banner-code">PORT</code> في البيئة، غالباً 3001).
        غيّر الصفحة أو أعد التحميل بعد تعديل الكود أو بيانات المتجر.
      </p>
    </div>
  )
}
