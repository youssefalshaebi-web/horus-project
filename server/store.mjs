import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getDefaultStore,
  getDefaultSettings,
  getDemoProducts,
  getDefaultHomeSections,
  getDefaultHomeFeatures,
  getDefaultFooterNavGroups,
} from './seed.mjs'

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
  }
  if (!Array.isArray(data.orders)) {
    data.orders = []
    changed = true
  }
  if (!data._internal || typeof data._internal !== 'object') {
    data._internal = {}
    changed = true
  }
  /** منتجات تجريبية لمرة واحدة — لا تُعاد بعد الحذف */
  if (!data._internal.demoProductsSeeded) {
    const existingIds = new Set(data.products.map((p) => p.id))
    for (const p of getDemoProducts()) {
      if (!existingIds.has(p.id)) {
        data.products.push(p)
        existingIds.add(p.id)
      }
    }
    data._internal.demoProductsSeeded = true
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
