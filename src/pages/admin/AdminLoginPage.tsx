import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, setAdminToken } from '../../api/client'
import { ADMIN_PANEL_BASE_PATH } from '../../adminRoute'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await apiJson<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      setAdminToken(data.token)
      navigate(ADMIN_PANEL_BASE_PATH, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="checkout admin-login">
      <div className="admin-login-card">
        <h1 className="checkout-title">دخول المالك</h1>
        <p className="checkout-lead">
          واجهة إدارة المنفصلة عن{' '}
          <Link to="/" className="inline-link">
            متجر الزبائن
          </Link>
          . لا يظهر هذا الدخول للزوار.
        </p>
        <p className="admin-login-hint">
          عنوان هذه الصفحة غير معروض في المتجر — احفظه في مكان آمن. كلمة المرور من ملف{' '}
          <code className="admin-code">.env</code> تحت <code className="admin-code">ADMIN_PASSWORD</code>
          . للتطوير المحلي قد تكون <strong>horus-admin</strong> — غيّرها قبل الإنتاج.
        </p>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>كلمة المرور</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'جاري التحقق…' : 'دخول لوحة التحكم'}
          </button>
        </form>
      </div>
    </main>
  )
}
