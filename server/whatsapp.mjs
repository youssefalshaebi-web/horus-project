const CURRENCY_LABEL = 'ر.س'

function formatMoney(n) {
  return `${Number(n).toLocaleString('ar-SA')} ${CURRENCY_LABEL}`
}

export function buildOwnerWhatsAppMessage(order, storeName) {
  const header = `🔔 طلب شراء جديد — ${storeName}\nرقم الطلب للعميل: ${order.publicCode}\n`

  const customer = [
    `الاسم: ${order.customerName}`,
    `الجوال: ${order.phone}`,
    `المدينة: ${order.city}`,
    `العنوان: ${order.address}`,
  ].join('\n')

  const items = order.lines.map(
    (l) =>
      `• ${l.name} × ${l.quantity} — ${formatMoney(l.lineTotal)} (الوحدة ${formatMoney(l.price)})`,
  )

  const itemsBlock = `\nالمنتجات:\n${items.join('\n')}\n\nالمجموع: ${formatMoney(order.total)}`

  const notes = order.extraNotes?.trim()
    ? `\n\nملاحظات العميل:\n${order.extraNotes.trim()}`
    : ''

  const tracking = order.trackingNumber
    ? `\n\nرقم التتبع الحالي: ${order.trackingNumber}`
    : ''

  return `${header}\n${customer}${itemsBlock}${notes}${tracking}`
}

export function whatsappUrl(phoneE164, message) {
  const digits = String(phoneE164).replace(/\D/g, '')
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}
