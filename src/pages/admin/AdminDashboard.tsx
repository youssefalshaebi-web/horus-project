import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, setAdminToken } from '../../api/client'
import { AdminImageUploadField } from '../../components/admin/AdminImageUploadField'
import { defaultPublicSiteSettings } from '../../siteDefaults'
import { applySiteThemeToDocument } from '../../siteThemeDefaults'
import { mergePublicSiteSettings } from '../../utils/siteSettingsMerge'
import type { Product, PublicOrder, PublicSiteSettings } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { ADMIN_PANEL_LOGIN_PATH } from '../../adminRoute'
import { AdminStorefront } from './AdminStorefront'

type OrderRow = PublicOrder & { id: string }

type Tab = 'overview' | 'orders' | 'products' | 'storefront' | 'settings'

type AdminStats = {
  orderCount: number
  pendingOrders: number
  productCount: number
  revenueTotal: number
}

function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await apiJson<AdminStats>('/api/admin/stats')
      setStats(d)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر التحميل')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي من API
    void load()
  }, [load])

  if (error && !stats) {
    return <p className="form-error">{error}</p>
  }

  return (
    <div className="admin-overview">
      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => void load()}>
          تحديث الأرقام
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {stats ? (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">إجمالي الطلبات</span>
            <strong className="admin-stat-value">{stats.orderCount}</strong>
          </div>
          <div className="admin-stat-card admin-stat-accent">
            <span className="admin-stat-label">قيد المراجعة</span>
            <strong className="admin-stat-value">{stats.pendingOrders}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">المنتجات في المتجر</span>
            <strong className="admin-stat-value">{stats.productCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">إجمالي المبيعات (غير الملغاة)</span>
            <strong className="admin-stat-value">{formatPrice(stats.revenueTotal)}</strong>
          </div>
        </div>
      ) : (
        <p className="checkout-lead">جاري التحميل…</p>
      )}

      <section className="admin-card admin-guide" aria-labelledby="admin-guide-title">
        <h2 id="admin-guide-title" className="admin-guide-title">
          دليل سريع للمالك
        </h2>
        <ul className="admin-guide-list">
          <li>
            <strong>الطلبات:</strong> راجع الطلبات، غيّر الحالة، وأضف رقم التتبع للعميل. عند
            وضع الطلب كـ «ملغى» يُعاد المخزون تلقائياً إن كان المنتج بكمية محددة.
          </li>
          <li>
            <strong>المنتجات:</strong> أضف أو عدّل أو احذف. اترك حقل «المخزون» فارغاً لعدم
            تتبع الكمية؛ أو ضع رقماً ليُخصم عند كل طلب ويظهر للزبون حد أقصى في السلة.
          </li>
          <li>
            <strong>واجهة المتجر:</strong> أقسام ديناميكية، صور البلاطات والبانرات، الهيرو، الشعار،
            ومربعات «لماذا نحن».
          </li>
          <li>
            <strong>الإعدادات:</strong> اسم المتجر، واتساب، والفوتر.
          </li>
          <li>
            <strong>كلمة السر:</strong> تُضبط في ملف <code className="admin-code">.env</code>{' '}
            (المفتاح <code className="admin-code">ADMIN_PASSWORD</code>) ثم أعد تشغيل السيرفر.
          </li>
        </ul>
      </section>
    </div>
  )
}

const FALLBACK_PRODUCT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'عام / الكل' },
  { value: 'womens', label: 'نسائية (womens)' },
  { value: 'mens', label: 'رجالية (mens)' },
  { value: 'offers', label: 'عروض (offers)' },
]

const STATUS_OPTIONS: { value: PublicOrder['status']; label: string }[] = [
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'cancelled', label: 'ملغى' },
]

function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await apiJson<{ orders: OrderRow[] }>('/api/admin/orders')
      setOrders(d.orders)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل الطلبات')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي من API
    void load()
  }, [load])

  async function saveOrder(
    id: string,
    status: PublicOrder['status'],
    trackingNumber: string,
  ) {
    setSavingId(id)
    try {
      await apiJson(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber.trim() || null,
        }),
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSavingId(null)
    }
  }

  if (error && orders.length === 0) {
    return <p className="form-error">{error}</p>
  }

  return (
    <div className="admin-orders">
      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => void load()}>
          تحديث القائمة
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {orders.length === 0 ? (
        <p className="checkout-lead">لا توجد طلبات بعد.</p>
      ) : (
        orders.map((o) => (
          <OrderAdminCard
            key={`${o.id}-${o.status}-${o.trackingNumber ?? ''}`}
            order={o}
            saving={savingId === o.id}
            onSave={saveOrder}
          />
        ))
      )}
    </div>
  )
}

function OrderAdminCard({
  order,
  saving,
  onSave,
}: {
  order: OrderRow
  saving: boolean
  onSave: (id: string, status: PublicOrder['status'], tracking: string) => void
}) {
  const [status, setStatus] = useState(order.status)
  const [tracking, setTracking] = useState(order.trackingNumber || '')

  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <strong className="order-code">{order.publicCode}</strong>
        <span className="admin-muted">
          {new Date(order.createdAt).toLocaleString('ar-SA')}
        </span>
      </div>
      <p className="admin-mini">
        {order.customerName} — {order.phone} — {order.city}
      </p>
      <p className="admin-mini">{order.address}</p>
      <ul className="order-lines-list compact">
        {order.lines.map((l) => (
          <li key={`${l.productId}-${l.quantity}`} className="order-line-item">
            <span>
              {l.name} × {l.quantity}
            </span>
            <span>{formatPrice(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <p className="admin-total">المجموع: {formatPrice(order.total)}</p>
      <div className="admin-grid-2">
        <label className="field">
          <span>حالة الطلب</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PublicOrder['status'])}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>رقم التتبع</span>
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="يظهر للعميل بعد الحفظ"
          />
        </label>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={saving}
        onClick={() => onSave(order.id, status, tracking)}
      >
        {saving ? 'جاري الحفظ…' : 'حفظ التحديث'}
      </button>
    </article>
  )
}

function parseImagesExtraBody(raw: string): string[] | null {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.length ? lines : null
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categoryChoices, setCategoryChoices] =
    useState<{ value: string; label: string }[]>(FALLBACK_PRODUCT_CATEGORIES)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editId, setEditId] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    image: '',
    category: 'all',
    inspiredNote: '',
    inspiredImage: '',
    imagesExtra: '',
    stock: '',
  })
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    image: '',
    category: 'all',
    inspiredNote: '',
    inspiredImage: '',
    imagesExtra: '',
    stock: '',
  })

  const load = useCallback(async () => {
    try {
      const [d, st] = await Promise.all([
        apiJson<{ products: Product[] }>('/api/admin/products'),
        apiJson<PublicSiteSettings>('/api/admin/settings'),
      ])
      setProducts(d.products)
      const fromSections = st.homeSections
        .filter((s) => s.sectionType === 'category' && (s.categoryId || s.id))
        .map((s) => {
          const v = (s.categoryId || s.id).trim()
          return { value: v, label: `${s.sectionTitle} (${v})` }
        })
      const seen = new Set<string>()
      const merged: { value: string; label: string }[] = [{ value: 'all', label: 'عام / الكل' }]
      for (const o of fromSections) {
        if (!o.value || seen.has(o.value)) continue
        seen.add(o.value)
        merged.push(o)
      }
      merged.push({ value: 'offers', label: 'عروض (فئة offers)' })
      setCategoryChoices(merged)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل المنتجات')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي من API
    void load()
  }, [load])

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await apiJson('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          id: form.id.trim(),
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          compareAtPrice:
            form.compareAtPrice.trim() === '' ? null : Number(form.compareAtPrice),
          image: form.image.trim(),
          category: form.category,
          inspiredNote: form.inspiredNote.trim() || null,
          inspiredImage: form.inspiredImage.trim() || null,
          images: parseImagesExtraBody(form.imagesExtra),
          stockQuantity: form.stock.trim() === '' ? null : Number(form.stock),
        }),
      })
      setForm({
        id: '',
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        image: '',
        category: 'all',
        inspiredNote: '',
        inspiredImage: '',
        imagesExtra: '',
        stock: '',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الإضافة')
    } finally {
      setBusy(false)
    }
  }

  async function removeProduct(id: string) {
    if (!window.confirm('حذف هذا المنتج؟')) return
    setBusy(true)
    try {
      await apiJson(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (editId === id) {
        setEditId('')
        setEditForm({
          name: '',
          description: '',
          price: '',
          compareAtPrice: '',
          image: '',
          category: 'all',
          inspiredNote: '',
          inspiredImage: '',
          imagesExtra: '',
          stock: '',
        })
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحذف')
    } finally {
      setBusy(false)
    }
  }

  function onPickEdit(id: string) {
    setEditId(id)
    const p = products.find((x) => x.id === id)
    if (!p) return
    setEditForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      compareAtPrice:
        p.compareAtPrice != null && p.compareAtPrice > 0 ? String(p.compareAtPrice) : '',
      image: p.image,
      category: p.category || 'all',
      inspiredNote: p.inspiredNote ?? '',
      inspiredImage: p.inspiredImage ?? '',
      imagesExtra: Array.isArray(p.images) ? p.images.join('\n') : '',
      stock:
        p.stockQuantity != null && Number.isFinite(p.stockQuantity)
          ? String(p.stockQuantity)
          : '',
    })
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    setBusy(true)
    setError(null)
    try {
      await apiJson(`/api/admin/products/${encodeURIComponent(editId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          price: Number(editForm.price),
          compareAtPrice:
            editForm.compareAtPrice.trim() === '' ? null : Number(editForm.compareAtPrice),
          image: editForm.image.trim(),
          category: editForm.category,
          inspiredNote: editForm.inspiredNote.trim() || null,
          inspiredImage: editForm.inspiredImage.trim() || null,
          images: parseImagesExtraBody(editForm.imagesExtra),
          stockQuantity: editForm.stock.trim() === '' ? null : Number(editForm.stock),
        }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التحديث')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-products">
      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => void load()}>
          تحديث المنتجات
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>المعرّف</th>
            <th>الاسم</th>
            <th>الفئة</th>
            <th>السعر</th>
            <th>قبل التخفيض</th>
            <th>المخزون</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category || 'all'}</td>
              <td>{formatPrice(p.price)}</td>
              <td>
                {p.compareAtPrice != null && p.compareAtPrice > p.price
                  ? formatPrice(p.compareAtPrice)
                  : '—'}
              </td>
              <td>
                {p.stockQuantity != null && Number.isFinite(p.stockQuantity)
                  ? p.stockQuantity
                  : '—'}
              </td>
              <td>
                <button
                  type="button"
                  className="link-btn"
                  disabled={busy}
                  onClick={() => void removeProduct(p.id)}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="admin-subtitle">تعديل منتج</h2>
      <div className="admin-card">
        <label className="field">
          <span>اختر المنتج</span>
          <select
            value={editId}
            onChange={(e) => {
              const v = e.target.value
              if (!v) {
                setEditId('')
                return
              }
              onPickEdit(v)
            }}
          >
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </label>
        {editId ? (
          <form className="checkout-form admin-product-form" onSubmit={saveEdit}>
            <label className="field">
              <span>الاسم</span>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>الوصف</span>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>الفئة (تظهر في أقسام الصفحة الرئيسية)</span>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {categoryChoices.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>السعر</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>سعر قبل التخفيض (اختياري)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={editForm.compareAtPrice}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, compareAtPrice: e.target.value }))
                }
              />
            </label>
            <AdminImageUploadField
              label="صورة المنتج الرئيسية"
              value={editForm.image}
              onChange={(url) => setEditForm((f) => ({ ...f, image: url }))}
              aspect={4 / 5}
              hint="نسبة تقريبية لبطاقة المنتج؛ يمكنك لصق رابط أو رفع ملف من الجهاز."
            />
            <label className="field">
              <span>صور إضافية للمعرض (رابط لكل سطر، اختياري)</span>
              <textarea
                rows={3}
                value={editForm.imagesExtra}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, imagesExtra: e.target.value }))
                }
                placeholder="https://..."
              />
            </label>
            <label className="field">
              <span>المخزون (فارغ = لا حد؛ رقم = يُخصم عند الطلب ويُعاد عند إلغاء الطلب)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={editForm.stock}
                onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="مثال: 15"
              />
            </label>
            <label className="field">
              <span>نص الإلهام (اختياري، يظهر فوق اسم المنتج في البطاقة)</span>
              <input
                value={editForm.inspiredNote}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, inspiredNote: e.target.value }))
                }
                placeholder="مثال: مستوحى من…"
              />
            </label>
            <AdminImageUploadField
              label="صورة الإلهام (اختياري)"
              value={editForm.inspiredImage}
              onChange={(url) => setEditForm((f) => ({ ...f, inspiredImage: url }))}
              aspect={1}
              hint="صورة مربعة صغيرة بجانب «مستوحى من»."
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'جاري الحفظ…' : 'حفظ التعديلات'}
            </button>
          </form>
        ) : null}
      </div>

      <h2 className="admin-subtitle">إضافة منتج</h2>
      <form className="checkout-form admin-product-form" onSubmit={createProduct}>
        <label className="field">
          <span>معرّف فريد (لاتيني، بدون مسافات)</span>
          <input
            value={form.id}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            placeholder="مثال: new-perfume-1"
            required
          />
        </label>
        <label className="field">
          <span>الاسم</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span>الوصف</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>الفئة</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {categoryChoices.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>السعر الحالي</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span>سعر قبل التخفيض (اختياري)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.compareAtPrice}
            onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
            placeholder="لإظهار خط يتوسط السعر"
          />
        </label>
        <AdminImageUploadField
          label="صورة المنتج الرئيسية"
          value={form.image}
          onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          aspect={4 / 5}
          hint="نسبة تقريبية لبطاقة المنتج؛ رابط أو رفع من الجهاز."
        />
        <label className="field">
          <span>صور إضافية للمعرض (رابط لكل سطر، اختياري)</span>
          <textarea
            rows={3}
            value={form.imagesExtra}
            onChange={(e) => setForm((f) => ({ ...f, imagesExtra: e.target.value }))}
            placeholder="https://..."
          />
        </label>
        <label className="field">
          <span>المخزون (فارغ = لا حد)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            placeholder="مثال: 10"
          />
        </label>
        <label className="field">
          <span>نص الإلهام (اختياري)</span>
          <input
            value={form.inspiredNote}
            onChange={(e) => setForm((f) => ({ ...f, inspiredNote: e.target.value }))}
          />
        </label>
        <AdminImageUploadField
          label="صورة الإلهام (اختياري)"
          value={form.inspiredImage}
          onChange={(url) => setForm((f) => ({ ...f, inspiredImage: url }))}
          aspect={1}
        />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'جاري الإضافة…' : 'إضافة المنتج'}
        </button>
      </form>
    </div>
  )
}

function AdminSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultPublicSiteSettings())
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const d = await apiJson<PublicSiteSettings>('/api/admin/settings')
        setSettings(mergePublicSiteSettings(d))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'تعذر التحميل')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function patch<K extends keyof PublicSiteSettings>(key: K, value: PublicSiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    try {
      await apiJson('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          storeName: settings.storeName.trim(),
          whatsappPhoneE164: settings.whatsappPhoneE164.replace(/\D/g, ''),
          footerTagline: settings.footerTagline,
          footerEmail: settings.footerEmail,
          footerPhone: settings.footerPhone,
          footerCopyright: settings.footerCopyright,
        }),
      })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    }
  }

  if (loading) {
    return <p className="checkout-lead">جاري التحميل…</p>
  }

  return (
    <form className="checkout-form" onSubmit={handleSave}>
      <h2 className="admin-subtitle">عام</h2>
      <label className="field">
        <span>اسم المتجر (يظهر في الموقع ورسالة واتساب)</span>
        <input
          value={settings.storeName}
          onChange={(e) => patch('storeName', e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>رقم واتساب الطلبات (بدون +، مثال 9665xxxxxxxx)</span>
        <input
          value={settings.whatsappPhoneE164}
          onChange={(e) => patch('whatsappPhoneE164', e.target.value)}
          required
        />
      </label>
      <p className="admin-muted">
        شريط الإعلان، الهيرو، الأقسام والصور تُعدّل من تبويب «واجهة المتجر».
      </p>

      <h2 className="admin-subtitle">الفوتر</h2>
      <label className="field">
        <span>شعار/وصف قصير</span>
        <textarea
          rows={2}
          value={settings.footerTagline}
          onChange={(e) => patch('footerTagline', e.target.value)}
        />
      </label>
      <label className="field">
        <span>البريد (يظهر كرابط mailto إن وُجد)</span>
        <input
          type="email"
          value={settings.footerEmail}
          onChange={(e) => patch('footerEmail', e.target.value)}
        />
      </label>
      <label className="field">
        <span>الهاتف</span>
        <input
          value={settings.footerPhone}
          onChange={(e) => patch('footerPhone', e.target.value)}
        />
      </label>
      <label className="field">
        <span>سطر حقوق النشر</span>
        <input
          value={settings.footerCopyright}
          onChange={(e) => patch('footerCopyright', e.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="checkout-lead">تم الحفظ.</p> : null}
      <button type="submit" className="btn btn-primary btn-block">
        حفظ الإعدادات
      </button>
    </form>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await apiJson<PublicSiteSettings>('/api/admin/settings')
        if (!cancelled) applySiteThemeToDocument(mergePublicSiteSettings(d).siteTheme)
      } catch {
        /* لو فشل التحميل نُبقي مظهر الصفحة كما هو */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function logout() {
    setAdminToken(null)
    navigate(ADMIN_PANEL_LOGIN_PATH, { replace: true })
  }

  return (
    <div className="admin-app">
      <div className="admin-shell">
        <header className="admin-top">
          <div>
            <p className="admin-kicker">HORUS parfum</p>
            <h1 className="admin-title">لوحة تحكم المتجر</h1>
          </div>
          <div className="admin-top-actions">
            <Link to="/" className="btn btn-ghost">
              عرض واجهة الزبائن
            </Link>
            <button type="button" className="link-btn" onClick={logout}>
              خروج
            </button>
          </div>
        </header>

        <nav className="admin-tabs" aria-label="أقسام لوحة التحكم">
          <button
            type="button"
            className={tab === 'overview' ? 'active' : ''}
            onClick={() => setTab('overview')}
          >
            نظرة عامة
          </button>
          <button
            type="button"
            className={tab === 'orders' ? 'active' : ''}
            onClick={() => setTab('orders')}
          >
            الطلبات
          </button>
          <button
            type="button"
            className={tab === 'products' ? 'active' : ''}
            onClick={() => setTab('products')}
          >
            المنتجات
          </button>
          <button
            type="button"
            className={tab === 'storefront' ? 'active' : ''}
            onClick={() => setTab('storefront')}
          >
            واجهة المتجر
          </button>
          <button
            type="button"
            className={tab === 'settings' ? 'active' : ''}
            onClick={() => setTab('settings')}
          >
            الإعدادات
          </button>
        </nav>

        <div className="admin-panel-body">
          {tab === 'overview' ? <AdminOverview /> : null}
          {tab === 'orders' ? <AdminOrders /> : null}
          {tab === 'products' ? <AdminProducts /> : null}
          {tab === 'storefront' ? <AdminStorefront /> : null}
          {tab === 'settings' ? <AdminSettings /> : null}
        </div>
      </div>
    </div>
  )
}
