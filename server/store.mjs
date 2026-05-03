import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getDefaultStore,
  getDefaultSettings,
  getBaseProducts,
  getDemoProducts,
  getDefaultHomeSections,
  getDefaultHomeFeatures,
  getDefaultFooterNavGroups,
} from './seed.mjs'
import { DEFAULT_PRODUCT_PRIMARY_IMAGE } from './productDefaults.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = path.join(__dirname, 'data')
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')
const STORE_PATH = path.join(DATA_DIR, 'store.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function ensureUploadDir() {
  ensureDataDir()
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

/** دمج حقول جديدة لملفات store القديمة */
function normalizeStore(data) {
  let changed = false
  const defs = getDefaultSettings()
  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = { ...defs }
    return true
  }
  for (const [k, v] of Object.entries(defs)) {
    if (data.settings[k] === undefined) {
      data.settings[k] = v
      changed = true
    }
  }
  if (data.settings.homeVideo && typeof data.settings.homeVideo === 'object') {
    const hv = data.settings.homeVideo
    const defHv = defs.homeVideo
    if (hv.enabled === undefined) {
      hv.enabled = defHv.enabled
      changed = true
    }
    if (typeof hv.url !== 'string') {
      hv.url = defHv.url
      changed = true
    }
    if (hv.posterUrl === undefined) {
      hv.posterUrl = defHv.posterUrl ?? ''
      changed = true
    }
  }
  if (!data.settings.heroBanner || typeof data.settings.heroBanner !== 'object') {
    data.settings.heroBanner = structuredClone(defs.heroBanner)
    changed = true
  } else {
    const hb = data.settings.heroBanner
    if (hb.enabled === undefined) {
      hb.enabled = false
      changed = true
    }
    if (!Array.isArray(hb.slides)) {
      hb.slides = []
      changed = true
    }
  }
  if (!data.settings.aboutPage || typeof data.settings.aboutPage !== 'object') {
    data.settings.aboutPage = structuredClone(defs.aboutPage)
    changed = true
  }
  if (!data.settings.siteSeo || typeof data.settings.siteSeo !== 'object') {
    data.settings.siteSeo = structuredClone(defs.siteSeo)
    changed = true
  } else {
    const se = data.settings.siteSeo
    const dse = defs.siteSeo
    for (const k of Object.keys(dse)) {
      if (se[k] === undefined) {
        se[k] = dse[k]
        changed = true
      }
    }
  }
  if (!Array.isArray(data.settings.homeSections)) {
    data.settings.homeSections = structuredClone(getDefaultHomeSections())
    changed = true
  }
  if (!Array.isArray(data.settings.homeFeatures)) {
    data.settings.homeFeatures = structuredClone(getDefaultHomeFeatures())
    changed = true
  }
  if (!Array.isArray(data.settings.footerNavGroups)) {
    data.settings.footerNavGroups = structuredClone(getDefaultFooterNavGroups())
    changed = true
  }
  if (!Array.isArray(data.products)) {
    data.products = []
    changed = true
  }
  for (const p of data.products) {
    if (p.category == null || p.category === '') {
      p.category = 'all'
      changed = true
    }
    if (p.inspiredNote === undefined) {
      p.inspiredNote = null
      changed = true
    }
    if (p.inspiredImage === undefined) {
      p.inspiredImage = null
      changed = true
    }
    if (p.stockQuantity === undefined) {
      p.stockQuantity = null
      changed = true
    }
    if (p.images !== undefined && p.images !== null && !Array.isArray(p.images)) {
      p.images = null
      changed = true
    }
    if (p.tags === undefined) {
      p.tags = null
      changed = true
    } else if (p.tags != null) {
      if (!Array.isArray(p.tags)) {
        p.tags = null
        changed = true
      } else {
        const t = [...new Set(p.tags.map((x) => String(x).trim().toLowerCase()).filter(Boolean))].slice(0, 16)
        p.tags = t.length ? t : null
      }
    }
    const imgTrim = String(p.image || '').trim()
    if (!imgTrim) {
      p.image = DEFAULT_PRODUCT_PRIMARY_IMAGE
      changed = true
    }
  }
  if (!Array.isArray(data.orders)) {
    data.orders = []
    changed = true
  }
  if (!Array.isArray(data.news)) {
    data.news = []
    changed = true
  } else {
    for (const n of data.news) {
      if (!n || typeof n !== 'object') continue
      if (n.visible === undefined) {
        n.visible = true
        changed = true
      }
    }
  }
  if (!data._internal || typeof data._internal !== 'object') {
    data._internal = {}
    changed = true
  }
  /** ترقية لمرة واحدة: منتجات معرّفات البذرة التي ما زالت بصورة unsplash → صورة العبوة الافتراضية */
  if (!data._internal.seedCatalogImagesMigratedV2) {
    const seedIds = new Set([
      ...getBaseProducts().map((p) => p.id),
      ...getDemoProducts().map((p) => p.id),
    ])
    for (const p of data.products) {
      if (!seedIds.has(p.id)) continue
      const img = String(p.image || '')
      if (img.includes('unsplash.com')) {
        p.image = DEFAULT_PRODUCT_PRIMARY_IMAGE
        changed = true
      }
      if (Array.isArray(p.images) && p.images.some((u) => String(u).includes('unsplash.com'))) {
        p.images = null
        changed = true
      }
    }
    data._internal.seedCatalogImagesMigratedV2 = true
    changed = true
  }
  /** مرة واحدة: إخفاء التخفيضات/كل العطور من التمرير؛ البلاطة «جميع العطور» → #catalog */
  if (!data._internal.homeCatalogLayout) {
    if (Array.isArray(data.settings.homeSections)) {
      for (const sec of data.settings.homeSections) {
        if (sec.id === 'offers') {
          sec.visible = false
          sec.showInTiles = false
        }
        if (sec.id === 'all-products') {
          sec.visible = false
          sec.showInTiles = true
        }
        if (sec.subtitleLinkHash === 'all-products') {
          sec.subtitleLinkHash = 'catalog'
        }
      }
    }
    data._internal.homeCatalogLayout = true
    changed = true
  }
  /** مرة واحدة: بلاطات جديدة (أخبار، هدايا، الأكثر مبيعاً، السعر المنخفض) وإخفاء بلاطتي نساء/رجال */
  if (!data._internal.homeCategoryTilesV2) {
    if (Array.isArray(data.settings.homeSections)) {
      const hs = data.settings.homeSections
      const defaults = getDefaultHomeSections()
      const have = new Set(hs.map((s) => s.id))
      for (const sec of hs) {
        if (sec && (sec.id === 'womens' || sec.id === 'mens')) {
          sec.showInTiles = false
        }
      }
      for (const def of defaults) {
        if (!have.has(def.id)) {
          hs.push(structuredClone(def))
        }
      }
    }
    data._internal.homeCategoryTilesV2 = true
    changed = true
  }
  /** مرة واحدة: أقسام المنتجات أسفل الرئيسية = نسائي ورجالي فقط (البلاطات تبقى كما هي) */
  if (!data._internal.homeProductStripsWomensMensOnly) {
    if (Array.isArray(data.settings.homeSections)) {
      for (const sec of data.settings.homeSections) {
        if (sec && (sec.id === 'gifts' || sec.id === 'bestsellers')) {
          sec.visible = false
        }
      }
    }
    data._internal.homeProductStripsWomensMensOnly = true
    changed = true
  }
  /** مرة واحدة: رابط «اطلع على جميع العطور» للنسائي/الرجالي → كتالوج مُصفّى */
  if (!data._internal.homeSubtitleWomensMensCatalog) {
    if (Array.isArray(data.settings.homeSections)) {
      for (const sec of data.settings.homeSections) {
        if (!sec) continue
        if (sec.id === 'womens') sec.subtitleLinkHash = 'catalog-womens'
        if (sec.id === 'mens') sec.subtitleLinkHash = 'catalog-mens'
      }
    }
    data._internal.homeSubtitleWomensMensCatalog = true
    changed = true
  }
  /** مرة واحدة: نص الموقع بنفس ذهبية العنوان (استبدال #1a1816 الافتراضي القديم عند تطابق ثيم المتجر مع الافتراضي) */
  if (!data._internal.siteThemeBrandTextUnify) {
    const t = data.settings?.siteTheme
    if (t && typeof t === 'object') {
      const text = String(t.text || '').trim().toLowerCase()
      const accent = String(t.accent || '').trim().toLowerCase()
      if (text === '#1a1816' && (accent === '#9a7209' || accent === '')) {
        t.text = '#9a7209'
        t.muted = '#7a5c12'
        if (!accent) t.accent = '#9a7209'
      }
    }
    data._internal.siteThemeBrandTextUnify = true
    changed = true
  }
  return changed
}

export function readStore() {
  ensureDataDir()
  if (!fs.existsSync(STORE_PATH)) {
    const seed = getDefaultStore()
    writeStore(seed)
    return structuredClone(seed)
  }
  const raw = fs.readFileSync(STORE_PATH, 'utf8')
  const data = JSON.parse(raw)
  if (normalizeStore(data)) {
    writeStore(data)
  }
  return data
}

export function writeStore(store) {
  ensureDataDir()
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
}

/** @param {(s: ReturnType<typeof getDefaultStore>) => void} fn */
export function mutateStore(fn) {
  const s = readStore()
  fn(s)
  writeStore(s)
  return s
}
