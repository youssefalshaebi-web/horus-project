import { resolveMediaUrl } from '../../config'

type Props = {
  title: string
  subtitle: string
  imageUrl: string
}

export function HomeHero({ title, subtitle, imageUrl }: Props) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-copy">
        <h1 id="home-hero-title" className="home-hero-title">
          {title}
        </h1>
        {subtitle ? <p className="home-hero-sub">{subtitle}</p> : null}
      </div>
      {imageUrl ? (
        <div className="home-hero-visual">
          <img src={resolveMediaUrl(imageUrl)} alt="" className="home-hero-img" loading="lazy" />
        </div>
      ) : null}
    </section>
  )
}
