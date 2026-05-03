import { useCallback, useState } from 'react'

type Props = {
  title: string
  summary: string
  url: string
}

export function ProductShareRow({ title, summary, url }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [url])

  const share = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary, url })
      } catch {
        await copy()
      }
    } else {
      await copy()
    }
  }, [title, summary, url, copy])

  return (
    <div className="pd-share-row">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => void share()}>
        مشاركة
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => void copy()}>
        {copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
      </button>
    </div>
  )
}
