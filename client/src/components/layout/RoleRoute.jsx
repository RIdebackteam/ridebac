import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/Spinner'

export default function RoleRoute({ role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user?.role !== role) {
    const dashboardPath = user?.role === 'driver' ? '/driver/dashboard' : '/search'
    return <Navigate to={dashboardPath} replace />
  }

  return <Outlet />
}
