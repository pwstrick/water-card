import { useCallback, useEffect, useState } from 'react'

const AUTO_RETRY_DELAYS = [1000, 2000]

export default function useImageRetry(loadState, source) {
  const [attempt, setAttempt] = useState(0)
  const [autoRetryCount, setAutoRetryCount] = useState(0)

  useEffect(() => {
    setAttempt(0)
    setAutoRetryCount(0)
  }, [source])

  useEffect(() => {
    if (loadState !== 'error' || autoRetryCount >= AUTO_RETRY_DELAYS.length) return undefined

    const timer = window.setTimeout(() => {
      setAutoRetryCount((count) => count + 1)
      setAttempt((value) => value + 1)
    }, AUTO_RETRY_DELAYS[autoRetryCount])

    return () => window.clearTimeout(timer)
  }, [autoRetryCount, loadState])

  const retry = useCallback(() => {
    setAutoRetryCount(AUTO_RETRY_DELAYS.length)
    setAttempt((value) => value + 1)
  }, [])

  return {
    attempt,
    retry,
    isAutoRetrying: loadState === 'error' && autoRetryCount < AUTO_RETRY_DELAYS.length,
  }
}
