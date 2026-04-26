import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { readStore, mutateStore, writeStore, UPLOAD_DIR, ensureUploadDir } from './store.mjs'
import { buildOwnerWhatsAppMessage, whatsappUrl } from './whatsapp.mjs'
import {
  sanitizeFooterNavGroups,
  sanitizeHomeFeatures,
  sanitizeHomeSections,
  sanitizeSiteTheme,
  sanitizeUiPatch,
} from './settingsSanitize.mjs'
import { getDefaultUiSettings } from './storefrontUiDefaults.mjs'
import { getDefaultSiteTheme } from './themeDefaults.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const PORT = Number(process.env.PORT || 3001)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

ensureUploadDir()
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir()
      cb(null, UPLOAD_DIR)
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const safe = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg'
      cb(null, `${crypto.randomUUID()}${safe}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('الملف ليس صورة'))
  },
})

app.use('/uploads', express.static(UPLOAD_DIR))

function randomPublicCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += chars[crypto.randomInt(0, chars.length)]
  }
  return out
}

/** صور إضافية للمعرض (بدون تكرار) */
function normalizeProductImagesExtra(input) {
  if (input === undefined) return undefined
  if (input === null) return null
  if (!Array.isArray(input)) return null
  const urls = []
  const seen = new Set()
  for (const x of input) {
    const u = String(x ?? '').trim()
    if (!u || seen.has(u)) continue
    seen.add(u)
    urls.push(u)
    if (urls.length >= 24) break
  }
  return urls.length ? urls : null
}

function uniquePublicCode(store) {
  for (let n = 0; n < 50; n++) {
    const c = randomPublicCode()
    if (!store.orders.some((o) => o.publicCode === c)) return c
  }
  return randomPublicCode() + crypto.randomInt(10, 99)
}

function adminAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح' })
  }
  try {
    jwt.verify(h.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'انتهت الجلسة أو غير صالحة' })
  }
}

function publicSettings(store) {
  const s = store.settings
  const du = getDefaultUiSettings()
  const uHome = typeof s.uiHome === 'object' && s.uiHome ? s.uiHome : {}
  const uProd = typeof s.uiProduct === 'object' && s.uiProduct ? s.uiProduct : {}
  const uProdCopy =
    uProd && typeof uProd.copy === 'object' && uProd.copy ? uProd.copy : {}
  return {
    storeName: s.storeName,
    announcementBar: s.announcementBar ?? '',
    heroTitle: s.heroTitle ?? '',
    heroSubtitle: s.heroSubtitle ?? '',
    heroImage: s.heroImage ?? '',
    footerTagline: s.footerTagline ?? '',
    footerEmail: s.footerEmail ?? '',
    footerPhone: s.footerPhone ?? '',
    footerCopyright: s.footerCopyright ?? '',
    whatsappPhoneE164: s.whatsappPhoneE164 ?? '',
    categoriesBlockTitle: s.categoriesBlockTitle ?? 'فئات',
    headerLogoUrl: s.headerLogoUrl ?? '',
    headerLogoAlt: s.headerLogoAlt ?? '',
    homeSections: Array.isArray(s.homeSections) ? s.homeSections : [],
    homeFeatures: Array.isArray(s.homeFeatures) ? s.homeFeatures : [],
    preFooterEnabled: s.preFooterEnabled !== false,
    preFooterTitle: s.preFooterTitle ?? '',
    preFooterText: s.preFooterText ?? '',
    preFooterNewsletterEnabled: s.preFooterNewsletterEnabled !== false,
    preFooterNewsletterPlaceholder: s.preFooterNewsletterPlaceholder ?? '',
    preFooterNewsletterButtonLabel: s.preFooterNewsletterButtonLabel ?? '',
    footerNavGroups: Array.isArray(s.footerNavGroups) ? s.footerNavGroups : [],
    uiHome: { ...du.uiHome, ...uHome },
    uiProduct: {
      ...du.uiProduct,
      ...uProd,
      copy: { ...du.uiProduct.copy, ...uProdCopy },
    },
    uiCart: { ...du.uiCart, ...(typeof s.uiCart === 'object' && s.uiCart ? s.uiCart : {}) },
    uiCheckout: {
      ...du.uiCheckout,
      ...(typeof s.uiCheckout === 'object' && s.uiCheckout ? s.uiCheckout : {}),
    },
    uiOrderSuccess: {
      ...du.uiOrderSuccess,
      ...(typeof s.uiOrderSuccess === 'object' && s.uiOrderSuccess ? s.uiOrderSuccess : {}),
    },
    uiTrack: { ...du.uiTrack, ...(typeof s.uiTrack === 'object' && s.uiTrack ? s.uiTrack : {}) },
    promoSlots: Array.isArray(s.promoSlots) ? s.promoSlots : du.promoSlots,
    siteTheme: {
      ...getDefaultSiteTheme(),
      ...(typeof s.siteTheme === 'object' && s.siteTheme ? s.siteTheme : {}),
    },
  }
}

/** إعدادات الواجهة العامة */
app.get('/api/settings', (_req, res) => {
  res.json(publicSettings(readStore()))
})

app.get('/api/products', (_req, res) => {
  const store = readStore()
  res.json({ products: store.products })
})

/** تفاصيل طلب للعميل برقم العرض العام */
app.get('/api/orders/public/:code', (req, res) => {
  const code = String(req.params.code || '').toUpperCase()
  const store = readStore()
  const order = store.orders.find((o) => o.publicCode === code)
  if (!order) {
    return res.status(404).json({ error: 'الطلب غير موجود' })
  }
  res.json({
    order: {
      publicCode: order.publicCode,
      createdAt: order.createdAt,
      status: order.status,
      trackingNumber: order.trackingNumber,
      customerName: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      extraNotes: order.extraNotes,
      lines: order.lines,
      total: order.total,
    },
  })
})

/** إعادة توليد رابط واتساب لإشعار المالك (بعد إعادة تحميل الصفحة مثلاً) */
app.get('/api/orders/public/:code/whatsapp', (req, res) => {
  const code = String(req.params.code || '').toUpperCase()
  const store = readStore()
  const order = store.orders.find((o) => o.publicCode === code)
  if (!order) {
    return res.status(404).json({ error: 'الطلب غير موجود' })
  }
  const msg = buildOwnerWhatsAppMessage(order, store.settings.storeName)
  res.json({ whatsappUrl: whatsappUrl(store.settings.whatsappPhoneE164, msg) })
})

app.post('/api/orders', (req, res) => {
  const { lines, customer } = req.body || {}
  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: 'السلة فارغة' })
  }
  if (!customer || typeof customer !== 'object') {
    return res.status(400).json({ error: 'بيانات العميل ناقصة' })
  }
  const {
    customerName = '',
    phone = '',
    city = '',
    address = '',
    extraNotes = '',
  } = customer
  if (!String(customerName).trim()) {
    return res.status(400).json({ error: 'الاسم مطلوب' })
  }
  if (!String(phone).trim()) {
    return res.status(400).json({ error: 'الجوال مطلوب' })
  }
  if (!String(city).trim()) {
    return res.status(400).json({ error: 'المدينة مطلوبة' })
  }
  if (!String(address).trim()) {
    return res.status(400).json({ error: 'العنوان مطلوب' })
  }

  const qtyByProduct = new Map()
  for (const raw of lines) {
    const productId = raw?.productId
    const quantity = Math.max(1, Math.floor(Number(raw?.quantity) || 0))
    qtyByProduct.set(productId, (qtyByProduct.get(productId) || 0) + quantity)
  }

  let order = null
  let orderError = null
  let wa = null

  mutateStore((s) => {
    const productById = Object.fromEntries(s.products.map((p) => [p.id, p]))

    for (const [productId, need] of qtyByProduct) {
      const p = productById[productId]
      if (!p) {
        orderError = `منتج غير معروف: ${productId}`
        return
      }
      const stock = p.stockQuantity
      if (stock != null && Number.isFinite(stock) && stock < need) {
        orderError = `الكمية غير متوفرة: ${p.name}`
        return
      }
    }

    const resolvedLines = []
    let total = 0
    for (const raw of lines) {
      const productId = raw?.productId
      const quantity = Math.max(1, Math.floor(Number(raw?.quantity) || 0))
      const p = productById[productId]
      const lineTotal = p.price * quantity
      total += lineTotal
      resolvedLines.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity,
        lineTotal,
      })
    }

    for (const [productId, need] of qtyByProduct) {
      const p = s.products.find((x) => x.id === productId)
      const stock = p?.stockQuantity
      if (p && stock != null && Number.isFinite(stock)) {
        p.stockQuantity = stock - need
      }
    }

    const publicCode = uniquePublicCode(s)
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    order = {
      id,
      publicCode,
      createdAt,
      status: 'pending',
      trackingNumber: null,
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      city: String(city).trim(),
      address: String(address).trim(),
      extraNotes: String(extraNotes || '').trim(),
      lines: resolvedLines,
      total,
    }

    s.orders.unshift(order)
    wa = whatsappUrl(s.settings.whatsappPhoneE164, buildOwnerWhatsAppMessage(order, s.settings.storeName))
  })

  if (orderError) {
    return res.status(400).json({ error: orderError })
  }
  if (!order) {
    return res.status(500).json({ error: 'فشل إنشاء الطلب' })
  }

  res.status(201).json({
    order: {
      publicCode: order.publicCode,
      createdAt: order.createdAt,
      status: order.status,
      trackingNumber: order.trackingNumber,
      customerName: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      extraNotes: order.extraNotes,
      lines: order.lines,
      total: order.total,
    },
    whatsappUrl: wa,
  })
})

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

app.get('/api/admin/orders', adminAuth, (_req, res) => {
  const store = readStore()
  res.json({ orders: store.orders })
})

app.patch('/api/admin/orders/:id', adminAuth, (req, res) => {
  const { id } = req.params
  const { status, trackingNumber } = req.body || {}
  const allowed = ['pending', 'confirmed', 'shipped', 'cancelled']
  let updated = null
  mutateStore((s) => {
    const o = s.orders.find((x) => x.id === id)
    if (!o) return
    const prevStatus = o.status
    if (status !== undefined) {
      if (!allowed.includes(status)) return
      if (status === 'cancelled' && prevStatus !== 'cancelled') {
        for (const line of o.lines) {
          const p = s.products.find((x) => x.id === line.productId)
          const stock = p?.stockQuantity
          if (p && stock != null && Number.isFinite(stock)) {
            p.stockQuantity = stock + line.quantity
          }
        }
      }
      o.status = status
    }
    if (trackingNumber !== undefined) {
      o.trackingNumber = trackingNumber === null || trackingNumber === ''
        ? null
        : String(trackingNumber)
    }
    updated = o
  })
  if (!updated) {
    return res.status(404).json({ error: 'الطلب غير موجود' })
  }
  res.json({ order: updated })
})

app.get('/api/admin/stats', adminAuth, (_req, res) => {
  const store = readStore()
  const orders = store.orders
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const revenueTotal = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  res.json({
    orderCount: orders.length,
    pendingOrders,
    productCount: store.products.length,
    revenueTotal,
  })
})

app.get('/api/admin/products', adminAuth, (_req, res) => {
  res.json({ products: readStore().products })
})

app.post('/api/admin/products', adminAuth, (req, res) => {
  const p = req.body || {}
  const id = String(p.id || '')
    .trim()
    .replace(/\s+/g, '-')
  if (!id) {
    return res.status(400).json({ error: 'معرّف المنتج مطلوب' })
  }
  const name = String(p.name || '').trim()
  if (!name) {
    return res.status(400).json({ error: 'اسم المنتج مطلوب' })
  }
  const price = Number(p.price)
  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'السعر غير صالح' })
  }
  const compareRaw = p.compareAtPrice
  const compareAtPrice =
    compareRaw === null || compareRaw === '' || compareRaw === undefined
      ? null
      : Number(compareRaw)
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
    return res.status(400).json({ error: 'سعر قبل التخفيض غير صالح' })
  }

  const category = String(p.category || 'all')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
  const inspiredNote =
    p.inspiredNote === null || p.inspiredNote === undefined || p.inspiredNote === ''
      ? null
      : String(p.inspiredNote).trim()
  const inspiredImage =
    p.inspiredImage === null || p.inspiredImage === undefined || p.inspiredImage === ''
      ? null
      : String(p.inspiredImage).trim()

  let stockQuantity = null
  if (p.stockQuantity !== undefined && p.stockQuantity !== null && p.stockQuantity !== '') {
    const st = Math.floor(Number(p.stockQuantity))
    if (!Number.isFinite(st) || st < 0) {
      return res.status(400).json({ error: 'الكمية في المخزن غير صالحة' })
    }
    stockQuantity = st
  }

  const product = {
    id,
    name,
    description: String(p.description || '').trim(),
    price,
    compareAtPrice,
    category: category || 'all',
    inspiredNote,
    inspiredImage,
    stockQuantity,
    image: String(p.image || '').trim() || 'https://placehold.co/600x750/1a1816/c9a227?text=Perfume',
  }
  if (Object.prototype.hasOwnProperty.call(p, 'images')) {
    product.images = normalizeProductImagesExtra(p.images)
  }

  let created = null
  mutateStore((s) => {
    if (s.products.some((x) => x.id === id)) {
      created = false
      return
    }
    s.products.push(product)
    created = product
  })
  if (created === false) {
    return res.status(409).json({ error: 'معرّف المنتج موجود مسبقاً' })
  }
  res.status(201).json({ product: created })
})

app.patch('/api/admin/products/:id', adminAuth, (req, res) => {
  const { id } = req.params
  const p = req.body || {}
  let updated = null
  mutateStore((s) => {
    const idx = s.products.findIndex((x) => x.id === id)
    if (idx === -1) return
    const cur = s.products[idx]
    const next = { ...cur }
    if (p.name !== undefined) next.name = String(p.name).trim()
    if (p.description !== undefined) next.description = String(p.description).trim()
    if (p.price !== undefined) {
      const price = Number(p.price)
      if (!Number.isFinite(price) || price < 0) return
      next.price = price
    }
    if (p.compareAtPrice !== undefined) {
      const v = p.compareAtPrice
      next.compareAtPrice =
        v === null || v === '' ? null : Number(v)
      if (next.compareAtPrice !== null && (!Number.isFinite(next.compareAtPrice) || next.compareAtPrice < 0)) {
        return
      }
    }
    if (p.image !== undefined) next.image = String(p.image).trim()
    if (p.category !== undefined) {
      const c = String(p.category || 'all')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
      next.category = c || 'all'
    }
    if (p.inspiredNote !== undefined) {
      next.inspiredNote =
        p.inspiredNote === null || p.inspiredNote === ''
          ? null
          : String(p.inspiredNote).trim()
    }
    if (p.inspiredImage !== undefined) {
      next.inspiredImage =
        p.inspiredImage === null || p.inspiredImage === ''
          ? null
          : String(p.inspiredImage).trim()
    }
    if (p.stockQuantity !== undefined) {
      if (p.stockQuantity === null || p.stockQuantity === '') {
        next.stockQuantity = null
      } else {
        const st = Math.floor(Number(p.stockQuantity))
        if (!Number.isFinite(st) || st < 0) return
        next.stockQuantity = st
      }
    }
    if (p.images !== undefined) {
      next.images = normalizeProductImagesExtra(p.images)
    }
    s.products[idx] = next
    updated = next
  })
  if (!updated) {
    return res.status(404).json({ error: 'المنتج غير موجود' })
  }
  res.json({ product: updated })
})

app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const { id } = req.params
  let ok = false
  mutateStore((s) => {
    const n = s.products.filter((x) => x.id !== id)
    if (n.length !== s.products.length) {
      s.products = n
      ok = true
    }
  })
  if (!ok) {
    return res.status(404).json({ error: 'المنتج غير موجود' })
  }
  res.json({ ok: true })
})

app.get('/api/admin/settings', adminAuth, (_req, res) => {
  res.json(publicSettings(readStore()))
})

app.patch('/api/admin/settings', adminAuth, (req, res) => {
  const b = req.body || {}
  mutateStore((s) => {
    if (b.storeName !== undefined) {
      const n = String(b.storeName).trim()
      if (n) s.settings.storeName = n
    }
    if (b.whatsappPhoneE164 !== undefined) {
      const d = String(b.whatsappPhoneE164).replace(/\D/g, '')
      if (d.length >= 8) s.settings.whatsappPhoneE164 = d
    }
    const textFields = [
      'announcementBar',
      'heroTitle',
      'heroSubtitle',
      'heroImage',
      'footerTagline',
      'footerEmail',
      'footerPhone',
      'footerCopyright',
      'categoriesBlockTitle',
      'headerLogoUrl',
      'headerLogoAlt',
    ]
    for (const key of textFields) {
      if (b[key] !== undefined) {
        s.settings[key] = String(b[key] ?? '').trim()
      }
    }
    if (b.homeSections !== undefined) {
      s.settings.homeSections = sanitizeHomeSections(b.homeSections)
    }
    if (b.homeFeatures !== undefined) {
      s.settings.homeFeatures = sanitizeHomeFeatures(b.homeFeatures)
    }
    if (b.preFooterEnabled !== undefined) {
      s.settings.preFooterEnabled = Boolean(b.preFooterEnabled)
    }
    if (b.preFooterNewsletterEnabled !== undefined) {
      s.settings.preFooterNewsletterEnabled = Boolean(b.preFooterNewsletterEnabled)
    }
    const preFooterTextFields = [
      'preFooterTitle',
      'preFooterText',
      'preFooterNewsletterPlaceholder',
      'preFooterNewsletterButtonLabel',
    ]
    for (const key of preFooterTextFields) {
      if (b[key] !== undefined) {
        s.settings[key] = String(b[key] ?? '').trim()
      }
    }
    if (b.footerNavGroups !== undefined) {
      s.settings.footerNavGroups = sanitizeFooterNavGroups(b.footerNavGroups)
    }
    Object.assign(s.settings, sanitizeUiPatch(b))
    if (b.siteTheme !== undefined) {
      s.settings.siteTheme = sanitizeSiteTheme(b.siteTheme)
    }
  })
  res.json(publicSettings(readStore()))
})

/** واجهة الإنتاج: خادم الملفات الثابتة */
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST))
  // Express 5 / path-to-regexp: لا يدعم '*' بدون اسم — وإلا يتعطل السيرفر عند التشغيل
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api')) return next()
    if (req.path.startsWith('/uploads')) return next()
    res.sendFile(path.join(DIST, 'index.html'), (err) => next(err))
  })
}

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`)
  if (fs.existsSync(DIST)) {
    console.log(`واجهة الإنتاج من ${DIST}`)
  }
})
