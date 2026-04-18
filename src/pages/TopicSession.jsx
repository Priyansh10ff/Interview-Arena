import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import CodingChallenge from '../components/topic/CodingChallenge'
import McqChallenge from '../components/topic/McqChallenge'
import DescriptiveChallenge from '../components/topic/DescriptiveChallenge'
import { useAI } from '../hooks/useAI'
import { useSessionContext } from '../context/SessionContext'
import { hasApiKey } from '../services/openrouter'
import {
  buildCodingProblemPrompt,
  buildMcqPrompt,
  buildDescriptivePrompt,
} from '../utils/promptBuilder'

const DOMAINS = [
  { id:'dsa', label:'DSA', desc:'Data Structures & Algorithms', types:['coding','mcq','descriptive'] },
  { id:'react', label:'React', desc:'Hooks, state, performance', types:['mcq','descriptive'] },
  { id:'javascript', label:'JavaScript', desc:'ES6+, async, closures', types:['coding','mcq','descriptive'] },
  { id:'python', label:'Python', desc:'Syntax, OOP, stdlib', types:['coding','mcq','descriptive'] },
  { id:'system-design', label:'System Design', desc:'Scalability & architecture', types:['descriptive'] },
  { id:'sql', label:'SQL', desc:'Queries, joins, indexes', types:['coding','mcq','descriptive'] },
  { id:'oop', label:'OOP', desc:'Patterns & principles', types:['mcq','descriptive'] },
  { id:'os', label:'OS', desc:'Processes, memory, scheduling', types:['mcq','descriptive'] },
  { id:'typescript', label:'TypeScript', desc:'Types, generics, config', types:['mcq','descriptive'] },
  { id:'networks', label:'Networks', desc:'HTTP, TCP, protocols', types:['mcq','descriptive'] },
]

const TYPE_META = {
  coding:{ label:'CODING', desc:'Write code — LeetCode style', icon:'{ }' },
  mcq:{ label:'MCQ', desc:'5 multiple choice questions', icon:'○' },
  descriptive:{ label:'DESCRIPTIVE', desc:'3 open-ended interview Qs', icon:'≡' },
}

const DIFFS = ['easy','medium','hard']

export default function TopicSession() {
  const [step, setStep] = useState('domain')   // domain | type | diff | loading | challenge | result
  const [domain, setDomain] = useState(null)
  const [type, setType] = useState(null)
  const [diff, setDiff] = useState('medium')
  const [data, setData] = useState(null)         // challenge data from AI
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const { runAI } = useAI()
  const { state } = useSessionContext()

  async function launch() {
    if (!hasApiKey()) {
      alert('Add your API key in Settings first.')
      return
    }
    setStep('loading')
    try {
      let prompt
      if (type === 'mcq') prompt = buildMcqPrompt(domain.label)
      else if (type === 'descriptive') prompt = buildDescriptivePrompt(domain.label, diff)
      else prompt = buildCodingProblemPrompt(domain.label, diff)

      const result = await runAI(prompt.system, prompt.user, prompt.maxTokens)
      setData(result)
      setStep('challenge')
    } catch {
      setStep('diff')
    }
  }

  function onResult(s, fb) {
    setScore(s)
    setFeedback(fb)
    setStep('result')
  }

  function reset() {
    setStep('domain'); setDomain(null); setType(null)
    setDiff('medium'); setData(null); setScore(null); setFeedback(null)
  }

  if (step === 'loading') return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-lime font-mono text-xs animate-pulse">generating challenge...</div>
        <div className="w-48 h-px bg-g-border overflow-hidden">
          <div className="h-full bg-lime w-full animate-[scan_1s_linear_infinite]" />
        </div>
      </div>
    </div>
  )

  if (step === 'challenge') return (
    type === 'coding'
      ? <CodingChallenge domain={domain} diff={diff} data={data} onResult={onResult} />
      : type === 'mcq'
      ? <McqChallenge domain={domain} data={data} onResult={onResult} />
      : <DescriptiveChallenge domain={domain} diff={diff} data={data} onResult={onResult} />
  )

  if (step === 'result') return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-lime text-xs font-mono mb-2">// result</div>
        <div className={`font-mono font-bold text-7xl mb-2 ${score>=70?'text-lime':score>=40?'text-yellow-400':'text-red-400'}`}>
          {score}<span className="text-2xl text-white/20">/100</span>
        </div>
        <div className="text-white/50 font-mono text-xs mb-1">{domain?.label} · {type} · {diff}</div>
        {feedback && <p className="text-white/50 font-mono text-xs leading-relaxed mt-4 max-w-sm mx-auto border border-g-border px-4 py-3">{feedback}</p>}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={reset} className="px-5 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors">PRACTICE AGAIN</button>
          <Link to="/dashboard" className="px-5 py-2 border border-g-border text-white/40 font-mono text-xs hover:text-white hover:border-g-hi transition-colors">DASHBOARD</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Step: domain */}
        {step === 'domain' && (
          <div className="animate-slide-up">
            <div className="text-lime text-xs font-mono mb-1">// step 01</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-6">Choose Domain</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border border-g-border">
              {DOMAINS.map((d,i) => (
                <button key={d.id} onClick={() => { setDomain(d); setStep('type') }}
                  className={`p-4 text-left border-g-border hover:bg-g-800 transition-colors group
                    ${i%3!==2?'border-r':''} ${i<DOMAINS.length-3?'border-b':''}`}>
                  <div className="text-white font-mono font-bold text-sm group-hover:text-lime transition-colors">{d.label}</div>
                  <div className="text-white/25 font-mono text-xs mt-0.5 leading-relaxed">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: type */}
        {step === 'type' && domain && (
          <div className="animate-slide-up">
            <button onClick={()=>setStep('domain')} className="text-white/25 font-mono text-xs hover:text-white transition-colors mb-6 block">← back</button>
            <div className="text-lime text-xs font-mono mb-1">// step 02 · {domain.label}</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-6">Question Type</h1>
            <div className="grid grid-cols-1 gap-0 border border-g-border">
              {domain.types.map((t,i) => (
                <button key={t} onClick={() => { setType(t); setStep('diff') }}
                  className={`flex items-center gap-5 px-5 py-5 text-left hover:bg-g-800 transition-colors group ${i<domain.types.length-1?'border-b border-g-border':''}`}>
                  <span className="text-2xl font-mono text-lime/40 w-8 text-center">{TYPE_META[t].icon}</span>
                  <div>
                    <div className="text-white font-mono font-bold text-sm group-hover:text-lime transition-colors">{TYPE_META[t].label}</div>
                    <div className="text-white/30 font-mono text-xs mt-0.5">{TYPE_META[t].desc}</div>
                  </div>
                  <span className="ml-auto text-white/20 group-hover:text-lime transition-colors font-mono text-xs">select →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: difficulty */}
        {step === 'diff' && (
          <div className="animate-slide-up">
            <button onClick={()=>setStep('type')} className="text-white/25 font-mono text-xs hover:text-white transition-colors mb-6 block">← back</button>
            <div className="text-lime text-xs font-mono mb-1">// step 03 · {domain?.label} · {TYPE_META[type]?.label}</div>
            <h1 className="text-white font-bold font-mono text-2xl mb-6">Difficulty</h1>
            <div className="grid grid-cols-3 gap-0 border border-g-border mb-6">
              {DIFFS.map((d,i)=>(
                <button key={d} onClick={()=>setDiff(d)}
                  className={`py-5 font-mono font-bold text-sm border-r border-g-border last:border-r-0 transition-colors ${diff===d?'bg-lime text-black':'text-white/40 hover:text-white hover:bg-g-800'}`}>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
            {state.isAILoading
              ? <div className="text-lime font-mono text-xs animate-pulse text-center py-4">loading...</div>
              : <button onClick={launch} className="w-full py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim transition-colors">
                  GENERATE CHALLENGE →
                </button>
            }
          </div>
        )}
      </div>
    </div>
  )
}
