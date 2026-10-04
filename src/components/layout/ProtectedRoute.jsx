import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuthContext()
  const location = useLocation()
  // remember where the user was going so login can send them back
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}
