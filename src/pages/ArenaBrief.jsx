import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { createArenaSession, getUserArenaSessions, getUserPlan } from '../services/firestore'
import { canStartRound, getPlan, usageThisMonth } from '../utils/plans'
import { hasApiKey } from '../services/openrouter'
import Navbar from '../components/layout/Navbar'
import { getCompany, getRound, FORMAT_DISCLAIMER } from '../data/companies'
import { getRoundType } from '../data/roundTypes'

export const LEVELS = [
  { v: 'intern', label: 'INTERN' },
  { v: 'sde1',   label: 'SDE-1' },
  { v: 'sde2',   label: 'SDE-2' },
]

export default function ArenaBrief() {
  const { companyId, roundId } = useParams()
  const company = getCompany(companyId)
  const round   = getRound(companyId, roundId)
  const type    = round ? getRoundType(round.type) : null
  const [level, setLevel] = useState('intern')
  const [starting, setStarting] = useState(false)
  const [err, setErr] = useState('')
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const keyOk = hasApiKey()
  const [quota, setQuota] = useState(null) // { allowed, remaining, limit, plan }

  useEffect(() => {
    if (!user) return
    Promise.all([getUserPlan(user.uid), getUserArenaSessions(user.uid)]).then(([plan, sessions]) => {
      setQuota({ ...canStartRound(plan, usageThisMonth(sessions)), plan })
    })
  }, [user])

  async function handleStart() {
    if (starting || (quota && !quota.allowed)) return
    setStarting(true); setErr('')
    try {
      const id = await createArenaSession(user.uid, {
        companyId, roundId, level, roundType: round.type,
        companyName: company.name, roundTitle: round.title,
      })
      navigate(`/arena/session/${id}`)
    } catch (e) {
      setErr(e.message || 'Could not start the session.')
      setStarting(false)
    }
  }

  if (!company || !round) {
    return (
      <div className="min-h-screen bg-g-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-white/30 font-mono text-xs">round not found.</p>
          <Link to="/arena" className="text-lime font-mono text-xs">← arena</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-5">
        <Link to="/arena" className="text-white/25 hover:text-white font-mono text-xs transition-colors">← all companies</Link>

        <div>
          <div className="text-lime font-mono text-xs mb-1">// {company.name.toLowerCase()} · {type.label.toLowerCase()}</div>
          <h1 className="text-white font-bold font-mono text-2xl">{round.title}</h1>
          <div className="text-white/35 font-mono text-xs mt-1">{round.durationMin} min · {type.workspace === 'code' ? 'code editor' : 'discussion'}</div>
        </div>

        <div className="border border-g-border bg-g-900 divide-y divide-g-border">
          <div className="p-5">
            <div className="text-white/30 font-mono text-xs mb-2">the round</div>
            <p className="text-white/80 font-mono text-xs leading-relaxed">{round.brief}</p>
          </div>
          <div className="p-5">
            <div className="text-white/30 font-mono text-xs mb-2">your interviewer</div>
            <p className="text-white/60 font-mono text-xs leading-relaxed italic">{round.persona}</p>
          </div>
          <div className="p-5">
            <div className="text-white/30 font-mono text-xs mb-2">they will look for</div>
            <div className="flex flex-wrap gap-2">
              {round.focus.map(f => (
                <span key={f} className="border border-lime/30 text-lime font-mono text-xs px-2 py-0.5">{f}</span>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="text-white/30 font-mono text-xs mb-3">how you are graded (1-4 per criterion)</div>
            <div className="space-y-2.5">
              {type.rubric.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  <span className="text-white/40 font-mono text-xs w-10 shrink-0 text-right">{Math.round(c.weight * 100)}%</span>
                  <div>
                    <div className="text-white font-mono text-xs">{c.label}</div>
                    <div className="text-white/35 font-mono text-xs">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-0 border border-g-border">
            {LEVELS.map(l => (
              <button key={l.v} onClick={() => setLevel(l.v)}
                className={`px-4 py-2 font-mono text-xs transition-colors ${
                  level === l.v ? 'bg-lime text-black font-bold' : 'text-white/40 hover:text-white hover:bg-g-800'
                }`}>
                {l.label}
              </button>
            ))}
          </div>
          {quota && !quota.allowed ? (
            <Link to="/pricing" className="px-5 py-2.5 border border-lime/50 text-lime font-mono text-xs hover:bg-g-800">
              {quota.limit} free rounds used this month · upgrade →
            </Link>
          ) : keyOk ? (
            <button onClick={handleStart} disabled={starting}
              className="px-6 py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-50 transition-colors">
              {starting ? 'starting…' : 'START INTERVIEW →'}
            </button>
          ) : (
            <Link to="/settings" className="px-4 py-2 border border-yellow-400/40 text-yellow-400 font-mono text-xs">
              add an API key to start →
            </Link>
          )}
        </div>
        {err && <p className="text-red-400 font-mono text-xs">{err}</p>}
        {quota && quota.allowed && quota.limit !== Infinity && (
          <p className="text-white/30 font-mono text-xs text-right">
            {getPlan(quota.plan).name} plan · {quota.remaining} of {quota.limit} rounds left this month ·{' '}
            <Link to="/pricing" className="text-lime underline">go unlimited</Link>
          </p>
        )}

        <p className="text-white/20 font-mono text-xs">{FORMAT_DISCLAIMER}</p>
      </div>
    </div>
  )
}
