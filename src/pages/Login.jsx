import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, authErrorMessage } from '../hooks/useAuth'
import { useAuthContext } from '../context/AuthContext'
import GoogleButton from '../components/ui/GoogleButton'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const from = useLocation().state?.from || '/dashboard'

  async function handle(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await login(email, pass); navigate(from, { replace: true }) }
    catch (e) { setErr(authErrorMessage(e)); setLoading(false) }
  }

  if (user) return <Navigate to={from} replace />

  return (
    <div className="min-h-screen bg-g-950 grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 justify-center">
            <div className="border border-lime/40 px-2 py-0.5">
              <span className="text-lime font-mono font-bold text-sm tracking-widest">IA</span>
            </div>
            <span className="text-white/40 font-mono text-xs tracking-wider">INTERVIEW·ARENA</span>
          </div>
        </div>

        <div className="border border-g-border bg-g-900">

          {/* header */}
          <div className="border-b border-g-border px-6 py-4">
            <div className="text-lime font-mono text-xs mb-0.5">// login</div>
            <h1 className="text-white font-bold font-mono text-lg">Welcome back</h1>
          </div>

          <div className="p-6 space-y-5">

            {/* Google */}
            <GoogleButton label="Sign in with Google" redirectTo={from} />

            {/* divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-g-border"/>
              <span className="text-white/20 font-mono text-xs">or</span>
              <div className="flex-1 h-px bg-g-border"/>
            </div>

            {/* email form */}
            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="text-white/30 font-mono text-xs block mb-1.5">email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                  placeholder="dev@example.com"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"/>
              </div>
              <div>
                <label className="text-white/30 font-mono text-xs block mb-1.5">password</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"/>
              </div>
              {err && <p className="text-red-400 font-mono text-xs border border-red-400/20 px-3 py-2">{err}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-50 transition-colors">
                {loading ? 'authenticating…' : 'LOGIN →'}
              </button>
            </form>

          </div>

          {/* footer */}
          <div className="border-t border-g-border px-6 py-4 text-center">
            <span className="text-white/25 font-mono text-xs">
              no account?{' '}
              <Link to="/signup" className="text-lime hover:text-lime-dim transition-colors">sign up</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
