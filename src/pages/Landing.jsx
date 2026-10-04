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
        <div className="flex gap-4 items-center">
          <Link to="/pricing" className="text-white/40 hover:text-white text-xs font-mono transition-colors">pricing</Link>
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
          <Link to="/arena" className="px-6 py-3 border border-lime/40 text-lime font-mono text-sm hover:bg-g-800 transition-colors">
            COMPANY ROUNDS
          </Link>
          <Link to="/topic" className="px-6 py-3 border border-g-border text-white/50 hover:text-white font-mono text-sm hover:border-g-hi transition-colors">
            PRACTICE BY TOPIC
          </Link>
        </div>
      </div>

      {/* arena pro */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="border border-lime/30 bg-g-900 p-8">
          <div className="text-lime font-mono text-xs mb-3">// new · arena pro</div>
          <h2 className="text-white font-mono font-bold text-2xl md:text-3xl leading-tight mb-3">
            Real company rounds.<br />A live interviewer that talks back.
          </h2>
          <p className="text-white/40 font-mono text-xs leading-relaxed max-w-xl mb-5">
            Flipkart machine coding. Amazon bar raiser. Razorpay LLD. Google phone screen. The AI plays the interviewer,
            pushes on vague answers, throws a mid-round twist, then writes a rubric scorecard with a hire / no-hire verdict.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['Google', 'Amazon', 'Microsoft', 'Atlassian', 'Flipkart', 'Razorpay', 'Swiggy', 'Uber', 'AI startups'].map(c => (
              <span key={c} className="border border-g-border text-white/50 font-mono text-xs px-2 py-0.5">{c}</span>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to={user ? '/arena' : '/signup'} className="px-5 py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim">
              TRY 3 ROUNDS FREE →
            </Link>
            <Link to="/pricing" className="px-5 py-2.5 border border-g-border text-white/50 hover:text-white font-mono text-xs">
              PRO · ₹299/MONTH
            </Link>
          </div>
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
