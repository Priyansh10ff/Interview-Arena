import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user } = useAuthContext()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const link = (to, label) => (
    <Link
      to={to}
      className={`text-xs font-mono px-1 py-0.5 transition-colors ${
        pathname === to
          ? 'text-white border-b border-lime'
          : 'text-white/40 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="border-b border-g-border bg-g-900 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="text-lime font-mono font-bold text-sm tracking-wider">[IA]</span>
          <span className="text-white/60 font-mono text-xs hidden sm:block">interview-arena</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            {link('/dashboard', 'dashboard')}
            {link('/history', 'history')}
            {link('/topic', 'practice')}
            <Link
              to="/settings"
              className={`text-xs font-mono px-1 py-0.5 transition-colors ${pathname==='/settings' ? 'text-lime' : 'text-white/40 hover:text-white'}`}
              title="Settings & API Key"
            >
              settings
            </Link>
            <Link
              to="/session/new"
              className="px-3 py-1 bg-lime text-black text-xs font-bold font-mono hover:bg-lime-dim transition-colors"
            >
              + new
            </Link>
            <button
              onClick={handleLogout}
              className="text-white/25 hover:text-white/60 text-xs font-mono transition-colors"
            >
              exit
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
