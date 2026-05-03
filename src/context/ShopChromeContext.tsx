/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

type ShopChromeValue = {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  menuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
}

const ShopChromeContext = createContext<ShopChromeValue | null>(null)

export function ShopChromeProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      menuOpen,
      setMenuOpen,
    }),
    [searchQuery, menuOpen],
  )

  return (
    <ShopChromeContext.Provider value={value}>{children}</ShopChromeContext.Provider>
  )
}

export function useShopChrome(): ShopChromeValue {
  const ctx = useContext(ShopChromeContext)
  if (!ctx) throw new Error('useShopChrome must be used within ShopChromeProvider')
  return ctx
}
