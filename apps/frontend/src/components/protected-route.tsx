import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { getToken } from "@/api/auth"

/**
 * Guards routes that need a signed-in user.
 * The JWT lives in localStorage; without it we bounce to /signin.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!getToken()) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}