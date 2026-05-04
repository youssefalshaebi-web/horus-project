import nodemailer from 'nodemailer'

const MAIL_USER = String(process.env.MAIL_USER || '').trim()
const MAIL_PASS = String(process.env.MAIL_PASS || '').trim()
const OWNER_EMAIL = String(process.env.OWNER_EMAIL || '').trim()

const GOLD = '#9a7209'
const BG = '#faf8f5'
const TEXT = '#1a1816'

function getTransporter() {
  if (!MAIL_USER || !MAIL_PASS) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  })
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatMoney(n) {
  return `${Number(n).toLocaleString('ar-SA')} ر.س`
}

function brandHeader(storeName) {
  const name = esc(storeName || 'HORUS parfum')
  return `
  <div style="text-align:center;padding:20px 16px 12px;background:linear-gradient(135deg,#1a1816 0%,#2d2618 100%);border-radius:12px 12px 0 0;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#e8d5a8;letter-spacing:0.04em;">HORUS</div>
    <div style="font-size:14px;color:${GOLD};text-transform:lowercase;margin-top:2px;">parfum</div>
    <div style="font-size:12px;color:rgba(232,213,168,0.75);margin-top:8px;">${name}</div>
  </div>`
}

function shippingBlock(order) {
  const lines = [
    `الاسم: ${esc(order.customerName)}`,
    `الجوال: ${esc(order.phone)}`,
    `البريد: ${esc(order.email)}`,
    `الدولة: ${esc(order.country)}`,
    `المدينة: ${esc(order.city)}`,
  ]
  if (String(order.region || '').trim()) lines.push(`المنطقة/الحي: ${esc(order.region)}`)
  lines.push(`العنوان: ${esc(order.address)}`)
  if (String(order.extraNotes || '').trim()) lines.push(`ملاحظات: ${esc(order.extraNotes)}`)
  return lines.map((l) => `<div style="margin:4px 0;font-size:14px;color:${TEXT};">${l}</div>`).join('')
}

function productsBlock(order) {
  const rows = order.lines.map(
    (l) =>
      `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e8e4dc;text-align:right;font-size:14px;">${esc(l.name)} × ${l.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e8e4dc;text-align:left;font-size:14px;white-space:nowrap;">${formatMoney(l.lineTotal)}</td>
      </tr>`,
  )
  return `
  <table role="presentation" width="100%" style="border-collapse:collapse;margin:12px 0;">
    <thead>
      <tr><th colspan="2" style="text-align:right;padding:8px 0;font-size:13px;color:${GOLD};">المنتجات</th></tr>
    </thead>
    <tbody>${rows.join('')}</tbody>
  </table>`
}

function wrapBody(storeName, innerHtml) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:16px;background:${BG};font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(26,24,22,0.08);">
    ${brandHeader(storeName)}
    <div style="padding:20px 18px 24px;">
      ${innerHtml}
    </div>
    <div style="padding:12px 18px;background:#f4f0e8;text-align:center;font-size:11px;color:#666;">
      رسالة تلقائية من متجر العطور — يرجى عدم الرد على هذا البريد مباشرة إن كان غير مرغوب.
    </div>
  </div>
</body>
</html>`
}

async function sendHtml(to, subject, html) {
  const t = getTransporter()
  if (!t || !to) return
  try {
    await t.sendMail({
      from: `"${String(process.env.MAIL_FROM_NAME || 'HORUS parfum').replace(/[\r\n"]/g, '')}" <${MAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (e) {
    console.error('[mailer] فشل الإرسال:', e?.message || e)
  }
}

/** @param {object} order */
export async function sendOrderConfirmationToOwner(order, storeName) {
  return /* مؤقت: تعطيل الإيميل */
  if (!OWNER_EMAIL) return
  const inner = `
    <p style="margin:0 0 12px;font-size:15px;color:${TEXT};">طلب شراء جديد</p>
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:${GOLD};">رقم الطلب: ${esc(order.publicCode)}</p>
    ${productsBlock(order)}
    <p style="margin:12px 0 8px;font-size:16px;font-weight:700;color:${TEXT};">المجموع: ${formatMoney(order.total)}</p>
    <div style="margin-top:16px;padding:14px;background:${BG};border-radius:10px;border-right:3px solid ${GOLD};">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};">بيانات التوصيل</p>
      ${shippingBlock(order)}
    </div>
  `
  await sendHtml(OWNER_EMAIL, `طلب جديد #${order.publicCode} — ${storeName || 'HORUS'}`, wrapBody(storeName, inner))
}

/** @param {object} order */
export async function sendOrderConfirmationToCustomer(order, storeName) {
  return /* مؤقت: تعطيل الإيميل */
  const to = String(order.email || '').trim()
  if (!to) return
  const inner = `
    <p style="margin:0 0 8px;font-size:15px;color:${TEXT};">شكراً لثقتك بنا.</p>
    <p style="margin:0 0 12px;font-size:15px;color:${TEXT};">تم استلام طلبك وهو قيد المراجعة.</p>
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:${GOLD};">رقم الطلب: ${esc(order.publicCode)}</p>
    ${productsBlock(order)}
    <p style="margin:12px 0 0;font-size:16px;font-weight:700;">المجموع: ${formatMoney(order.total)}</p>
    <div style="margin-top:16px;padding:14px;background:${BG};border-radius:10px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};">عنوان التوصيل</p>
      ${shippingBlock(order)}
    </div>
  `
  await sendHtml(
    to,
    `تأكيد الطلب #${order.publicCode} — ${storeName || 'HORUS parfum'}`,
    wrapBody(storeName, inner),
  )
}

/** @param {object} order */
export async function sendStatusUpdateToCustomer(order, storeName) {
  return /* مؤقت: تعطيل الإيميل */
  const to = String(order.email || '').trim()
  if (!to) return
  let title = 'تحديث حالة الطلب'
  let msg = ''
  switch (order.status) {
    case 'confirmed':
      msg = 'تم تأكيد طلبك. نعمل على تجهيزه بعناية.'
      title = 'تم تأكيد طلبك'
      break
    case 'shipped':
      msg = 'تم شحن طلبك. يمكنك متابعة رقم التتبع أدناه.'
      title = 'تم شحن طلبك'
      break
    case 'cancelled':
      msg = 'نأسف لإبلاغك بأن هذا الطلب أُلغي. لأي استفسار تواصل مع المتجر.'
      title = 'إلغاء الطلب'
      break
    default:
      msg = `حالة طلبك الآن: ${order.status}`
  }
  const inner = `
    <p style="margin:0 0 8px;font-size:15px;color:${TEXT};">${esc(msg)}</p>
    <p style="margin:12px 0 8px;font-size:22px;font-weight:800;color:${GOLD};">رقم الطلب: ${esc(order.publicCode)}</p>
    <p style="margin:0;font-size:15px;">المجموع: ${formatMoney(order.total)}</p>
  `
  await sendHtml(to, `${title} #${order.publicCode}`, wrapBody(storeName, inner))
}

/** @param {object} order */
export async function sendShippingNotification(order, storeName) {
  return /* مؤقت: تعطيل الإيميل */
  const to = String(order.email || '').trim()
  if (!to) return
  const track = String(order.trackingNumber || '').trim() || '— سيُحدَّث لاحقاً —'
  const inner = `
    <p style="margin:0 0 8px;font-size:15px;color:${TEXT};">تم شحن طلبك وهو في الطريق إليك.</p>
    <p style="margin:0 0 12px;font-size:15px;color:${TEXT};">احتفظ برقم التتبع لمتابعة الشحنة مع شركة الشحن.</p>
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:${GOLD};">رقم الطلب: ${esc(order.publicCode)}</p>
    <div style="margin:16px 0;padding:18px;background:linear-gradient(135deg,${BG} 0%,#fff 100%);border:2px solid ${GOLD};border-radius:12px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${GOLD};letter-spacing:0.08em;">رقم التتبع</p>
      <p style="margin:0;font-size:20px;font-weight:800;color:${TEXT};letter-spacing:0.06em;">${esc(track)}</p>
    </div>
    ${productsBlock(order)}
    <p style="margin:12px 0 0;font-size:16px;font-weight:700;">المجموع: ${formatMoney(order.total)}</p>
  `
  await sendHtml(to, `تم شحن طلبك #${order.publicCode}`, wrapBody(storeName, inner))
}
