/* Context module: hook + provider together */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartLine, Product } from '../types'
import { maxOrderableQty } from '../utils/stock'

const STORAGE_KEY = 'horus-perfume-cart'

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  addToCart: (productId: string, qty?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeLine: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadInitial(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is CartLine =>
        typeof x === 'object' &&
        x !== null &&
        'productId' in x &&
        'quantity' in x &&
        typeof (x as CartLine).productId === 'string' &&
        typeof (x as CartLine).quantity === 'number',
    )
  } catch {
    return []
  }
}

function productMap(products: Product[]): Map<string, Product> {
  return new Map(products.map((p) => [p.id, p]))
}

export function CartProvider({
  products,
  children,
}: {
  products: Product[]
  children: ReactNode
}) {
  const [lines, setLines] = useState<CartLine[]>(loadInitial)
  const byId = useMemo(() => productMap(products), [products])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  useEffect(() => {
    // مزامنة السلة مع تحديثات المخزون من الخادم — لا بد من ضبط الحالة هنا
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تصحيح كميات السلة عند تغيّر المنتجات/المخزون
    setLines((prev) => {
      let changed = false
      const next: CartLine[] = []
      for (const line of prev) {
        const p = byId.get(line.productId)
        const cap = maxOrderableQty(p)
        if (cap != null && cap <= 0) {
          changed = true
          continue
        }
        if (cap != null && line.quantity > cap) {
          next.push({ ...line, quantity: cap })
          changed = true
        } else {
          next.push(line)
        }
      }
      return changed ? next : prev
    })
  }, [byId])

  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      const add = Math.max(1, Math.floor(qty))
      setLines((prev) => {
        const p = byId.get(productId)
        const cap = maxOrderableQty(p)
        const i = prev.findIndex((l) => l.productId === productId)
        const cur = i === -1 ? 0 : prev[i].quantity
        const sum = cur + add
        const limited = cap == null ? sum : Math.min(sum, cap)
        if (limited < 1) return prev
        if (i === -1) return [...prev, { productId, quantity: limited }]
        const next = [...prev]
        next[i] = { ...next[i], quantity: limited }
        return next
      })
    },
    [byId],
  )

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      const p = byId.get(productId)
      const cap = maxOrderableQty(p)
      let q = Math.floor(quantity)
      if (cap != null) q = Math.min(q, cap)
      if (q < 1) {
        setLines((prev) => prev.filter((l) => l.productId !== productId))
        return
      }
      setLines((prev) => {
        const i = prev.findIndex((l) => l.productId === productId)
        if (i === -1) return [...prev, { productId, quantity: q }]
        const next = [...prev]
        next[i] = { ...next[i], quantity: q }
        return next
      })
    },
    [byId],
  )

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const { itemCount, subtotal } = useMemo(() => {
    let count = 0
    let sum = 0
    for (const line of lines) {
      const p = byId.get(line.productId)
      if (!p) continue
      count += line.quantity
      sum += p.price * line.quantity
    }
    return { itemCount: count, subtotal: sum }
  }, [lines, byId])

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      addToCart,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [lines, itemCount, subtotal, addToCart, setQuantity, removeLine, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
