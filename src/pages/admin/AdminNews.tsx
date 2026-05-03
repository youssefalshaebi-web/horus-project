import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../../api/client'
import type { NewsArticle } from '../../types'
import { formatNewsDate } from '../../utils/formatNewsDate'

export function AdminNews() {
  const [items, setItems] = useState<NewsArticle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visible, setVisible] = useState(true)

  const load = useCallback(async () => {
    try {
      const d = await apiJson<{ news: NewsArticle[] }>('/api/admin/news')
      setItems(d.news)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل الأخبار')
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    void load().finally(() => setLoading(false))
  }, [load])

  function openCreate() {
    setEditingId('new')
    setTitle('')
    setBody('')
    setVisible(true)
    setError(null)
  }

  function openEdit(item: NewsArticle) {
    setEditingId(item.id)
    setTitle(item.title)
    setBody(item.body)
    setVisible(item.visible)
    setError(null)
  }

  function closeForm() {
    setEditingId(null)
    setTitle('')
    setBody('')
    setVisible(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) {
      setError('العنوان مطلوب')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId === 'new') {
        await apiJson('/api/admin/news', {
          method: 'POST',
          body: JSON.stringify({ title: t, body, visible }),
        })
      } else if (editingId) {
        await apiJson(`/api/admin/news/${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: t, body, visible }),
        })
      }
      closeForm()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function toggleVisible(item: NewsArticle) {
    setError(null)
    try {
      await apiJson(`/api/admin/news/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ visible: !item.visible }),
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل التحديث')
    }
  }

  async function removeItem(id: string) {
    if (!window.confirm('حذف هذا الخبر؟ لا يمكن التراجع.')) return
    setError(null)
    try {
      await apiJson(`/api/admin/news/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (editingId === id) closeForm()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحذف')
    }
  }

  return (
    <div className="admin-news">
      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => void load()} disabled={loading}>
          تحديث القائمة
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={openCreate}
          disabled={editingId !== null}
        >
          إضافة خبر
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}

      {editingId ? (
        <form className="admin-card admin-news-form" onSubmit={(e) => void handleSubmit(e)}>
          <h2 className="admin-subtitle" style={{ marginTop: 0 }}>
            {editingId === 'new' ? 'خبر جديد' : 'تعديل الخبر'}
          </h2>
          <label className="field">
            <span>العنوان</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            <span>النص</span>
            <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <label className="field">
            <span>الظهور في صفحة الأخبار للزوار</span>
            <div className="admin-news-checkbox-row">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                id="admin-news-visible"
              />
              <label htmlFor="admin-news-visible" className="admin-muted" style={{ cursor: 'pointer', margin: 0 }}>
                نعم، إظهار هذا الخبر للزوار
              </label>
            </div>
          </label>
          <div className="admin-grid-2" style={{ marginTop: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={saving}>
              إلغاء
            </button>
          </div>
        </form>
      ) : null}

      {loading && items.length === 0 ? (
        <p className="checkout-lead">جاري التحميل…</p>
      ) : items.length === 0 ? (
        <p className="checkout-lead">لا توجد أخبار بعد. اضغط «إضافة خبر».</p>
      ) : (
        items.map((item) => (
          <article key={item.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3 className="admin-guide-title" style={{ margin: 0, fontSize: '1.05rem' }}>
                  {item.title}
                </h3>
                <p className="admin-muted">{formatNewsDate(item.createdAt)}</p>
                <p className="admin-mini">
                  {item.visible ? (
                    <span className="admin-stat-accent" style={{ display: 'inline-block', padding: '0.15rem 0.5rem' }}>
                      ظاهر
                    </span>
                  ) : (
                    <span className="admin-muted">مخفي</span>
                  )}
                </p>
              </div>
              <div className="admin-section-editor-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openEdit(item)}
                  disabled={editingId !== null}
                >
                  تعديل
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void toggleVisible(item)}
                >
                  {item.visible ? 'إخفاء' : 'إظهار'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void removeItem(item.id)}
                  disabled={editingId !== null}
                >
                  حذف
                </button>
              </div>
            </div>
            <p className="admin-mini" style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
              {item.body || '—'}
            </p>
          </article>
        ))
      )}
    </div>
  )
}
