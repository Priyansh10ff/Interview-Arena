import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const STEPS = [
  { n:'01', title:'paste code', desc:'Drop any snippet. We review it instantly — health score, severity-ranked issues, refactored version.' },
  { n:'02', title:'get grilled', desc:'5 AI questions generated from YOUR specific code. Not generic theory — your actual logic, your choices.' },
  { n:'03', title:'full report', desc:'Grade + score breakdown + code fixes + personalised study roadmap. Know exactly what to fix next.' },
]

export default function Landing() {
  const { user } = useAuthContext()
  return (
    <div className="min-h-screen bg-g-950 grid-bg">
      {/* nav */}
      <nav className="border-b border-g-border px-6 h-12 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-lime font-bold font-mono text-sm">[IA]</span>
        <div className="flex gap-4">
          {user
            ? <Link to="/dashboard" className="px-3 py-1 bg-lime text-black text-xs font-bold font-mono">dashboard →</Link>
            : <>
                <Link to="/login" className="text-white/40 hover:text-white text-xs font-mono transition-colors">login</Link>
                <Link to="/signup" className="px-3 py-1 bg-lime text-black text-xs font-bold font-mono hover:bg-lime-dim transition-colors">get started →</Link>
              </>
          }
        </div>
      </nav>

      {/* hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 border border-g-border px-3 py-1 text-white/40 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse-lime" />
          AI-POWERED CODE INTERVIEW TRAINER
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-mono leading-none tracking-tight mb-6">
          GET INTER-<br/>
          <span className="text-lime">VIEWED</span> ON<br/>
          YOUR CODE<span className="cursor" />
        </h1>

        <p className="text-white/40 font-mono text-sm leading-relaxed max-w-lg mb-10">
          Paste any snippet → AI reviews it → grills you with 5 questions → hands you a full improvement report with code fixes &amp; study roadmap.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link to="/signup" className="px-6 py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim transition-colors">
            START FREE →
          </Link>
          <Link to="/topic" className="px-6 py-3 border border-g-border text-white/50 hover:text-white font-mono text-sm hover:border-g-hi transition-colors">
            PRACTICE BY TOPIC
          </Link>
        </div>
      </div>

      {/* steps */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-g-border pt-12 grid grid-cols-1 md:grid-cols-3 gap-0">
          {STEPS.map((s,i) => (
            <div key={i} className={`p-6 border-g-border ${i < 2 ? 'md:border-r' : ''} ${i > 0 ? 'border-t md:border-t-0' : ''}`}>
              <div className="text-lime/40 font-mono text-xs mb-3">{s.n}</div>
              <div className="text-white font-mono font-bold text-sm mb-2 uppercase tracking-wide">{s.title}</div>
              <div className="text-white/35 font-mono text-xs leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
