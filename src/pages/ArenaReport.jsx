import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import ScoreRing from '../components/ui/ScoreRing'
import { getCompany, getRound } from '../data/companies'
import { getRoundType } from '../data/roundTypes'
import { getArenaSession, updateArenaSession } from '../services/firestore'
import { callAI } from '../services/openrouter'
import { buildScorecardPrompt, normalizeScorecard, computeVerdict } from '../utils/scorecard'
import { candidateTurns, formatClock } from '../utils/arenaEngine'

const DOTS = [1, 2, 3, 4]
const BAR_LABEL = { 1: 'strong no', 2: 'below bar', 3: 'meets bar', 4: 'exceeds bar' }

export default function ArenaReport() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [status,  setStatus]  = useState('loading')  // loading | scoring | ready | error
  const [error,   setError]   = useState('')
  const [copied,  setCopied]  = useState(false)
  const scoringRef = useRef(false)

  const company = session ? getCompany(session.companyId) : null
  const round   = session ? getRound(session.companyId, session.roundId) : null
  const type    = round ? getRoundType(round.type) : null

  const score = useCallback(async (s) => {
    if (scoringRef.current) return
    scoringRef.current = true
    setStatus('scoring'); setError('')
    try {
      const c = getCompany(s.companyId), r = getRound(s.companyId, s.roundId), t = getRoundType(r.type)
      const p = buildScorecardPrompt({ company: c, round: r, type: t, level: s.level, transcript: s.transcript, code: s.code })
      const raw = await callAI(p.system, p.user, p.maxTokens)
      const card = normalizeScorecard(raw, t.rubric)
      const verdict = computeVerdict(card.criteria)
      const scorecard = { ...card, verdict: { key: verdict.key, weighted: verdict.weighted, percent: verdict.percent, capped: verdict.capped } }
      await updateArenaSession(s.id, { scorecard, status: 'scored', scoredAt: Date.now() })
      setSession({ ...s, scorecard, status: 'scored' })
      setStatus('ready')
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'No API key. Add one in Settings.' : e.message || 'Scoring failed.')
      setStatus('error')
    } finally {
      scoringRef.current = false
    }
  }, [])

  useEffect(() => {
    getArenaSession(sessionId).then(s => {
      if (!s || !getRound(s.companyId, s.roundId)) { navigate('/arena', { replace: true }); return }
      if (s.status === 'live') { navigate(`/arena/session/${sessionId}`, { replace: true }); return }
      setSession(s)
      if (s.scorecard) setStatus('ready')
      else score(s)
    })
  }, [sessionId, navigate, score])

  // retries go through the briefing page so plan limits apply
  function handleRetry() { navigate(`/arena/${session.companyId}/${session.roundId}`) }

  async function handleShare() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  if (status === 'loading' || status === 'scoring') return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader message={status === 'scoring' ? 'the interviewer is writing your scorecard…' : 'loading…'} />
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400 font-mono text-xs border border-red-400/20 px-4 py-3 max-w-sm">{error}</p>
        <button onClick={() => score(session)} className="px-5 py-2 bg-lime text-black font-bold font-mono text-xs">RETRY SCORING</button>
      </div>
    </div>
  )

  const card = session.scorecard
  const v = computeVerdict(card.criteria)
  const turns = candidateTurns(session.transcript || [])
  const durationSec = session.endedAt && session.startedAt ? (session.endedAt - session.startedAt) / 1000 : null

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lime font-mono text-xs mb-1">// scorecard · {company.name.toLowerCase()}</div>
            <div className="text-white/30 font-mono text-xs">
              {round.title} · {session.level}{durationSec ? ` · ${formatClock(durationSec)}` : ''} · {turns} replies
            </div>
          </div>
          <Link to="/arena" className="text-white/25 font-mono text-xs hover:text-white transition-colors">← arena</Link>
        </div>

        {turns < 3 && (
          <div className="border border-yellow-400/30 bg-yellow-400/5 px-4 py-2 mb-3">
            <span className="text-yellow-400 font-mono text-xs">⚠ very short round. Treat this scorecard as a rough signal.</span>
          </div>
        )}

        {/* verdict hero */}
        <div className="border border-g-border bg-g-900 grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-g-border">
          <div className="py-6 flex items-center justify-center">
            <ScoreRing score={v.percent} color={v.ring} size={120} label="bar" />
          </div>
          <div className="sm:col-span-2 p-6">
            <div className={`font-mono font-bold text-3xl ${v.color}`}>{v.label}</div>
            <div className="text-white/30 font-mono text-xs mt-1">
              weighted {v.weighted.toFixed(2)} / 4{v.capped ? ' · capped by a red flag' : ''}
            </div>
            {card.summary && <p className="text-white/60 font-mono text-xs leading-relaxed mt-4">{card.summary}</p>}
          </div>
        </div>

        {/* rubric */}
        <div className="border border-t-0 border-g-border bg-g-900 divide-y divide-g-border">
          <div className="px-5 py-3 text-white/30 font-mono text-xs">rubric</div>
          {card.criteria.map(c => (
            <div key={c.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-mono text-xs">
                  {c.label} <span className="text-white/25">· {Math.round(c.weight * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {DOTS.map(d => (
                      <span key={d} className={`w-5 h-1.5 ${d <= c.score ? (c.score >= 3 ? 'bg-lime' : c.score === 2 ? 'bg-yellow-400' : 'bg-red-400') : 'bg-g-700'}`} />
                    ))}
                  </div>
                  <span className="text-white/35 font-mono text-xs w-20 text-right">{BAR_LABEL[c.score]}</span>
                </div>
              </div>
              <p className="text-white/50 font-mono text-xs mt-2 leading-relaxed">{c.evidence}</p>
              {c.improve && <p className="text-lime/80 font-mono text-xs mt-1 leading-relaxed">→ {c.improve}</p>}
            </div>
          ))}
        </div>

        {/* strengths / flags */}
        {(card.strengths.length > 0 || card.redFlags.length > 0) && (
          <div className="border border-t-0 border-g-border bg-g-900 grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-g-border">
            <div className="p-5">
              <div className="text-lime font-mono text-xs mb-2">strengths</div>
              {card.strengths.map((s, i) => <p key={i} className="text-white/60 font-mono text-xs leading-relaxed">+ {s}</p>)}
            </div>
            <div className="p-5 border-t sm:border-t-0 border-g-border">
              <div className="text-red-400 font-mono text-xs mb-2">red flags</div>
              {card.redFlags.length
                ? card.redFlags.map((s, i) => <p key={i} className="text-white/60 font-mono text-xs leading-relaxed">− {s}</p>)
                : <p className="text-white/25 font-mono text-xs">none noted</p>}
            </div>
          </div>
        )}

        {/* next steps */}
        {card.nextSteps.length > 0 && (
          <div className="border border-t-0 border-g-border bg-g-900 p-5">
            <div className="text-white/30 font-mono text-xs mb-2">practise next</div>
            {card.nextSteps.map((s, i) => (
              <p key={i} className="text-white/70 font-mono text-xs leading-relaxed">{i + 1}. {s}</p>
            ))}
          </div>
        )}

        {/* transcript */}
        <details className="border border-t-0 border-g-border bg-g-900">
          <summary className="px-5 py-3 text-white/30 font-mono text-xs cursor-pointer hover:text-white">transcript ▾</summary>
          <div className="px-5 pb-5 space-y-2">
            {(session.transcript || []).map((t, i) => (
              <p key={i} className="font-mono text-xs leading-relaxed">
                <span className={t.role === 'interviewer' ? 'text-lime' : 'text-white/40'}>
                  {t.role === 'interviewer' ? 'INT' : 'YOU'}
                </span>{' '}
                <span className="text-white/60">{t.text}</span>
              </p>
            ))}
          </div>
        </details>

        {/* actions */}
        <div className="border border-t-0 border-g-border grid grid-cols-3 divide-x divide-g-border">
          <button onClick={handleRetry}
            className="py-4 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors">
            RETRY ROUND →
          </button>
          <Link to={`/arena`} className="py-4 text-white/40 font-mono text-xs text-center hover:bg-g-800 hover:text-white">
            OTHER ROUNDS
          </Link>
          <button onClick={handleShare} className="py-4 text-white/40 font-mono text-xs hover:bg-g-800 hover:text-white">
            {copied ? '✓ COPIED' : 'SHARE'}
          </button>
        </div>
      </div>
    </div>
  )
}
