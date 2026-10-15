import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/Spinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but OTP not verified → force them to verify first
  if (!user.isVerified) {
    return <Navigate to="/verify-otp" state={{ email: user.email }} replace />
  }

  return <Outlet />
}
