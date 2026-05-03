import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../config'
import type { HomeSectionConfig } from '../../types'
import { tileToForSection } from '../../utils/homeNav'

type Props = {
  categoriesBlockTitle: string
  sections: HomeSectionConfig[]
}

export function CategoryTiles({ categoriesBlockTitle, sections }: Props) {
  const tiles = [...sections]
    .filter((s) => s.showInTiles)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section className="home-categories" aria-labelledby="cat-heading">
      <h2 id="cat-heading" className="section-heading">
        <span className="section-heading-text">{categoriesBlockTitle}</span>
      </h2>
      <div className="category-grid">
        {tiles.map((t) => (
          <Link
            key={t.id}
            to={tileToForSection(t)}
            className={t.tileImage.trim() ? 'category-tile category-tile-image' : 'category-tile'}
            style={
              t.tileImage.trim()
                ? {
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.2)), url(${resolveMediaUrl(t.tileImage.trim())})`,
                  }
                : undefined
            }
          >
            <span className="category-tile-label">
              {t.tileEmoji ? <span className="category-tile-emoji">{t.tileEmoji} </span> : null}
              {t.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
