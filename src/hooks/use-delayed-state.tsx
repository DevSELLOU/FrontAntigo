import { useEffect, useRef, useState } from 'react'

export function useDelayedState(initialValue: string, delay: number = 300): [string, (value: string) => void, string] {
  const [state, setState] = useState<string>(initialValue)
  const [delayedState, setDelayedState] = useState<string>(initialValue)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestStateRef = useRef(state)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current as NodeJS.Timeout)
    }

    latestStateRef.current = state

    timeoutRef.current = setTimeout(() => {
      setDelayedState(latestStateRef.current)
    }, delay)

    return () => {
      clearTimeout(timeoutRef.current as NodeJS.Timeout)
    }
  }, [state, delay])

  return [state, setState, delayedState]
}
