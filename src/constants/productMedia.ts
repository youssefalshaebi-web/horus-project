/** ملف ثابت في `public/` — الصورة الرئيسية الافتراضية لكل الأصناف */
export const DEFAULT_PRODUCT_PRIMARY_IMAGE = '/horus-default-product.png'

export function productPrimaryImageUrl(image: string | undefined | null): string {
  const t = (image ?? '').trim()
  return t || DEFAULT_PRODUCT_PRIMARY_IMAGE
}
