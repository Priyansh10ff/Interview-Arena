import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import CodingChallenge from '../components/topic/CodingChallenge'
import McqChallenge from '../components/topic/McqChallenge'
import DescriptiveChallenge from '../components/topic/DescriptiveChallenge'
import { useAI } from '../hooks/useAI'
import { useSessionContext } from '../context/SessionContext'
import { hasApiKey } from '../services/openrouter'
import { normalizeTopicChallenge } from '../utils/topicChallenge'
import {
  buildCodingProblemPrompt,
  buildMcqPrompt,
  buildDescriptivePrompt,
} from '../utils/promptBuilder'

const DOMAINS = [
  { id:'dsa',           label:'DSA',           desc:'Data Structures & Algorithms', types:['coding','mcq','descriptive'] },
  { id:'react',         label:'React',          desc:'Hooks, state, performance',    types:['mcq','descriptive'] },
  { id:'javascript',    label:'JavaScript',     desc:'ES6+, async, closures',        types:['coding','mcq','descriptive'] },
  { id:'python',        label:'Python',         desc:'Syntax, OOP, stdlib',          types:['coding','mcq','descriptive'] },
  { id:'system-design', label:'System Design',  desc:'Scalability & architecture',   types:['descriptive'] },
  { id:'sql',           label:'SQL',            desc:'Queries, joins, indexes',      types:['coding','mcq','descriptive'] },
  { id:'oop',           label:'OOP',            desc:'Patterns & principles',        types:['mcq','descriptive'] },
  { id:'os',            label:'OS',             desc:'Processes, memory, scheduling',types:['mcq','descriptive'] },
  { id:'typescript',    label:'TypeScript',     desc:'Types, generics, config',      types:['mcq','descriptive'] },
  { id:'networks',      label:'Networks',       desc:'HTTP, TCP, protocols',         types:['mcq','descriptive'] },
  { id:'cpp',           label:'C++',            desc:'STL, memory, OOP',             types:['coding','mcq','descriptive'] },
  { id:'custom',        label:'Custom Topic',   desc:'Enter your own domain',        types:['coding','mcq','descriptive'], isCustom:true },
]

const TYPE_META = {
  coding:      { label:'CODING',      desc:'LeetCode-style problem + editor',  icon:'{ }' },
  mcq:         { label:'MCQ',         desc:'5 multiple choice questions',       icon:'○' },
  descriptive: { label:'DESCRIPTIVE', desc:'3 open-ended interview questions',  icon:'≡' },
}

const DIFFS = ['easy', 'medium', 'hard']

export default function TopicSession() {
  const [step, setStep] = useState('domain')
  const [domain, setDomain] = useState(null)
  const [customTopic, setCustomTopic] = useState('')
  const [subtopic, setSubtopic] = useState('')
  const [type, setType] = useState(null)
  const [diff, setDiff] = useState('medium')
  const [data, setData] = useState(null)
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const { runAI } = useAI()
  const { state } = useSessionContext()

  function getEffectiveDomain() {
    if (!domain?.isCustom) return domain?.label || ''
    const base = customTopic.trim() || 'general programming'
    return subtopic.trim() ? `${base} — ${subtopic.trim()}` : base
  }

  async function launch() {
    if (!hasApiKey()) { setError('Add your API key in Settings first.'); return }
    if (domain?.isCustom && !customTopic.trim()) return
    setError('')
    setStep('loading')
    try {
      const domLabel = getEffectiveDomain()
      let prompt
      if (type === 'mcq') prompt = buildMcqPrompt(domLabel)
      else if (type === 'descriptive') prompt = buildDescriptivePrompt(domLabel, diff)
      else prompt = buildCodingProblemPrompt(domLabel, diff)
      const result = await runAI(prompt.system, prompt.user, prompt.maxTokens)
      setData(normalizeTopicChallenge(type, result))
      setStep('challenge')
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'Add your API key in Settings first.'
        : e.message === 'INVALID_KEY' ? 'Your API key was rejected.' : e.message || 'Generation failed. Try again.')
      setStep('diff')
    }
  }

  function onResult(s, fb) { setScore(s); setFeedback(fb); setStep('result') }

  function reset() {
    setStep('domain'); setDomain(null); setCustomTopic(''); setSubtopic('')
    setType(null); setDiff('medium'); setData(null); setScore(null); setFeedback(null)
  }

  // ── challenge screens ──────────────────────────────────────────────
  if (step === 'loading') return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <div className="w-10 h-10 border-2 border-g-border border-t-lime animate-spin" style={{animationDuration:'0.8s'}}/>
        <div className="text-white/30 font-mono text-xs">generating {type} challenge…</div>
        <div className="text-white/15 font-mono text-xs">{getEffectiveDomain()} · {diff}</div>
      </div>
    </div>
  )

  if (step === 'challenge') return (
    type === 'coding'
      ? <CodingChallenge domain={{label:getEffectiveDomain()}} diff={diff} data={data} onResult={onResult}/>
      : type === 'mcq'
      ? <McqChallenge domain={{label:getEffectiveDomain()}} data={data} onResult={onResult}/>
      : <DescriptiveChallenge domain={{label:getEffectiveDomain()}} diff={diff} data={data} onResult={onResult}/>
  )

  if (step === 'result') return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-lime font-mono text-xs mb-3">// result</div>
        <div className={`font-mono font-bold mb-2 ${score>=70?'text-lime':score>=40?'text-yellow-400':'text-red-400'}`}
          style={{fontSize:'80px',lineHeight:1}}>
          {score}
        </div>
        <div className="text-white/25 font-mono text-xs mb-1">/100</div>
        <div className="text-white/30 font-mono text-xs mb-6">{getEffectiveDomain()} · {type} · {diff}</div>
        {feedback && (
          <div className="border border-g-border bg-g-900 px-5 py-4 text-white/45 font-mono text-xs leading-relaxed text-left mb-8">
            {feedback}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="px-5 py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors">
            PRACTICE AGAIN
          </button>
          <Link to="/dashboard"
            className="px-5 py-2.5 border border-g-border text-white/40 font-mono text-xs hover:text-white hover:border-g-hi transition-colors">
            DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  )

  // ── setup wizard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* step 1 — domain */}
        {step === 'domain' && (
          <div className="animate-slide-up">
            <div className="text-lime font-mono text-xs mb-1">// step 01</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-7">Choose Domain</h1>

            {/* 3-col grid — 12 items = 4 rows, even */}
            <div className="grid grid-cols-3 border border-g-border">
              {DOMAINS.map((d, i) => {
                const row = Math.floor(i / 3)
                const col = i % 3
                const totalRows = Math.ceil(DOMAINS.length / 3)
                const isLastRow = row === totalRows - 1
                const isLastCol = col === 2
                return (
                  <button key={d.id}
                    onClick={() => { setDomain(d); setStep(d.isCustom ? 'custom' : 'type') }}
                    className={`p-5 text-left hover:bg-g-800 transition-colors group
                      ${!isLastCol ? 'border-r border-g-border' : ''}
                      ${!isLastRow ? 'border-b border-g-border' : ''}`}>
                    <div className={`font-mono font-bold text-sm mb-1 transition-colors ${d.isCustom?'text-lime/70 group-hover:text-lime':'text-white group-hover:text-lime'}`}>
                      {d.isCustom ? '+ ' : ''}{d.label}
                    </div>
                    <div className="text-white/25 font-mono text-xs leading-relaxed">{d.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* step 1b — custom topic input */}
        {step === 'custom' && (
          <div className="animate-slide-up">
            <button onClick={()=>setStep('domain')} className="text-white/25 font-mono text-xs hover:text-white transition-colors mb-6 block">← back</button>
            <div className="text-lime font-mono text-xs mb-1">// custom topic</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-7">Your Topic</h1>

            <div className="border border-g-border bg-g-900 p-6 space-y-5">
              <div>
                <label className="text-white/30 font-mono text-xs block mb-2">domain / topic *</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="e.g. GraphQL, Redis, Docker, WebSockets…"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-white/30 font-mono text-xs block mb-2">subtopic <span className="text-white/15">(optional)</span></label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={e => setSubtopic(e.target.value)}
                  placeholder="e.g. mutations, caching, authentication…"
                  className="w-full bg-g-800 border border-g-border text-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-lime/50 placeholder-white/15 transition-colors"
                />
              </div>
              {customTopic.trim() && (
                <div className="border border-g-border px-4 py-3 bg-g-800">
                  <span className="text-white/25 font-mono text-xs">will generate: </span>
                  <span className="text-lime font-mono text-xs">{getEffectiveDomain()}</span>
                </div>
              )}
              <button
                onClick={() => customTopic.trim() && setStep('type')}
                disabled={!customTopic.trim()}
                className="w-full py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                CONTINUE →
              </button>
            </div>
          </div>
        )}

        {/* step 2 — type */}
        {step === 'type' && domain && (
          <div className="animate-slide-up">
            <button onClick={()=>setStep(domain.isCustom?'custom':'domain')} className="text-white/25 font-mono text-xs hover:text-white transition-colors mb-6 block">← back</button>
            <div className="text-lime font-mono text-xs mb-1">// step 02 · {getEffectiveDomain()}</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-7">Question Type</h1>

            <div className="border border-g-border">
              {domain.types.map((t, i) => (
                <button key={t}
                  onClick={() => { setType(t); setStep('diff') }}
                  className={`w-full flex items-center gap-5 px-6 py-5 text-left hover:bg-g-800 transition-colors group ${i < domain.types.length-1?'border-b border-g-border':''}`}>
                  <span className="text-lime/30 font-mono text-xl w-8 text-center group-hover:text-lime/60 transition-colors">{TYPE_META[t].icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-mono font-bold text-sm group-hover:text-lime transition-colors">{TYPE_META[t].label}</div>
                    <div className="text-white/30 font-mono text-xs mt-0.5">{TYPE_META[t].desc}</div>
                  </div>
                  <span className="text-white/20 group-hover:text-lime font-mono text-xs transition-colors">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* step 3 — difficulty */}
        {step === 'diff' && (
          <div className="animate-slide-up">
            <button onClick={()=>setStep('type')} className="text-white/25 font-mono text-xs hover:text-white transition-colors mb-6 block">← back</button>
            <div className="text-lime font-mono text-xs mb-1">// step 03 · {getEffectiveDomain()} · {TYPE_META[type]?.label}</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-7">Difficulty</h1>

            <div className="border border-g-border mb-6">
              {DIFFS.map((d, i) => (
                <button key={d}
                  onClick={() => setDiff(d)}
                  className={`w-full flex items-center justify-between px-6 py-5 font-mono transition-colors ${i<DIFFS.length-1?'border-b border-g-border':''}
                    ${diff===d?'bg-g-800 text-white border-l-2 border-lime':'text-white/40 hover:text-white hover:bg-g-800'}`}>
                  <div>
                    <div className="font-bold text-sm">{d.toUpperCase()}</div>
                    <div className="text-xs opacity-40 mt-0.5">
                      {d==='easy'?'fundamentals & basics':d==='medium'?'intermediate patterns':'advanced edge cases'}
                    </div>
                  </div>
                  {diff === d && <span className="text-lime text-xs">selected ✓</span>}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-400 font-mono text-xs border border-red-400/20 px-3 py-2 mb-3">
                {error} {/settings/i.test(error) && <Link to="/settings" className="underline">go →</Link>}
              </p>
            )}
            <button onClick={launch} disabled={state.isAILoading}
              className="w-full py-3.5 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-40 transition-colors">
              {state.isAILoading ? 'generating…' : 'GENERATE CHALLENGE →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
