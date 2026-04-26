import { CURRENCY_LABEL } from '../config'

export function formatPrice(n: number): string {
  return `${n.toLocaleString('ar-SA')} ${CURRENCY_LABEL}`
}
