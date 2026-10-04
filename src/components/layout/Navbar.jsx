import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user }          = useAuthContext()
  const { logout }        = useAuth()
  const { dark, toggle }  = useTheme()
  const navigate          = useNavigate()
  const { pathname }      = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const NAV = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/arena',     label: 'Arena'     },
    { to: '/history',   label: 'History'   },
    { to: '/topic',     label: 'Practice'  },
    { to: '/bookmarks', label: 'Saved'     },
    { to: '/settings',  label: 'Settings'  },
    { to: '/pricing',   label: 'Pro'       },
  ]

  return (
    <nav className="border-b border-g-border bg-g-950 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between" style={{ height: '52px' }}>

        {/* logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 shrink-0">
          <div className="border border-lime/40 px-2 py-0.5">
            <span className="text-lime font-mono font-bold text-xs tracking-widest">IA</span>
          </div>
          <span className="text-white/40 font-mono text-xs hidden md:block tracking-wider">
            INTERVIEW<span className="text-lime">·</span>ARENA
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-1">
            {NAV.map(({ to, label }) => {
              const active = pathname === to || (to === '/arena' && pathname.startsWith('/arena'))
              return (
                <Link key={to} to={to}
                  className={`px-3 py-1.5 font-mono text-xs transition-colors relative hidden sm:block
                    ${active
                      ? 'text-white bg-g-800 border border-g-border'
                      : 'text-white/35 hover:text-white/70 hover:bg-g-900'
                    }`}
                >
                  {label}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-lime" />}
                </Link>
              )
            })}

            <div className="w-px h-4 bg-g-border mx-1" />

            {/* theme toggle */}
            <button onClick={toggle}
              className="px-2.5 py-1.5 text-white/25 hover:text-white/70 font-mono text-xs transition-colors"
              title={dark ? 'Light mode' : 'Dark mode'}>
              {dark ? '☀' : '☾'}
            </button>

            <Link to="/session/new"
              className="px-4 py-1.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors whitespace-nowrap ml-1">
              + New
            </Link>

            <button onClick={handleLogout}
              className="px-3 py-1.5 text-white/25 hover:text-white/60 font-mono text-xs transition-colors">
              ↩
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
