import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import TypingIndicator from '../components/ui/TypingIndicator'
import VoiceInput from '../components/ui/VoiceInput'
import CodeReviewCard from '../components/review/CodeReviewCard'
import QuestionCard from '../components/interview/QuestionCard'
import RoundCounter from '../components/interview/RoundCounter'
import { useSessionContext } from '../context/SessionContext'
import { useAI } from '../hooks/useAI'
import { useSession } from '../hooks/useSession'
import {
  buildCodeReviewPrompt,
  buildQuestionsPrompt,
  buildEvaluationPrompt,
  buildFinalReportPrompt,
} from '../utils/promptBuilder'
import { calcInterviewScore, calcOverallScore, getScoreColor } from '../utils/scoreCalculator'

export default function Session() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useSessionContext()
  const { runAI } = useAI()
  const { saveCodeReview, saveQuestions, saveRound, saveFinalReport, loadSession } = useSession()
  const [answer, setAnswer] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [showingResult, setShowingResult] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [genReport, setGenReport] = useState(false)
  // keep a ref to accumulated rounds so generateFinalReport never reads stale state
  const roundsRef = useRef([])

  // ── on mount: decide whether to load from DB or start fresh review ─
  useEffect(() => {
    async function init() {
      // already loaded correct session — nothing to do
      if (state.sessionId === sessionId && state.phase !== 'idle') return

      // need to load from Firestore (navigating to existing session)
      if (state.sessionId !== sessionId || !state.codeSnippet) {
        setInitLoading(true)
        const session = await loadSession(sessionId)
        setInitLoading(false)
        if (!session) { navigate('/dashboard', { replace: true }); return }
        if (session.status === 'completed') {
          navigate(`/report/${sessionId}`, { replace: true }); return
        }
        // has code but no review yet — start review
        if (!session.codeReview && session.codeSnippet) {
          runCodeReview(session.codeSnippet, session.language, session.difficulty, sessionId)
        }
        return
      }

      // fresh session just created in NewSession — kick off review
      if (state.phase === 'idle' && state.codeSnippet) {
        runCodeReview(state.codeSnippet, state.language, state.difficulty, sessionId)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // keep roundsRef in sync with context
  useEffect(() => { roundsRef.current = state.rounds }, [state.rounds])

  // ── AI phase functions ────────────────────────────────────────────
  async function runCodeReview(code, lang, diff, sid) {
    const c = code || state.codeSnippet
    const l = lang || state.language
    const d = diff || state.difficulty
    const s = sid || state.sessionId
    dispatch({ type: 'SET_PHASE', payload: 'reviewing' })
    try {
      const { system, user, maxTokens } = buildCodeReviewPrompt(c, l, d)
      const review = await runAI(system, user, maxTokens)
      await saveCodeReview(review, s)
    } catch (err) {
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message })
      }
    }
  }

  async function handleStartInterview() {
    const review = state.codeReview
    const summary = `Health:${review.healthScore}. Issues:${review.issues?.map(i => i.description.slice(0,60)).join(';') || 'none'}. Topics:${review.topicsToStudy?.join(',') || 'none'}`
    try {
      const { system, user, maxTokens } = buildQuestionsPrompt(state.codeSnippet, summary, state.difficulty)
      const result = await runAI(system, user, maxTokens)
      if (!result.questions?.length) throw new Error('No questions returned. Try again.')
      await saveQuestions(result.questions, state.sessionId)
    } catch (err) {
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message })
      }
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim() || state.isAILoading) return
    const roundIndex = state.currentRound
    const currentQ = state.questions[roundIndex]
    if (!currentQ) return

    const answeredText = answer
    setAnswer('')
    const isLast = roundIndex + 1 >= state.questions.length

    try {
      const { system, user, maxTokens } = buildEvaluationPrompt(currentQ.question, currentQ.concept, answeredText, state.difficulty)
      const evaluation = await runAI(system, user, maxTokens)

      const roundData = {
        question: currentQ.question,
        concept: currentQ.concept,
        userAnswer: answeredText,
        aiFeedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        score: Math.min(10, Math.max(1, Number(evaluation.score) || 5)),
      }

      // pass current roundsRef to avoid stale closure
      await saveRound(roundData, roundsRef.current, state.sessionId)
      setLastResult(roundData)
      setShowingResult(true)

      if (isLast) setGenReport(true) // signal: show Generate Report button
    } catch (err) {
      setAnswer(answeredText) // restore answer on error
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message })
      }
    }
  }

  async function handleGenerateReport() {
    setGenReport(false)
    setShowingResult(false)
    const allRounds = roundsRef.current
    try {
      const { system, user, maxTokens } = buildFinalReportPrompt(state.codeSnippet, state.codeReview, allRounds, state.difficulty)
      const report = await runAI(system, user, maxTokens)
      const interviewScore = calcInterviewScore(allRounds)
      const overallScore = calcOverallScore(interviewScore, state.codeReview.healthScore)
      await saveFinalReport({ ...report, interviewScore, codeScore: state.codeReview.healthScore, overallScore }, state.sessionId)
      navigate(`/report/${state.sessionId}`)
    } catch (err) {
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message })
      }
    }
  }

  function handleNext() {
    setShowingResult(false)
    setLastResult(null)
  }

  function handleVoiceTranscript(text) {
    setAnswer(prev => prev ? prev.trimEnd() + ' ' + text : text)
  }

  // ── guards ─────────────────────────────────────────────────────────
  if (state.error) {
    const isKeyError = state.error === 'NO_KEY' || state.error === 'INVALID_KEY'
    const msg = state.error === 'NO_KEY'
      ? 'No API key. Click the red pill in the navbar to add your key.'
      : state.error === 'INVALID_KEY'
      ? 'API key rejected. Check your key has credits.'
      : state.error
    return (
      <div className="min-h-screen bg-arena-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="text-3xl">{isKeyError ? '🔑' : '⚠️'}</div>
          <p className="text-red-400 text-sm max-w-sm">{msg}</p>
          {!isKeyError && (
            <button
              onClick={() => { dispatch({ type: 'SET_ERROR', payload: null }) }}
              className="px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg"
            >Retry</button>
          )}
        </div>
      </div>
    )
  }

  if (initLoading) {
    return (
      <div className="min-h-screen bg-arena-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Loading session..." />
        </div>
      </div>
    )
  }

  if ((state.phase === 'idle' || (state.phase === 'reviewing' && !state.codeReview)) && state.isAILoading) {
    return (
      <div className="min-h-screen bg-arena-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Analysing your code…" />
        </div>
      </div>
    )
  }

  // ── Phase 1: Review ────────────────────────────────────────────────
  if (state.phase === 'reviewing' && state.codeReview) {
    return (
      <div className="min-h-screen bg-arena-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <CodeReviewCard
            review={state.codeReview}
            onStartInterview={handleStartInterview}
            isLoading={state.isAILoading}
          />
        </div>
      </div>
    )
  }

  // ── generating questions loader ────────────────────────────────────
  if (state.phase === 'reviewing' && state.isAILoading) {
    return (
      <div className="min-h-screen bg-arena-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Preparing your interview…" />
        </div>
      </div>
    )
  }

  // ── Phase 2: Interview ─────────────────────────────────────────────
  if (state.phase === 'interviewing') {
    const total = state.questions.length || 5
    const displayRound = Math.min(state.currentRound + 1, total)
    const currentQ = state.questions[state.currentRound]

    // full-screen loader while evaluating answer
    if (state.isAILoading && !lastResult) {
      return (
        <div className="min-h-screen bg-arena-950 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader message="Evaluating your answer…" />
          </div>
        </div>
      )
    }

    // generating final report
    if (state.isAILoading && !currentQ) {
      return (
        <div className="min-h-screen bg-arena-950 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader message="Generating your report…" />
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-arena-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
          <RoundCounter
            current={displayRound}
            total={total}
            rounds={state.rounds}
          />

          {/* Question + answer input */}
          {!showingResult && currentQ && (
            <div className="animate-slide-up space-y-4">
              <QuestionCard question={currentQ} roundNumber={displayRound} />

              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here… or use the mic below."
                className="w-full h-44 bg-arena-800 border border-arena-border text-white placeholder-white/20 rounded-xl p-5 resize-none focus:outline-none focus:border-amber-500/50 text-sm leading-relaxed"
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    disabled={state.isAILoading}
                  />
                  <span className="text-white/20 text-xs font-mono">{answer.length} chars</span>
                </div>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || state.isAILoading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors text-sm"
                >
                  Submit →
                </button>
              </div>
            </div>
          )}

          {/* Round result card */}
          {showingResult && lastResult && (
            <div className="animate-slide-up bg-arena-800 border border-arena-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs font-mono mb-0.5">
                    Round {state.rounds.length} Score
                  </p>
                  <span className={`text-3xl font-bold font-mono ${getScoreColor(lastResult.score * 10)}`}>
                    {lastResult.score}<span className="text-lg text-white/20">/10</span>
                  </span>
                </div>
                <span className="px-3 py-1 bg-arena-600 border border-arena-border text-white/40 text-xs font-mono rounded-full">
                  {lastResult.concept}
                </span>
              </div>

              <div>
                <p className="text-amber-400 text-xs font-mono uppercase mb-1.5">Feedback</p>
                <p className="text-white/70 text-sm leading-relaxed">{lastResult.aiFeedback}</p>
              </div>

              <details>
                <summary className="text-emerald-400 text-xs font-mono uppercase cursor-pointer hover:text-emerald-300 transition-colors">
                  View Ideal Answer ▾
                </summary>
                <p className="mt-2 text-white/50 text-sm pl-4 border-l border-emerald-400/30 italic leading-relaxed">
                  {lastResult.idealAnswer}
                </p>
              </details>

              {/* Next round or generate report */}
              {genReport ? (
                <button
                  onClick={handleGenerateReport}
                  disabled={state.isAILoading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl transition-colors text-sm"
                >
                  {state.isAILoading ? '⏳ Generating report…' : '📊 Get Full Report →'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors text-sm"
                >
                  Next Round →
                </button>
              )}
            </div>
          )}

          {/* Loading indicator inline */}
          {state.isAILoading && lastResult && (
            <div className="flex justify-center pt-2">
              <TypingIndicator label="Working…" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // phase === 'report' — redirect (shouldn't normally land here)
  if (state.phase === 'report' && state.sessionId) {
    navigate(`/report/${state.sessionId}`, { replace: true })
    return null
  }

  // fallback loading state
  return (
    <div className="min-h-screen bg-arena-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader message="Loading…" />
      </div>
    </div>
  )
}
