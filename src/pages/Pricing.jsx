import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'
import { recordUpgradeInterest } from '../services/firestore'
import { PLANS } from '../utils/plans'

export default function Pricing() {
  const { user } = useAuthContext()
  const [state, setState] = useState('idle') // idle | saving | done | error

  async function handleUpgrade() {
    if (!user || state === 'saving') return
    setState('saving')
    try {
      await recordUpgradeInterest(user.uid, user.email, 'pro')
      setState('done')
    } catch {
      setState('error')
    }
  }

  const plans = [PLANS.free, PLANS.pro]

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center">
          <div className="text-lime font-mono text-xs mb-2">// pricing</div>
          <h1 className="text-white font-bold font-mono text-2xl">Practise the loop, not just LeetCode.</h1>
          <p className="text-white/40 font-mono text-xs mt-3">One mock interview with a human costs ₹1,000+. Pro is less than a third of that, for a month.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map(p => {
            const pro = p.id === 'pro'
            return (
              <div key={p.id} className={`border bg-g-900 p-6 flex flex-col ${pro ? 'border-lime/50' : 'border-g-border'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-bold text-sm ${pro ? 'text-lime' : 'text-white'}`}>{p.name}</span>
                  {pro && <span className="bg-lime text-black font-mono text-xs font-bold px-2">STUDENTS</span>}
                </div>
                <div className="mt-4">
                  <span className="text-white font-mono font-bold text-4xl">₹{p.priceInr}</span>
                  <span className="text-white/30 font-mono text-xs"> / month</span>
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="text-white/60 font-mono text-xs flex gap-2">
                      <span className="text-lime">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {!pro ? (
                    <Link to={user ? '/arena' : '/signup'}
                      className="block text-center py-2.5 border border-g-border text-white/60 hover:text-white font-mono text-xs">
                      {user ? 'GO TO ARENA' : 'START FREE'}
                    </Link>
                  ) : !user ? (
                    <Link to="/signup" className="block text-center py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim">
                      SIGN UP TO GET PRO
                    </Link>
                  ) : state === 'done' ? (
                    <p className="text-lime font-mono text-xs text-center py-2.5 border border-lime/30">
                      ✓ You're on the list. We'll email {user.email || 'you'} when Pro opens.
                    </p>
                  ) : (
                    <button onClick={handleUpgrade} disabled={state === 'saving'}
                      className="w-full py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-50">
                      {state === 'saving' ? 'saving…' : 'GET PRO (EARLY ACCESS) →'}
                    </button>
                  )}
                  {state === 'error' && <p className="text-red-400 font-mono text-xs mt-2">Couldn't save. Try again.</p>}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-white/25 font-mono text-xs text-center">Payments are launching soon. Early-access users get the launch price locked in.</p>
      </div>
    </div>
  )
}
