import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getAdminToken } from '../../api/client'
import { ADMIN_PANEL_LOGIN_PATH } from '../../adminRoute'

export function AdminGuard({ children }: { children: ReactNode }) {
  if (!getAdminToken()) {
    return <Navigate to={ADMIN_PANEL_LOGIN_PATH} replace />
  }
  return children
}
