/** رابط فتح محادثة واتساب؛ إن وُجد نص يُمرَّر كمعامل نصي أولي */
export function whatsappChatUrl(phone: string, prefilledMessage?: string): string {
  const digits = String(phone).replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  const m = prefilledMessage?.trim()
  if (!m) return base
  return `${base}?text=${encodeURIComponent(m)}`
}
