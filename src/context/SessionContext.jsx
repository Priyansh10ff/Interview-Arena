import { createContext, useContext, useReducer } from 'react'

const SessionContext = createContext(null)

const init = {
  sessionId: null,
  phase: 'idle',
  difficulty: 'mid',
  codeSnippet: '',
  language: 'javascript',
  codeReview: null,
  questions: [],
  currentRound: 0,
  rounds: [],
  finalReport: null,
  isAILoading: false,
  error: null,
}

function derivePhase(s) {
  if (s.finalReport) return 'report'
  if (s.questions?.length && s.rounds != null) return 'interviewing'
  if (s.codeReview) return 'reviewing'
  return 'idle'
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION_ID': return { ...state, sessionId: action.payload }
    case 'SET_PHASE': return { ...state, phase: action.payload }
    case 'SET_CODE': return { ...state, codeSnippet: action.payload.code, language: action.payload.language }
    case 'SET_DIFFICULTY': return { ...state, difficulty: action.payload }
    case 'SET_CODE_REVIEW': return { ...state, codeReview: action.payload, phase: 'reviewing' }
    case 'SET_QUESTIONS': return { ...state, questions: action.payload, phase: 'interviewing', currentRound: 0 }
    case 'ADD_ROUND': return { ...state, rounds: [...state.rounds, action.payload], currentRound: state.currentRound + 1 }
    case 'SET_FINAL_REPORT': return { ...state, finalReport: action.payload, phase: 'report' }
    case 'SET_AI_LOADING': return { ...state, isAILoading: action.payload }
    case 'SET_ERROR': return { ...state, error: action.payload, isAILoading: false }
    case 'RESET': return init
    // atomic load — replaces multiple dispatches, avoids stale reads
    case 'LOAD_SESSION': {
      const s = action.payload
      const rounds = s.rounds || []
      const questions = s.questions || []
      return {
        ...init,
        sessionId: s.id,
        codeSnippet: s.codeSnippet || '',
        language: s.language || 'javascript',
        difficulty: s.difficulty || 'mid',
        codeReview: s.codeReview || null,
        questions,
        rounds,
        currentRound: rounds.length,
        finalReport: s.finalReport || null,
        phase: derivePhase(s),
      }
    }
    default: return state
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)
  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = () => useContext(SessionContext)
