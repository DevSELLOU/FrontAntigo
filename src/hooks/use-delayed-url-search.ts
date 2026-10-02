'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useDelayedState } from './use-delayed-state'

/**
 * Debounced search bound to the `query` URL param, same pattern as `products/index.tsx` and
 * `orders/index.tsx` — but with the page-reset bug from those two fixed here: they always write
 * `page=1` unless the URL already has a `page`, which means searching while on page 3 keeps
 * `page=3` and can render an empty list. This version only skips the reset on the very first
 * render (the mount-time sync of the initial URL value into state), and resets unconditionally
 * on every search after that.
 */
export function useDelayedUrlSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery, delayedQuery] = useDelayedState(searchParams.get('query') || '')
  const isFirstRender = useRef(true)

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (delayedQuery) {
      current.set('query', delayedQuery)
    } else {
      current.delete('query')
    }

    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      current.set('page', '1')
    }

    router.push('?' + current.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayedQuery])

  return { query, setQuery }
}
