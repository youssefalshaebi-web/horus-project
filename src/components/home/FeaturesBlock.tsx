import type { ReactNode } from 'react'
import type { HomeFeatureConfig } from '../../types'

const ICONS: Record<string, ReactNode> = {
  package: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h16v10H4V8Zm2 2v6h12v-6H6Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  clock: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  support: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12 16h.01M12 12a4 4 0 1 0-4-4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  truck: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 16h2v3H3v-3Zm0 0V8h11v8M14 16h2l3 3v-5h-5v2M14 8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sparkles: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L7 13l3.5-1.5L12 8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

type Props = {
  features: HomeFeatureConfig[]
}

export function FeaturesBlock({ features }: Props) {
  const list = features.length > 0 ? features : []

  return (
    <section className="home-features" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">
        لماذا نحن
      </h2>
      <ul className="features-list">
        {list.slice(0, 6).map((f, i) => (
          <li key={`${f.title}-${i}`} className="features-item">
            <div className="features-icon">{ICONS[f.iconKey] ?? ICONS.package}</div>
            <h3 className="features-title">{f.title}</h3>
            <p className="features-text">{f.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
