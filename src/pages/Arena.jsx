import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { COMPANIES, FORMAT_DISCLAIMER } from '../data/companies'
import { getRoundType } from '../data/roundTypes'

const TIERS = [
  { v: 'all',      label: 'ALL' },
  { v: 'big-tech', label: 'BIG TECH' },
  { v: 'product',  label: 'PRODUCT' },
  { v: 'startup',  label: 'STARTUP' },
]

export default function Arena({ readiness = {} }) {
  const [tier, setTier] = useState('all')
  const [openId, setOpenId] = useState(null)

  const list = useMemo(
    () => COMPANIES.filter(c => tier === 'all' || c.tier === tier),
    [tier]
  )

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <div className="text-lime font-mono text-xs mb-1">// arena pro</div>
          <h1 className="text-white font-bold font-mono text-2xl">Company Interview Tracks</h1>
          <p className="text-white/40 font-mono text-xs mt-2 leading-relaxed max-w-xl">
            Practise the actual round formats companies run: machine coding, LLD, system design,
            bar raisers. A live AI interviewer plays the role and grades you on that round's rubric.
          </p>
        </div>

        <div className="flex gap-0 border border-g-border w-fit">
          {TIERS.map(t => (
            <button key={t.v} onClick={() => setTier(t.v)}
              className={`px-4 py-2 font-mono text-xs transition-colors ${
                tier === t.v ? 'bg-lime text-black font-bold' : 'text-white/40 hover:text-white hover:bg-g-800'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map(c => {
            const open = openId === c.id
            const r = readiness[c.id]
            return (
              <div key={c.id}
                className={`border bg-g-900 transition-colors ${open ? 'border-lime/40 md:col-span-2' : 'border-g-border hover:border-g-hi'}`}>
                <button onClick={() => setOpenId(open ? null : c.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-mono font-bold text-sm">{c.name}</div>
                    <div className="text-white/35 font-mono text-xs mt-1">{c.tagline}</div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {c.rounds.map(rd => (
                        <span key={rd.id} className="border border-g-border text-white/40 font-mono text-xs px-1.5">
                          {getRoundType(rd.type)?.short}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {r != null
                      ? <><div className="text-lime font-mono font-bold text-lg">{r}%</div>
                          <div className="text-white/25 font-mono text-xs">ready</div></>
                      : <div className="text-white/20 font-mono text-xs">not started</div>}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-g-border divide-y divide-g-border animate-fade-in">
                    {c.rounds.map(rd => {
                      const t = getRoundType(rd.type)
                      return (
                        <Link key={rd.id} to={`/arena/${c.id}/${rd.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-g-800 transition-colors group">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lime font-mono text-xs border border-lime/30 px-1.5">{t.short}</span>
                              <span className="text-white font-mono text-xs">{rd.title}</span>
                            </div>
                            <div className="text-white/30 font-mono text-xs mt-1 truncate">{rd.brief}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-white/40 font-mono text-xs">{rd.durationMin} min</div>
                            <div className="text-white/20 group-hover:text-lime font-mono text-xs transition-colors">brief →</div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-white/20 font-mono text-xs">{FORMAT_DISCLAIMER}</p>
      </div>
    </div>
  )
}
