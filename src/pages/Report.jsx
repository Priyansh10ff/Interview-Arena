import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ScoreRing from '../components/ui/ScoreRing'
import ScoreBreakdown from '../components/report/ScoreBreakdown'
import StudyRoadmap from '../components/report/StudyRoadmap'
import CodeFixes from '../components/report/CodeFixes'
import QuestionReplay from '../components/report/QuestionReplay'
import Loader from '../components/ui/Loader'
import { useSessionContext } from '../context/SessionContext'
import { useSession } from '../hooks/useSession'
import { getGrade } from '../utils/scoreCalculator'

export default function Report() {
  const { sessionId } = useParams()
  const { state } = useSessionContext()
  const { loadSession } = useSession()
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(!state.finalReport&&sessionId){
      setLoading(true)
      loadSession(sessionId).finally(()=>setLoading(false))
    }
  },[sessionId])

  if(loading) return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar/>
      <div className="flex-1 flex items-center justify-center">
        <Loader message="loading report..."/>
      </div>
    </div>
  )

  const report=state.finalReport
  if(!report) return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar/>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-white/30 font-mono text-xs">report not found.</p>
        <Link to="/dashboard" className="text-lime font-mono text-xs hover:text-lime-dim transition-colors">← dashboard</Link>
      </div>
    </div>
  )

  const grade=getGrade(report.overallScore)

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lime font-mono text-xs mb-1">// session report</div>
            <div className="text-white/30 font-mono text-xs">{state.difficulty} · {state.language}</div>
          </div>
          <Link to="/dashboard" className="text-white/25 font-mono text-xs hover:text-white transition-colors">← dashboard</Link>
        </div>

        {/* hero score block */}
        <div className="border border-g-border bg-g-900">

          {/* scores row — equal sizes */}
          <div className="grid grid-cols-3 divide-x divide-g-border border-b border-g-border">
            <div className="py-6 flex flex-col items-center justify-center gap-3">
              <ScoreRing score={report.overallScore} color={grade.ring} size={110} label="overall"/>
            </div>
            <div className="py-6 flex flex-col items-center justify-center gap-3">
              <ScoreRing score={report.interviewScore} color="#facc15" size={110} label="interview"/>
            </div>
            <div className="py-6 flex flex-col items-center justify-center gap-3">
              <ScoreRing score={report.codeScore} color="#a8ff3e" size={110} label="code"/>
            </div>
          </div>

          {/* grade + verdict */}
          <div className="p-6">
            <div className="flex items-baseline gap-3 mb-3">
              <span className={`font-mono font-bold text-5xl ${grade.color}`}>{grade.grade}</span>
              <span className={`font-mono text-sm ${grade.color}`}>{grade.label}</span>
            </div>
            <p className="text-white/55 font-mono text-xs leading-relaxed">{report.verdict}</p>
            {report.weakConcepts?.length>0&&(
              <div className="flex flex-wrap gap-2 mt-4">
                {report.weakConcepts.map((c,i)=>(
                  <span key={i} className="border border-red-400/30 text-red-400/70 font-mono text-xs px-2.5 py-1">
                    ✕ {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* sections — all share the same top border */}
        <ScoreBreakdown breakdown={report.breakdown}/>
        <QuestionReplay rounds={state.rounds}/>
        <CodeFixes fixes={report.codeFixSuggestions}/>
        <StudyRoadmap roadmap={report.studyRoadmap}/>

        {/* actions */}
        <div className="border border-t-0 border-g-border grid grid-cols-2 divide-x divide-g-border">
          <Link to="/session/new"
            className="py-4 bg-lime text-black font-bold font-mono text-sm text-center hover:bg-lime-dim transition-colors">
            NEW SESSION →
          </Link>
          <Link to="/history"
            className="py-4 text-white/40 font-mono text-sm text-center hover:bg-g-800 hover:text-white transition-colors">
            HISTORY
          </Link>
        </div>
      </div>
    </div>
  )
}
