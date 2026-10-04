import { useState } from 'react'
import Navbar from '../layout/Navbar'
import VoiceInput from '../ui/VoiceInput'
import { useAI } from '../../hooks/useAI'
import { buildDescriptiveEvalPrompt } from '../../utils/promptBuilder'
import { useSessionContext } from '../../context/SessionContext'
import { toScore10 } from '../../utils/scoreCalculator'

export default function DescriptiveChallenge({ domain, diff, data, onResult }) {
  const qs = data?.questions || []
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [lastFeedback, setLastFeedback] = useState(null)
  const [error, setError] = useState('')
  const { runAI } = useAI()
  const { state } = useSessionContext()

  const q = qs[current]
  const isLast = current === qs.length - 1

  async function submit() {
    if (!answer.trim() || state.isAILoading) return
    const { system, user, maxTokens } = buildDescriptiveEvalPrompt(q.q, q.keyPoints, answer)
    try {
      const res = await runAI(system, user, maxTokens)
      setError('')
      const r = { score: toScore10(res?.score), feedback: typeof res?.feedback === 'string' ? res.feedback : '' }
      const next = [...results, r]
      setResults(next)
      setLastFeedback(r)
      if (isLast) {
        setTimeout(() => {
          const avg = Math.round(next.reduce((s,r)=>s+r.score,0)/next.length * 10)
          onResult(avg, next.map((r,i)=>`Q${i+1}:${r.score}/10`).join(' · '))
        }, 1500)
      }
    } catch (e) {
      setError(e.message || 'Evaluation failed. Try again.')
    }
  }

  function nextQ() {
    setCurrent(c => c + 1)
    setAnswer('')
    setLastFeedback(null)
  }

  if (!q) return null

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lime text-xs font-mono mb-1">// {domain?.label} · descriptive</div>
            <div className="text-white/30 font-mono text-xs">question {current+1} of {qs.length}</div>
          </div>
          <div className="flex gap-1">
            {qs.map((_,i) => (
              <div key={i} className={`w-5 h-1.5 ${
                i < results.length
                  ? results[i].score>=7 ? 'bg-lime' : results[i].score>=4 ? 'bg-yellow-400' : 'bg-red-400'
                  : i===current ? 'bg-white/40' : 'bg-g-border'
              }`}/>
            ))}
          </div>
        </div>

        <div className="border border-g-border bg-g-900 p-5 mb-4 animate-slide-up">
          <div className="text-lime/50 font-mono text-xs mb-2">Q{current+1}</div>
          <p className="text-white font-mono text-sm leading-relaxed">{q.q}</p>
          {q.keyPoints && <p className="text-white/25 font-mono text-xs mt-3 border-t border-g-border pt-3">covers: {q.keyPoints}</p>}
        </div>

        {!lastFeedback ? (
          <>
            <textarea
              value={answer}
              onChange={e=>setAnswer(e.target.value)}
              placeholder="type your answer here, or use the mic..."
              className="code-editor w-full h-40 bg-g-800 border border-g-border text-white placeholder-white/15 p-4 focus:outline-none focus:border-lime/40 mb-3 transition-colors"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-3">
                <VoiceInput onTranscript={t=>setAnswer(p=>p?p.trimEnd()+' '+t:t)} disabled={state.isAILoading} />
                <span className="text-white/20 font-mono text-xs">{answer.length} chars</span>
                {error && <span className="text-red-400 font-mono text-xs">{error}</span>}
              </div>
              <button onClick={submit} disabled={!answer.trim()||state.isAILoading}
                className="px-5 py-2 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-30 transition-colors">
                {state.isAILoading ? 'evaluating...' : 'SUBMIT →'}
              </button>
            </div>
          </>
        ) : (
          <div className="border border-g-border bg-g-900 p-5 animate-slide-up space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/30 font-mono text-xs">score</span>
              <span className={`font-mono font-bold text-2xl ${lastFeedback.score>=7?'text-lime':lastFeedback.score>=4?'text-yellow-400':'text-red-400'}`}>
                {lastFeedback.score}/10
              </span>
            </div>
            <p className="text-white/60 font-mono text-xs leading-relaxed">{lastFeedback.feedback}</p>
            {!isLast
              ? <button onClick={nextQ} className="w-full py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors">NEXT QUESTION →</button>
              : <div className="text-white/25 font-mono text-xs text-center animate-pulse">calculating final score...</div>
            }
          </div>
        )}
      </div>
    </div>
  )
}
