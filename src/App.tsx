import { Navigate, Route, Routes } from 'react-router-dom'
import { DevModeBanner } from './components/DevModeBanner'
import { CustomerLayout } from './layout/CustomerLayout'
import { ProductsLoader } from './layout/ProductsLoader'
import { AdminGuard } from './pages/admin/AdminGuard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { CartPreviewPage } from './pages/CartPreviewPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { NewsPage } from './pages/NewsPage'
import { AboutPage } from './pages/AboutPage'
import { ShopPage } from './pages/ShopPage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { ADMIN_PANEL_BASE_PATH, ADMIN_PANEL_LOGIN_PATH } from './adminRoute'

export default function App() {
  return (
    <>
      <DevModeBanner />
      <Routes>
        <Route element={<ProductsLoader />}>
          <Route element={<CustomerLayout />}>
            <Route index element={<ShopPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="product/:productId" element={<ProductDetailPage />} />
            <Route path="cart-preview" element={<CartPreviewPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order/:code" element={<OrderSuccessPage />} />
            <Route path="track" element={<TrackOrderPage />} />
          </Route>
        </Route>
        <Route path={ADMIN_PANEL_LOGIN_PATH} element={<AdminLoginPage />} />
        <Route
          path={ADMIN_PANEL_BASE_PATH}
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
