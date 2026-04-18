import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email,setEmail] = useState('')
  const [pass,setPass] = useState('')
  const [err,setErr] = useState('')
  const [loading,setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handle(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await login(email,pass); navigate('/dashboard') }
    catch { setErr('Invalid credentials.') }
    finally { setLoading(false) }
  }

  const field = (label, type, val, set, ph) => (
    <div>
      <label className="text-white/30 text-xs font-mono block mb-1">{label}</label>
      <input type={type} value={val} onChange={e=>set(e.target.value)} required placeholder={ph}
        className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors" />
    </div>
  )

  return (
    <div className="min-h-screen bg-g-950 grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-lime font-bold font-mono text-xl">[IA]</span>
          <p className="text-white/30 text-xs font-mono mt-1">interview-arena</p>
        </div>
        <div className="border border-g-border bg-g-900 p-8">
          <div className="text-lime text-xs font-mono mb-1">// login</div>
          <h1 className="text-white font-bold font-mono text-lg mb-6">Welcome back</h1>
          <form onSubmit={handle} className="space-y-4">
            {field('email','email',email,setEmail,'dev@example.com')}
            {field('password','password',pass,setPass,'••••••••')}
            {err && <p className="text-red-400 text-xs font-mono">{err}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-50 transition-colors mt-2">
              {loading ? 'authenticating...' : 'LOGIN →'}
            </button>
          </form>
          <p className="text-white/25 text-xs font-mono mt-5 text-center">
            no account?{' '}
            <Link to="/signup" className="text-lime hover:text-lime-dim transition-colors">sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
