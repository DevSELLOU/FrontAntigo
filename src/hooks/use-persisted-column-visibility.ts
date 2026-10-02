'use client'

import type { VisibilityState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

/**
 * Column visibility of a listing table, remembered per screen in `localStorage`.
 *
 * Extracted from `companies/company-table.tsx` and `users/users-table.tsx`, which had the same
 * state + effect + writer trio copied verbatim; every migrated table now shares this one.
 * Reading happens in an effect (never during render) because `localStorage` doesn't exist on the
 * server — the first paint uses `defaultVisibility` and the stored preference lands right after.
 */
export function usePersistedColumnVisibility(storageKey: string, defaultVisibility: VisibilityState = {}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return

    try {
      setColumnVisibility(JSON.parse(saved))
    } catch {
      // ignore malformed storage value
    }
  }, [storageKey])

  const setVisibility = (visibility: VisibilityState) => {
    setColumnVisibility(visibility)
    localStorage.setItem(storageKey, JSON.stringify(visibility))
  }

  const toggleColumn = (id: string, visible: boolean) => {
    setVisibility({ ...columnVisibility, [id]: visible })
  }

  const resetVisibility = () => setVisibility(defaultVisibility)

  return { columnVisibility, setVisibility, toggleColumn, resetVisibility }
}
