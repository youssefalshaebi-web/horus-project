import { useNavigate, useOutletContext } from 'react-router-dom'
import { CheckoutForm } from '../components/CheckoutForm'
import type { ShopOutletContext } from '../types'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { siteSettings } = useOutletContext<ShopOutletContext>()
  return <CheckoutForm siteSettings={siteSettings} onBack={() => navigate('/')} />
}
