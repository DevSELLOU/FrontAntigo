'use client'

import { CategorySidebar } from '@/components/shop/category-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { ShopCover } from '@/components/shop/shop-cover'
import { Footer } from '@/components/shop/shop-footer'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { useShopFilters } from '@/hooks/use-shop-filters'
import { Category } from '@/interfaces/category.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useCallback, useEffect, useState } from 'react'

export function ShopPage() {
  const { company } = useShop()
  const { isAuthenticated } = useShopAuth()
  const { search, categoryId, subcategoryId, sort, applyFilters, resetFilters } = useShopFilters()

  // As categorias eram buscadas DUAS vezes por abertura da loja: uma na barra lateral e outra na
  // grade, em `useEffect` independentes e sem cache. Buscar aqui uma vez e passar para baixo
  // elimina a duplicata e mantém as duas telas olhando exatamente a mesma lista.
  const [categories, setCategories] = useState<Category[] | undefined>(undefined)
  const [isFetchingCategories, setIsFetchingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)
  const [categoriesRetryToken, setCategoriesRetryToken] = useState(0)

  const companyId = company?.id

  useEffect(() => {
    const fetchCategories = async () => {
      if (!companyId) {
        setIsFetchingCategories(false)
        return
      }

      setIsFetchingCategories(true)
      setCategoriesError(false)

      try {
        const response = await clientFetch<PaginatedResponse<Category>>(`/company/${companyId}/categories`, {
          method: 'GET'
        })

        if (isApiErrorResponse(response)) throw new Error(response.message)

        setCategories(response.data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategoriesError(true)
      } finally {
        setIsFetchingCategories(false)
      }
    }

    fetchCategories()
  }, [companyId, categoriesRetryToken])

  const handleCategoryChange = useCallback(
    (nextCategoryId: string | null) => {
      // Trocar de categoria zera a subcategoria: manter a antiga produziria um par impossível.
      applyFilters({ category: nextCategoryId, subcategory: null })
    },
    [applyFilters]
  )

  const handleSubcategoryChange = useCallback(
    (nextSubcategoryId: string | null) => applyFilters({ subcategory: nextSubcategoryId }),
    [applyFilters]
  )

  const handleSortChange = useCallback((nextSort: string) => applyFilters({ sort: nextSort }), [applyFilters])

  return (
    <div className='flex w-full flex-col'>
      <ShopCover />
      <div className='flex w-full flex-col md:flex-row'>
        <CategorySidebar
          categories={categories}
          isFetchingCategories={isFetchingCategories}
          categoriesError={categoriesError}
          onRetryCategories={() => setCategoriesRetryToken(token => token + 1)}
          selectedCategoryId={categoryId}
          selectedSubcategoryId={subcategoryId}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
        />
        <ProductGrid
          isAuthenticated={isAuthenticated}
          categories={categories}
          selectedCategoryId={categoryId}
          selectedSubcategoryId={subcategoryId}
          searchQuery={search}
          sortBy={sort}
          onSortChange={handleSortChange}
          onResetFilters={resetFilters}
        />
      </div>
      <Footer />
    </div>
  )
}
