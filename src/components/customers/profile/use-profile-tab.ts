'use client'

import { parseProfileTab, type ProfileTab } from '@/utils/customers/profile-tab.util'
import { useCallback, useState } from 'react'

/**
 * Profile tab state, optionally reflected in the URL.
 *
 * The URL is written with `window.history.replaceState`, never `router.push`. The profile page is
 * a server component that fires six requests on every render; pushing a new `searchParams` would
 * re-run all of them, so merely switching tabs would cost six round trips. `replaceState` has
 * been supported for this since Next 14.1 (the project is on 14.2.13) and leaves the server tree
 * untouched. If it ever stops reflecting in the URL, the fallback is plain local state — not
 * `router.push`.
 *
 * `syncUrl` is off by default because the same tabs render inside the listing's detail sheet,
 * where writing `?tab=` would scribble over the listing's own URL behind the drawer.
 */
export function useProfileTab(initialTab?: string | string[] | null, syncUrl = false) {
  const [tab, setTab] = useState<ProfileTab>(() => parseProfileTab(initialTab))

  const changeTab = useCallback(
    (next: ProfileTab) => {
      setTab(next)

      if (!syncUrl || typeof window === 'undefined') return

      const url = new URL(window.location.href)
      url.searchParams.set('tab', next)
      window.history.replaceState(null, '', url.toString())
    },
    [syncUrl]
  )

  return [tab, changeTab] as const
}
