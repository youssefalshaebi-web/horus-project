/** رابط فتح محادثة واتساب بدون نص مسبق */
export function whatsappChatUrl(phoneE164: string): string {
  const digits = String(phoneE164).replace(/\D/g, '')
  return `https://wa.me/${digits}`
}
