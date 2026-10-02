'use client'

import type { SortingState } from '@tanstack/react-table'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Derives tanstack-table `sorting` state from the `sort` URL param (`{"field":"asc"|"desc"}`)
 * and returns a change handler that writes it back, resetting pagination to page 1. Pass both
 * to `DataTable` (`sorting`/`onSortingChange`) so ordering is server-side and spans the whole
 * filtered result set, not just the page currently loaded — see `products-table.tsx` for the
 * original pattern this was extracted from.
 */
export function useUrlSorting() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sortParam = searchParams.get('sort')

  const sorting: SortingState = useMemo(() => {
    if (!sortParam) return []
    try {
      const parsed = JSON.parse(sortParam)
      const [field, direction] = Object.entries(parsed)[0] ?? []
      if (!field) return []
      return [{ id: field as string, desc: direction === 'desc' }]
    } catch {
      return []
    }
  }, [sortParam])

  const handleSortingChange = (next: SortingState) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    const nextSort = next[0]

    if (nextSort) {
      current.set('sort', JSON.stringify({ [nextSort.id]: nextSort.desc ? 'desc' : 'asc' }))
    } else {
      current.delete('sort')
    }

    current.set('page', '1')
    router.push('?' + current.toString())
  }

  return { sorting, handleSortingChange }
}
