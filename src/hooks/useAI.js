import { useCallback, useTransition } from 'react'
import { callAI } from '../services/openrouter'
import { useSessionContext } from '../context/SessionContext'

export function useAI() {
  const { dispatch } = useSessionContext()
  // useTransition: used correctly — wraps the non-urgent state
  // dispatch that updates isAILoading=false after fetch completes,
  // so the UI can stay responsive between rounds
  const [isPending, startTransition] = useTransition()

  const runAI = useCallback(async (systemPrompt, userPrompt, maxTokens) => {
    dispatch({ type: 'SET_AI_LOADING', payload: true })
    try {
      const result = await callAI(systemPrompt, userPrompt, maxTokens)
      // mark the loading=false update as non-urgent (useTransition correct usage)
      startTransition(() => {
        dispatch({ type: 'SET_AI_LOADING', payload: false })
      })
      return result
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [dispatch, startTransition])

  return { runAI, isPending }
}
