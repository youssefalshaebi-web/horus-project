import { resolveMediaUrl } from '../../config'

/** ثابت في الكود — لا يُعرّف من لوحة التحكم */
export const HOME_PERMANENT_FEATURED_IMAGE = '/home-featured-ombra.png'

const TITLE = 'عطور، تليق بك'
const INTRO =
  'تشكيلة مدروسة وجودة عالية، وإتمام طلبك. بسهولة مع تتبع، ودعم عبر الواتساب'

/**
 * لافتة الصفحة الرئيسية الدائمة — مباشرة تحت شريط البحث في الرأس.
 */
export function HomePermanentFeatured() {
  return (
    <section className="home-permanent-featured" aria-labelledby="home-permanent-featured-title">
      <div className="home-permanent-featured-copy">
        <h1 id="home-permanent-featured-title" className="home-permanent-featured-title">
          {TITLE}
        </h1>
        <p className="home-permanent-featured-text">{INTRO}</p>
      </div>
      <div className="home-permanent-featured-visual">
        <img
          src={resolveMediaUrl(HOME_PERMANENT_FEATURED_IMAGE)}
          alt=""
          className="home-permanent-featured-img"
          loading="eager"
          decoding="async"
        />
      </div>
    </section>
  )
}
