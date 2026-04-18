import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ScoreRing from '../components/ui/ScoreRing'
import ScoreBreakdown from '../components/report/ScoreBreakdown'
import StudyRoadmap from '../components/report/StudyRoadmap'
import CodeFixes from '../components/report/CodeFixes'
import QuestionReplay from '../components/report/QuestionReplay'
import { useSessionContext } from '../context/SessionContext'
import { useSession } from '../hooks/useSession'
import { getGrade } from '../utils/scoreCalculator'

export default function Report() {
  const { sessionId } = useParams()
  const { state } = useSessionContext()
  const { loadSession } = useSession()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!state.finalReport && sessionId) {
      setLoading(true)
      loadSession(sessionId).finally(() => setLoading(false))
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-arena-950 flex items-center justify-center">
        <p className="text-white/40 text-sm font-mono animate-pulse">Loading report...</p>
      </div>
    )
  }

  const report = state.finalReport
  if (!report) {
    return (
      <div className="min-h-screen bg-arena-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 text-sm">Report not found.</p>
        <Link to="/dashboard" className="text-amber-400 text-sm hover:text-amber-300 transition-colors">← Dashboard</Link>
      </div>
    )
  }

  const grade = getGrade(report.overallScore)

  return (
    <div className="min-h-screen bg-arena-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Session Report</h1>
            <p className="text-white/30 text-sm">{state.difficulty} difficulty · {state.language}</p>
          </div>
          <Link to="/dashboard" className="text-white/30 hover:text-white text-xs transition-colors">← Dashboard</Link>
        </div>

        <div className="bg-arena-800 border border-arena-border rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex gap-6">
              <ScoreRing score={report.overallScore} color={grade.ring} label="Overall" size={120} />
              <div className="hidden md:flex gap-4">
                <ScoreRing score={report.interviewScore} color="#60a5fa" label="Interview" size={90} />
                <ScoreRing score={report.codeScore} color="#a78bfa" label="Code" size={90} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-4xl font-bold ${grade.color}`}>{grade.grade}</span>
                <span className={`text-sm font-semibold ${grade.color}`}>{grade.label}</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{report.verdict}</p>
              {report.weakConcepts?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {report.weakConcepts.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-red-400/10 border border-red-400/20 text-red-300 text-xs rounded-full font-mono">
                      ⚠ {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex md:hidden gap-4 justify-center mt-6">
            <ScoreRing score={report.interviewScore} color="#60a5fa" label="Interview" size={90} />
            <ScoreRing score={report.codeScore} color="#a78bfa" label="Code" size={90} />
          </div>
        </div>

        <ScoreBreakdown breakdown={report.breakdown} />
        <QuestionReplay rounds={state.rounds} />
        <CodeFixes fixes={report.codeFixSuggestions} />
        <StudyRoadmap roadmap={report.studyRoadmap} />

        <div className="flex gap-4 pt-4">
          <Link
            to="/session/new"
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-center text-sm transition-colors"
          >
            New Session →
          </Link>
          <Link
            to="/history"
            className="px-6 py-3 border border-arena-border hover:border-arena-border-light text-white/50 hover:text-white rounded-xl text-sm transition-colors"
          >
            History
          </Link>
        </div>
      </div>
    </div>
  )
}
