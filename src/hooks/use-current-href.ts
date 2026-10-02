'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Caminho atual com a query, no formato que o `returnTo` espera.
 *
 * A query é essencial: é lá que vivem busca, categoria e ordenação. Mandar o comprador de volta
 * só para o caminho o devolveria à vitrine sem o filtro que ele tinha aplicado.
 */
export function useCurrentHref(): string {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useMemo(() => {
    const query = searchParams.toString()

    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])
}
