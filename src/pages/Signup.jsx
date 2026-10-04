import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, authErrorMessage } from '../hooks/useAuth'
import { useAuthContext } from '../context/AuthContext'
import GoogleButton from '../components/ui/GoogleButton'

export default function Signup() {
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  async function handle(e) {
    e.preventDefault()
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr(''); setLoading(true)
    try { await signup(email, pass, name.trim()); navigate('/dashboard', { replace: true }) }
    catch (e) { setErr(authErrorMessage(e)); setLoading(false) }
  }

  if (user && !loading) return <Navigate to="/dashboard" replace />

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
            <div className="text-lime font-mono text-xs mb-0.5">// create account</div>
            <h1 className="text-white font-bold font-mono text-lg">Get started</h1>
          </div>

          <div className="p-6 space-y-5">

            {/* Google — fastest path */}
            <GoogleButton label="Sign up with Google" />

            {/* divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-g-border"/>
              <span className="text-white/20 font-mono text-xs">or</span>
              <div className="flex-1 h-px bg-g-border"/>
            </div>

            {/* email form */}
            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="text-white/30 font-mono text-xs block mb-1.5">name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} required
                  placeholder="Your name"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"/>
              </div>
              <div>
                <label className="text-white/30 font-mono text-xs block mb-1.5">email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                  placeholder="dev@example.com"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"/>
              </div>
              <div>
                <label className="text-white/30 font-mono text-xs block mb-1.5">password</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required
                  placeholder="Min 6 characters"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"/>
              </div>
              {err && <p className="text-red-400 font-mono text-xs border border-red-400/20 px-3 py-2">{err}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-50 transition-colors">
                {loading ? 'creating account…' : 'CREATE ACCOUNT →'}
              </button>
            </form>

          </div>

          {/* footer */}
          <div className="border-t border-g-border px-6 py-4 text-center">
            <span className="text-white/25 font-mono text-xs">
              have an account?{' '}
              <Link to="/login" className="text-lime hover:text-lime-dim transition-colors">login</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
