import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { apiJson } from '../api/client'
import { SiteFooter } from '../components/home/SiteFooter'
import type { PublicNewsArticle, ShopOutletContext } from '../types'
import { formatNewsDate } from '../utils/formatNewsDate'
import { useSEO } from '../hooks/useSEO'

export function NewsPage() {
  const { siteSettings } = useOutletContext<ShopOutletContext>()
  const uh = siteSettings.uiHome
  const [news, setNews] = useState<PublicNewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useSEO({
    siteSettings,
    title: `الأخبار | ${siteSettings.siteSeo.defaultTitle}`.trim(),
  })

  const load = useCallback(async () => {
    try {
      const d = await apiJson<{ news: PublicNewsArticle[] }>('/api/news')
      setNews(d.news)
      setError(null)
    } catch (e) {
      setNews([])
      setError(e instanceof Error ? e.message : 'تعذر تحميل الأخبار')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="home-main home-main--catalog news-page">
      <div className="catalog-view-head">
        <Link to="/" className="btn btn-ghost catalog-back-btn">
          ← العودة للرئيسية
        </Link>
        <h1 className="catalog-view-title">الأخبار</h1>
        <p className="catalog-view-hint">آخر المستجدات والإعلانات من المتجر.</p>
      </div>

      {loading ? (
        <p className="checkout-lead" style={{ textAlign: 'center', maxWidth: '32rem', margin: '1.5rem auto 0' }}>
          جاري التحميل…
        </p>
      ) : error ? (
        <p className="form-error" style={{ textAlign: 'center', maxWidth: '32rem', margin: '1.5rem auto 0' }}>
          {error}
        </p>
      ) : news.length === 0 ? (
        <p className="checkout-lead" style={{ textAlign: 'center', maxWidth: '32rem', margin: '1.5rem auto 0' }}>
          لا توجد أخبار حالياً
        </p>
      ) : (
        <div className="news-list">
          {news.map((item) => (
            <article key={item.id} className="news-item-card">
              <h2 className="news-item-title">{item.title}</h2>
              <p className="news-item-date">{formatNewsDate(item.createdAt)}</p>
              <div className="news-item-body">{item.body}</div>
            </article>
          ))}
        </div>
      )}

      {uh.showSiteFooter ? <SiteFooter settings={siteSettings} /> : null}
    </main>
  )
}
