import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, setAdminToken } from '../../api/client'
import { AdminImageUploadField } from '../../components/admin/AdminImageUploadField'
import { defaultPublicSiteSettings } from '../../siteDefaults'
import { applySiteThemeToDocument } from '../../siteThemeDefaults'
import { mergePublicSiteSettings } from '../../utils/siteSettingsMerge'
import type { Product, PublicOrder, PublicSiteSettings, SiteSeoSettings } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { ADMIN_PANEL_LOGIN_PATH } from '../../adminRoute'
import { DEFAULT_PRODUCT_PRIMARY_IMAGE } from '../../constants/productMedia'
import { AdminStorefront } from './AdminStorefront'
import { AdminNews } from './AdminNews'

type OrderRow = PublicOrder & { id: string }

type Tab = 'overview' | 'orders' | 'products' | 'news' | 'storefront' | 'settings'

type AdminStats = {
  orderCount: number
  pendingOrders: number
  productCount: number
  revenueTotal: number
}

function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [alertData, setAlertData] = useState<{ products: Product[]; orders: OrderRow[] } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [st, pr, ord] = await Promise.all([
        apiJson<AdminStats>('/api/admin/stats'),
        apiJson<{ products: Product[] }>('/api/admin/products'),
        apiJson<{ orders: OrderRow[] }>('/api/admin/orders'),
      ])
      setStats(st)
      setAlertData({ products: pr.products, orders: ord.orders })
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر التحميل')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي من API
    void load()
  }, [load])

  const outOfStock =
    alertData?.products.filter((p) => p.stockQuantity === 0) ?? []
  const stalePending =
    alertData?.orders.filter(
      (o) =>
        o.status === 'pending' &&
        Date.now() - new Date(o.createdAt).getTime() > 24 * 60 * 60 * 1000,
    ) ?? []
  const defaultImageProducts =
    alertData?.products.filter((p) => {
      const img = (p.image || '').trim()
      return !img || img === DEFAULT_PRODUCT_PRIMARY_IMAGE
    }) ?? []
  const untaggedProducts =
    alertData?.products.filter((p) => !p.tags || p.tags.length === 0) ?? []

  if (error && !stats) {
    return <p className="form-error">{error}</p>
  }

  return (
    <div className="admin-overview">
      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => void load()}>
          تحديث الأرقام والتنبيهات
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

      <section className="admin-card" aria-labelledby="admin-alerts-title">
        <h2 id="admin-alerts-title" className="admin-subtitle">
          تنبيهات تحتاج انتباهك
        </h2>
        {!alertData ? (
          <p className="admin-muted">جاري تحميل البيانات…</p>
        ) : (
          <ul className="admin-guide-list admin-alerts-list">
            <li>
              <strong>نفاد المخزون (الكمية 0):</strong>{' '}
              {outOfStock.length === 0
                ? 'لا يوجد'
                : `${outOfStock.length} منتج — ${outOfStock
                    .slice(0, 5)
                    .map((p) => p.name)
                    .join('، ')}${outOfStock.length > 5 ? '…' : ''}`}
            </li>
            <li>
              <strong>طلبات قيد المراجعة أكثر من 24 ساعة:</strong>{' '}
              {stalePending.length === 0
                ? 'لا يوجد'
                : `${stalePending.length} طلب — ${stalePending
                    .slice(0, 5)
                    .map((o) => o.publicCode)
                    .join('، ')}${stalePending.length > 5 ? '…' : ''}`}
            </li>
            <li>
              <strong>منتجات بصورة افتراضية:</strong>{' '}
              {defaultImageProducts.length === 0
                ? 'لا يوجد'
                : `${defaultImageProducts.length} منتج — ${defaultImageProducts
                    .slice(0, 5)
                    .map((p) => p.name)
                    .join('، ')}${defaultImageProducts.length > 5 ? '…' : ''}`}
            </li>
            <li>
              <strong>منتجات بلا وسوم:</strong>{' '}
              {untaggedProducts.length === 0
                ? 'لا يوجد'
                : `${untaggedProducts.length} منتج — ${untaggedProducts
                    .slice(0, 5)
                    .map((p) => p.name)
                    .join('، ')}${untaggedProducts.length > 5 ? '…' : ''}`}
            </li>
          </ul>
        )}
      </section>

      <section className="admin-card admin-guide" aria-labelledby="admin-guide-title">
        <h2 id="admin-guide-title" className="admin-guide-title">
          دليل سريع للمالك
        </h2>
        <ul className="admin-guide-list">
          <li>
            <strong>الأخبار:</strong> أضف إعلانات ومنشورات تظهر في صفحة «الأخبار» للزوار.
            يمكن إخفاء أي خبر دون حذفه.
          </li>
          <li>
            <strong>الطلبات:</strong> راجع الطلبات، غيّر الحالة، وأضف رقم التتبع للعميل. عند
            وضع الطلب كـ «ملغى» يُعاد المخزون تلقائياً إن كان المنتج بكمية محددة.
          </li>
          <li>
            <strong>المنتجات:</strong> أضف أو عدّل أو احذف. صورة المنتج الرئيسية تبدأ تلقائياً
            بصورة عبوة HORUS الافتراضية ولا يمكن تركها فارغة — يمكنك استبدالها برفع صورة أو
            لصق رابط. اترك «المخزون» فارغاً لعدم تتبع الكمية؛ أو ضع رقماً ليُخصم عند الطلب.
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
  { value: 'gifts', label: 'مجموعات هدايا (gifts)' },
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
        {order.customerName} — {order.phone} — {order.email}
      </p>
      <p className="admin-mini">
        {order.country} — {order.city}
        {order.region ? ` — ${order.region}` : ''}
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

function tagsToFormField(tags: string[] | null | undefined): string {
  return Array.isArray(tags) && tags.length ? tags.join('\n') : ''
}

function parseTagsField(raw: string): string[] | null {
  const lines = raw
    .split(/[\n,،]/)
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean)
  const uniq = [...new Set(lines)]
  return uniq.length ? uniq.slice(0, 16) : null
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
    image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    category: 'all',
    inspiredNote: '',
    inspiredImage: '',
    imagesExtra: '',
    stock: '',
    tags: '',
  })
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
    category: 'all',
    inspiredNote: '',
    inspiredImage: '',
    imagesExtra: '',
    stock: '',
    tags: '',
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

  function duplicateToAddForm(p: Product) {
    const nid = window.prompt('معرّف المنتج الجديد (لاتيني)', `${p.id}-copy`)
    if (!nid?.trim()) return
    setForm({
      id: nid.trim().replace(/\s+/g, '-'),
      name: `${p.name} (نسخة)`,
      description: p.description,
      price: String(p.price),
      compareAtPrice:
        p.compareAtPrice != null && p.compareAtPrice > 0 ? String(p.compareAtPrice) : '',
      image: (p.image || '').trim() || DEFAULT_PRODUCT_PRIMARY_IMAGE,
      category: p.category || 'all',
      inspiredNote: p.inspiredNote?.trim() || '',
      inspiredImage: p.inspiredImage?.trim() || '',
      imagesExtra: Array.isArray(p.images) ? p.images.join('\n') : '',
      stock:
        p.stockQuantity != null && Number.isFinite(p.stockQuantity)
          ? String(p.stockQuantity)
          : '',
      tags: tagsToFormField(p.tags),
    })
    requestAnimationFrame(() =>
      document.getElementById('admin-add-product-anchor')?.scrollIntoView({ behavior: 'smooth' }),
    )
  }

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
          image: form.image.trim() || DEFAULT_PRODUCT_PRIMARY_IMAGE,
          category: form.category,
          inspiredNote: form.inspiredNote.trim() || null,
          inspiredImage: form.inspiredImage.trim() || null,
          images: parseImagesExtraBody(form.imagesExtra),
          stockQuantity: form.stock.trim() === '' ? null : Number(form.stock),
          tags: parseTagsField(form.tags),
        }),
      })
      setForm({
        id: '',
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
        category: 'all',
        inspiredNote: '',
        inspiredImage: '',
        imagesExtra: '',
        stock: '',
        tags: '',
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
          image: DEFAULT_PRODUCT_PRIMARY_IMAGE,
          category: 'all',
          inspiredNote: '',
          inspiredImage: '',
          imagesExtra: '',
          stock: '',
          tags: '',
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
      image: (p.image || '').trim() || DEFAULT_PRODUCT_PRIMARY_IMAGE,
      category: p.category || 'all',
      inspiredNote: p.inspiredNote ?? '',
      inspiredImage: p.inspiredImage ?? '',
      imagesExtra: Array.isArray(p.images) ? p.images.join('\n') : '',
      stock:
        p.stockQuantity != null && Number.isFinite(p.stockQuantity)
          ? String(p.stockQuantity)
          : '',
      tags: tagsToFormField(p.tags),
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
          image: editForm.image.trim() || DEFAULT_PRODUCT_PRIMARY_IMAGE,
          category: editForm.category,
          inspiredNote: editForm.inspiredNote.trim() || null,
          inspiredImage: editForm.inspiredImage.trim() || null,
          images: parseImagesExtraBody(editForm.imagesExtra),
          stockQuantity: editForm.stock.trim() === '' ? null : Number(editForm.stock),
          tags: parseTagsField(editForm.tags),
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
                  onClick={() => duplicateToAddForm(p)}
                >
                  نسخ
                </button>
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
            {(() => {
              const hints: string[] = []
              const img = editForm.image.trim()
              if (!img || img === DEFAULT_PRODUCT_PRIMARY_IMAGE) {
                hints.push('الصورة الرئيسية ما زالت الافتراضية — يُفضّل رفع صورة خاصة بالصنف.')
              }
              const cmp =
                editForm.compareAtPrice.trim() === '' ? null : Number(editForm.compareAtPrice)
              const pr = Number(editForm.price)
              if (
                cmp == null ||
                !Number.isFinite(cmp) ||
                !Number.isFinite(pr) ||
                cmp <= pr
              ) {
                hints.push(
                  'لا يوجد سعر «قبل التخفيض» صالح أعلى من السعر الحالي — لن يُعرض ضمن عروض التخفيض.',
                )
              }
              return hints.length ? (
                <div className="admin-quality-hints">
                  {hints.map((h) => (
                    <p key={h} className="admin-quality-hint-line">
                      {h}
                    </p>
                  ))}
                </div>
              ) : null
            })()}
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
              disallowEmpty={DEFAULT_PRODUCT_PRIMARY_IMAGE}
              hint="صورة عبوة HORUS الافتراضية مفعّلة تلقائياً؛ يمكنك استبدالها برابط أو رفع، ولا يمكن ترك الحقل فارغاً."
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
            <label className="field">
              <span>وسوم التصفية (سطر لكل وسم، مثل: مساء — ثبات — هدايا)</span>
              <textarea
                rows={2}
                value={editForm.tags}
                onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="مساء&#10;ثبات"
              />
            </label>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                const p = products.find((x) => x.id === editId)
                if (p) duplicateToAddForm(p)
              }}
            >
              نسخ هذا المنتج إلى نموذج «إضافة منتج» أدناه
            </button>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'جاري الحفظ…' : 'حفظ التعديلات'}
            </button>
          </form>
        ) : null}
      </div>

      <h2 className="admin-subtitle" id="admin-add-product-anchor">
        إضافة منتج
      </h2>
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
          disallowEmpty={DEFAULT_PRODUCT_PRIMARY_IMAGE}
          hint="تُعرض افتراضياً صورة عبوة HORUS؛ غيّرها برابط أو رفع إن أردت — لا يمكن حذف الصورة بالكامل."
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
        <label className="field">
          <span>وسوم التصفية (سطر لكل وسم)</span>
          <textarea
            rows={2}
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="مساء"
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'جاري الإضافة…' : 'إضافة المنتج'}
        </button>
      </form>
    </div>
  )
}

function csvEscapeCell(v: unknown): string {
  const t = v == null ? '' : String(v)
  return `"${t.replace(/"/g, '""')}"`
}

function downloadUtf8Csv(filename: string, lines: string[]) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function AdminSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultPublicSiteSettings())
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [exportError, setExportError] = useState<string | null>(null)

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

  function patchSiteSeo<K extends keyof SiteSeoSettings>(key: K, value: SiteSeoSettings[K]) {
    setSettings((s) => ({ ...s, siteSeo: { ...s.siteSeo, [key]: value } }))
  }

  function patchAbout<K extends keyof PublicSiteSettings['aboutPage']>(
    key: K,
    value: PublicSiteSettings['aboutPage'][K],
  ) {
    setSettings((s) => ({ ...s, aboutPage: { ...s.aboutPage, [key]: value } }))
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
          whatsappPhoneE164Secondary: settings.whatsappPhoneE164Secondary.replace(/\D/g, ''),
          whatsappWelcomeMessage: settings.whatsappWelcomeMessage,
          headerLogoUrl: settings.headerLogoUrl,
          headerLogoAlt: settings.headerLogoAlt,
          faviconUrl: settings.faviconUrl,
          siteMetaDescription: settings.siteMetaDescription,
          socialInstagram: settings.socialInstagram,
          socialTiktok: settings.socialTiktok,
          socialSnapchat: settings.socialSnapchat,
          socialTwitter: settings.socialTwitter,
          siteSeo: settings.siteSeo,
          aboutPage: settings.aboutPage,
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

  async function exportProductsCsv() {
    setExportError(null)
    try {
      const { products } = await apiJson<{ products: Product[] }>('/api/admin/products')
      const lines: string[] = [
        [
          'id',
          'name',
          'description',
          'price',
          'compareAtPrice',
          'category',
          'image',
          'stockQuantity',
          'tags',
          'images',
        ]
          .map(csvEscapeCell)
          .join(','),
      ]
      for (const p of products) {
        lines.push(
          [
            csvEscapeCell(p.id),
            csvEscapeCell(p.name),
            csvEscapeCell(p.description),
            csvEscapeCell(p.price),
            csvEscapeCell(p.compareAtPrice ?? ''),
            csvEscapeCell(p.category),
            csvEscapeCell(p.image),
            csvEscapeCell(p.stockQuantity ?? ''),
            csvEscapeCell((p.tags || []).join('; ')),
            csvEscapeCell((p.images || []).join('; ')),
          ].join(','),
        )
      }
      downloadUtf8Csv(`horus-products-${Date.now()}.csv`, lines)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'فشل تصدير المنتجات')
    }
  }

  async function exportOrdersCsv() {
    setExportError(null)
    try {
      const { orders } = await apiJson<{ orders: OrderRow[] }>('/api/admin/orders')
      const lines: string[] = [
        [
          'id',
          'publicCode',
          'createdAt',
          'status',
          'total',
          'customerName',
          'phone',
          'email',
          'country',
          'city',
          'region',
          'address',
          'extraNotes',
          'trackingNumber',
          'linesJson',
        ]
          .map(csvEscapeCell)
          .join(','),
      ]
      for (const o of orders) {
        lines.push(
          [
            csvEscapeCell(o.id),
            csvEscapeCell(o.publicCode),
            csvEscapeCell(o.createdAt),
            csvEscapeCell(o.status),
            csvEscapeCell(o.total),
            csvEscapeCell(o.customerName),
            csvEscapeCell(o.phone),
            csvEscapeCell(o.email ?? ''),
            csvEscapeCell(o.country ?? ''),
            csvEscapeCell(o.city),
            csvEscapeCell(o.region ?? ''),
            csvEscapeCell(o.address),
            csvEscapeCell(o.extraNotes),
            csvEscapeCell(o.trackingNumber ?? ''),
            csvEscapeCell(JSON.stringify(o.lines)),
          ].join(','),
        )
      }
      downloadUtf8Csv(`horus-orders-${Date.now()}.csv`, lines)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'فشل تصدير الطلبات')
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
      <label className="field">
        <span>رقم واتساب احتياطي (اختياري)</span>
        <input
          value={settings.whatsappPhoneE164Secondary}
          onChange={(e) => patch('whatsappPhoneE164Secondary', e.target.value)}
          placeholder="9665xxxxxxxx"
        />
      </label>
      <label className="field">
        <span>رسالة الترحيب في واتساب (اختياري)</span>
        <textarea
          rows={3}
          value={settings.whatsappWelcomeMessage}
          onChange={(e) => patch('whatsappWelcomeMessage', e.target.value)}
          placeholder="مرحباً، أريد الاستفسار عن…"
        />
      </label>
      <p className="admin-muted">
        شريط الإعلان، بانر الرئيسية، والأقسام تُعدّل من تبويب «واجهة المتجر».
      </p>

      <h2 className="admin-subtitle">الشعار والأيقونة</h2>
      <AdminImageUploadField
        label="شعار المتجر (يظهر في الهيدر بدلاً من النص إن وُجد)"
        value={settings.headerLogoUrl}
        onChange={(url) => patch('headerLogoUrl', url)}
        aspect={1}
        hint="يُحفظ نفس حقل شعار واجهة المتجر."
      />
      <label className="field">
        <span>نص بديل لشعار المتجر</span>
        <input
          value={settings.headerLogoAlt}
          onChange={(e) => patch('headerLogoAlt', e.target.value)}
        />
      </label>
      <AdminImageUploadField
        label="أيقونة الموقع (favicon)"
        value={settings.faviconUrl}
        onChange={(url) => patch('faviconUrl', url)}
        aspect={1}
        hint="مربعة صغيرة؛ تُحدَّث في المتصفح ديناميكياً."
      />

      <label className="field">
        <span>وصف المتجر للـ SEO</span>
        <textarea
          rows={3}
          value={settings.siteMetaDescription}
          onChange={(e) => patch('siteMetaDescription', e.target.value)}
        />
      </label>

      <h2 className="admin-subtitle">روابط السوشيال (اختياري)</h2>
      <div className="admin-grid-2">
        <label className="field">
          <span>إنستقرام</span>
          <input
            dir="ltr"
            value={settings.socialInstagram}
            onChange={(e) => patch('socialInstagram', e.target.value)}
            placeholder="https://instagram.com/…"
          />
        </label>
        <label className="field">
          <span>تيك توك</span>
          <input
            dir="ltr"
            value={settings.socialTiktok}
            onChange={(e) => patch('socialTiktok', e.target.value)}
            placeholder="https://tiktok.com/…"
          />
        </label>
        <label className="field">
          <span>سناب شات</span>
          <input
            dir="ltr"
            value={settings.socialSnapchat}
            onChange={(e) => patch('socialSnapchat', e.target.value)}
          />
        </label>
        <label className="field">
          <span>تويتر / X</span>
          <input
            dir="ltr"
            value={settings.socialTwitter}
            onChange={(e) => patch('socialTwitter', e.target.value)}
            placeholder="https://x.com/…"
          />
        </label>
      </div>

      <h2 className="admin-subtitle">SEO وبيانات الموقع</h2>
      <label className="field">
        <span>عنوان الموقع الافتراضي</span>
        <input
          value={settings.siteSeo.defaultTitle}
          onChange={(e) => patchSiteSeo('defaultTitle', e.target.value)}
        />
      </label>
      <label className="field">
        <span>قالب العنوان (مثال: {'{name} | HORUS'} )</span>
        <input
          dir="ltr"
          value={settings.siteSeo.titleTemplate}
          onChange={(e) => patchSiteSeo('titleTemplate', e.target.value)}
        />
      </label>
      <label className="field">
        <span>الوصف الافتراضي (meta)</span>
        <textarea
          rows={2}
          value={settings.siteSeo.defaultDescription}
          onChange={(e) => patchSiteSeo('defaultDescription', e.target.value)}
        />
      </label>
      <label className="field">
        <span>الكلمات المفتاحية</span>
        <input
          value={settings.siteSeo.defaultKeywords}
          onChange={(e) => patchSiteSeo('defaultKeywords', e.target.value)}
        />
      </label>
      <AdminImageUploadField
        label="صورة OG الافتراضية"
        value={settings.siteSeo.ogImageUrl}
        onChange={(url) => patchSiteSeo('ogImageUrl', url)}
        aspect={16 / 9}
      />

      <h2 className="admin-subtitle">صفحة «عن المتجر»</h2>
      <label className="field admin-checkbox-field">
        <input
          type="checkbox"
          checked={settings.aboutPage.enabled}
          onChange={(e) => patchAbout('enabled', e.target.checked)}
        />
        <span>تفعيل الصفحة ورابط القائمة</span>
      </label>
      <label className="field">
        <span>عنوان الصفحة</span>
        <input
          value={settings.aboutPage.pageTitle}
          onChange={(e) => patchAbout('pageTitle', e.target.value)}
        />
      </label>
      <AdminImageUploadField
        label="صورة رئيسية"
        value={settings.aboutPage.heroImageUrl}
        onChange={(url) => patchAbout('heroImageUrl', url)}
        aspect={16 / 9}
      />
      <label className="field">
        <span>نص الصفحة</span>
        <textarea
          rows={8}
          value={settings.aboutPage.body}
          onChange={(e) => patchAbout('body', e.target.value)}
        />
      </label>
      <label className="field">
        <span>عنوان القسم الثاني</span>
        <input
          value={settings.aboutPage.section2Title}
          onChange={(e) => patchAbout('section2Title', e.target.value)}
        />
      </label>
      <label className="field">
        <span>نص القسم الثاني</span>
        <textarea
          rows={4}
          value={settings.aboutPage.section2Body}
          onChange={(e) => patchAbout('section2Body', e.target.value)}
        />
      </label>
      <AdminImageUploadField
        label="صورة القسم الثاني"
        value={settings.aboutPage.section2ImageUrl}
        onChange={(url) => patchAbout('section2ImageUrl', url)}
        aspect={16 / 9}
      />

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
        <input value={settings.footerPhone} onChange={(e) => patch('footerPhone', e.target.value)} />
      </label>
      <label className="field">
        <span>سطر حقوق النشر</span>
        <input
          value={settings.footerCopyright}
          onChange={(e) => patch('footerCopyright', e.target.value)}
        />
      </label>

      <h2 className="admin-subtitle">تصدير البيانات</h2>
      <p className="admin-muted">يُنشأ الملف في المتصفح من بيانات لوحة التحكم (لا يستدعي واجهة جديدة).</p>
      {exportError ? <p className="form-error">{exportError}</p> : null}
      <div className="admin-toolbar">
        <button type="button" className="btn btn-ghost" onClick={() => void exportProductsCsv()}>
          تصدير المنتجات CSV
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => void exportOrdersCsv()}>
          تصدير الطلبات CSV
        </button>
      </div>

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
            className={tab === 'news' ? 'active' : ''}
            onClick={() => setTab('news')}
          >
            الأخبار
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
          {tab === 'news' ? <AdminNews /> : null}
          {tab === 'storefront' ? <AdminStorefront /> : null}
          {tab === 'settings' ? <AdminSettings /> : null}
        </div>
      </div>
    </div>
  )
}
