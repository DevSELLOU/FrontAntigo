'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export const DEFAULT_SHOP_SORT = 'name-asc'

export interface ShopFilters {
  search: string | null
  /** Id da categoria, como string — é assim que ele vive na URL. */
  categoryId: string | null
  subcategoryId: string | null
  sort: string
}

/**
 * Filtro, subcategoria e ordenação da vitrine, guardados na URL.
 *
 * Antes só `search` vivia na URL; categoria e ordenação eram `useState`. O efeito era que entrar
 * num produto e voltar devolvia o comprador à página 1 sem filtro nenhum, refazendo a busca do
 * zero — e nenhuma vitrine filtrada podia ser compartilhada por link.
 *
 * Usa `replace`, não `push`: mudar de filtro não deve criar uma entrada no histórico, senão o
 * botão "voltar" passa a desfazer filtros um a um em vez de sair da vitrine. A navegação para o
 * produto continua sendo `push`, então voltar de lá recai nesta URL — com os filtros dentro.
 */
export function useShopFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: ShopFilters = useMemo(
    () => ({
      search: searchParams.get('search'),
      categoryId: searchParams.get('category'),
      subcategoryId: searchParams.get('subcategory'),
      sort: searchParams.get('sort') ?? DEFAULT_SHOP_SORT
    }),
    [searchParams]
  )

  const applyFilters = useCallback(
    (patch: Partial<Record<'search' | 'category' | 'subcategory' | 'sort', string | null>>) => {
      const next = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(patch)) {
        // Valor vazio some da URL em vez de virar `?category=`: mantém o link limpo e legível.
        if (value === null || value === undefined || value === '') next.delete(key)
        else next.set(key, value)
      }

      const query = next.toString()

      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  return { ...filters, applyFilters, resetFilters }
}
