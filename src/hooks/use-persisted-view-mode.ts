'use client'

import type { ListingViewMode } from '@/components/shared/listing-page-header'
import { useEffect, useState } from 'react'

/**
 * Listing view mode (list/grid/kanban) that survives reloads, kept per screen so
 * each listing remembers its own preference.
 */
export function usePersistedViewMode(storageKey: string, fallback: ListingViewMode = 'list') {
  const [viewMode, setViewMode] = useState<ListingViewMode>(fallback)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'list' || saved === 'grid' || saved === 'kanban') {
      setViewMode(saved)
    }
  }, [storageKey])

  const changeViewMode = (next: ListingViewMode) => {
    setViewMode(next)
    localStorage.setItem(storageKey, next)
  }

  return [viewMode, changeViewMode] as const
}
