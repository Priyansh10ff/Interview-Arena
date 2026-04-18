import { useCallback } from 'react'
import { callAI } from '../services/openrouter'
import { useSessionContext } from '../context/SessionContext'

export function useAI() {
  const { dispatch } = useSessionContext()

  const runAI = useCallback(async (systemPrompt, userPrompt, maxTokens) => {
    dispatch({ type: 'SET_AI_LOADING', payload: true })
    try {
      const result = await callAI(systemPrompt, userPrompt, maxTokens)
      dispatch({ type: 'SET_AI_LOADING', payload: false })
      return result
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [dispatch])

  return { runAI }
}
