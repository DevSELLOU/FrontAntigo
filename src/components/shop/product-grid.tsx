'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useShop } from '@/hooks/use-shop'
import { useToast } from '@/hooks/use-toast'
import { Category } from '@/interfaces/category.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { Product } from '@/interfaces/product.interface'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'
import { useCurrentHref } from '@/hooks/use-current-href'
import { buildShopSignInHref } from '@/utils/shop-return-to.util'
import { clientFetch } from '@/utils/client-fetch.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { getSubItemsCount } from '@/utils/get-subcategories-count'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { stripHtml } from '@/utils/strip-html.util'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'
import { EmptyState } from './empty-state'
import { ProductImage } from './product-image'
import { ProductGridSkeleton } from './product-skeleton'
import { ProductSort } from './product-sort'

interface ProductGridProps {
  isAuthenticated?: boolean
  /** Vem da página: buscar aqui de novo duplicava a requisição a cada abertura da loja. */
  categories?: Category[]
  selectedCategoryId?: string | null
  selectedSubcategoryId?: string | null
  searchQuery?: string | null
  sortBy: string
  onSortChange: (sort: string) => void
  onResetFilters?: () => void
}

export function ProductGrid({
  isAuthenticated,
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  searchQuery,
  sortBy,
  onSortChange,
  onResetFilters
}: ProductGridProps) {
  const route = useRouter()
  const { toast } = useToast()
  const currentHref = useCurrentHref()
  const [isFetchingProducts, setIsFetchingProducts] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [products, setProducts] = useState<Product[] | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  // Sem isto, um `catch` silencioso fazia a loja mostrar "Nenhum produto disponível" quando a API
  // estava fora do ar — o comprador concluía que não havia estoque e ia embora.
  const [loadError, setLoadError] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)
  const { state, dispatch, company } = useShop()

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setProducts(undefined)
    setIsFetchingProducts(true)
  }, [searchQuery, sortBy, selectedCategoryId, selectedSubcategoryId])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!company) {
        setIsFetchingProducts(false)
        return
      }


      if (page === 1) {
        setIsFetchingProducts(true)
      } else {
        setIsLoadingMore(true)
      }

      setLoadError(false)

      try {
        let sortObj: Record<string, string> = {}

        switch (sortBy) {
          case 'name-asc':
            sortObj = { name: 'ASC' }
            break
          case 'name-desc':
            sortObj = { name: 'DESC' }
            break
          case 'price-asc':
            sortObj = { price: 'ASC' }
            break
          case 'price-desc':
            sortObj = { price: 'DESC' }
            break
          default:
            sortObj = { name: 'ASC' }
        }

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '50',
          sort: JSON.stringify(sortObj)
        })

        if (searchQuery) queryParams.set('query', searchQuery)

        // `active` filtrado no servidor, não no cliente. Filtrar depois do fetch fazia `hasMore`
        // contar itens que a vitrine não mostrava: uma página inteira de inativos escondia TODO o
        // resto do catálogo, porque a sentinela do scroll infinito nem chegava a ser montada.
        const filters: Record<string, any> = { active: true }

        // Por ID, não por nome. Casar por nome quebrava em silêncio com categorias homônimas ou
        // renomeadas — e o estado vazio, no mesmo arquivo, já comparava por id (`Number(nome)` =
        // NaN), então as duas metades discordavam entre si.
        if (selectedCategoryId) filters.categoryId = Number(selectedCategoryId)
        if (selectedSubcategoryId) filters.subCategoryId = Number(selectedSubcategoryId)

        if (Object.keys(filters).length > 0) queryParams.set('filters', JSON.stringify(filters))

        const productsUrl = `/company/${company?.id}/products?${queryParams.toString()}`
        const productsResponse = await clientFetch<PaginatedResponse<Product>>(productsUrl, { method: 'GET' })

        if (isApiErrorResponse(productsResponse)) throw new Error(productsResponse?.message)

        const newProducts = productsResponse.data

        if (page === 1) {
          setProducts(newProducts)
        } else {
          setProducts(prev => [...(prev || []), ...newProducts])
        }

        if (newProducts.length < 50) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setLoadError(true)
        setHasMore(false)
      } finally {
        setIsFetchingProducts(false)
        setIsLoadingMore(false)
      }
    }

    fetchProducts()
  }, [company, searchQuery, sortBy, selectedCategoryId, selectedSubcategoryId, page, retryToken])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetchingProducts && !isLoadingMore) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isFetchingProducts, isLoadingMore])

  const filteredProducts = products || []

  const getEmptyStateProps = useMemo(
    () => () => {
      const categoryName = categories?.find(cat => cat.id === Number(selectedCategoryId))?.name ?? ''
      const subcategoryName =
        categories?.flatMap(cat => cat.subCategories).find(subCat => subCat.id === Number(selectedSubcategoryId))
          ?.name ?? ''

      if (searchQuery) {
        return {
          title: 'Nenhum resultado encontrado',
          description: `Não encontramos nenhum produto correspondente a "${searchQuery}"`,
          showReset: true
        }
      }
      if (selectedCategoryId && selectedSubcategoryId) {
        return {
          title: 'Nenhum produto nesta subcategoria',
          description: `Não encontramos nenhum produto em ${subcategoryName} na categoria ${categoryName}`,
          showReset: true
        }
      }
      if (selectedCategoryId) {
        return {
          title: 'Nenhum produto nesta categoria',
          description: `Não encontramos nenhum produto na categoria ${categoryName}`,
          showReset: true
        }
      }
      return {
        title: 'Nenhum produto disponível',
        description: 'Volte mais tarde para novos produtos',
        showReset: false
      }
    },
    [categories, selectedCategoryId, selectedSubcategoryId, searchQuery]
  )

  const handleAddToCart = (product: Product, outOfStock: boolean) => {
    if (outOfStock) return

    if (!isAuthenticated) {
      route.push(buildShopSignInHref(company?.fantasyName ?? '', currentHref))
      return
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.photos[0]?.url,
        quantity: 1,
        stock: Number(product.stock) || undefined
      }
    })

    // O drawer abria sozinho a cada item, cobrindo a vitrine com uma folha de 512px e matando o
    // padrão B2B de varrer a grade adicionando vários. A confirmação agora é discreta: este toast
    // mais o contador do header, e o próprio card passa a mostrar a quantidade.
    toast({ title: `${product.name} adicionado ao carrinho`, status: 'success' })
  }

  const updateCartQuantity = (productId: number, quantity: number) =>
    quantity < 1
      ? dispatch({ type: 'REMOVE_ITEM', payload: productId })
      : dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })

  return (
    <div className='relative w-full flex-1 p-5 md:px-10'>
      <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
        <h1 className='text-2xl font-bold'>Produtos</h1>
        {filteredProducts.length > 0 && (
          <ProductSort onSort={onSortChange} sortBy={sortBy} isAuthenticated={isAuthenticated} />
        )}
      </div>
      {isFetchingProducts ? (
        <ProductGridSkeleton />
      ) : loadError ? (
        <EmptyState
          variant='error'
          title='Não foi possível carregar os produtos'
          description='Pode ter sido uma falha de conexão. O catálogo continua aqui — é só tentar de novo.'
          onRetry={() => setRetryToken(token => token + 1)}
        />
      ) : (
        <>
        {filteredProducts.length === 0 ? (
          <EmptyState {...getEmptyStateProps()} onReset={onResetFilters} />
        ) : (
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-2'>
          {filteredProducts.map((product, index) => {
            const outOfStock = !product?.stock || product.stock == '0'
            const cartItem = state.items.find(item => item.id === product.id)
            const stockCeiling = Number(product.stock) || undefined

            const { names, remainingCount } = getSubItemsCount(product?.subCategories || [], 2)

            return (
              <Card
                key={product.id}
                className={cn('flex flex-col group overflow-hidden', {
                  'opacity-70': outOfStock
                })}
              >
                <Link href={`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/product/${product.id}`} className='flex-1 overflow-hidden'>
                  <CardHeader className='p-0 overflow-hidden'>
                    <div className='relative aspect-square overflow-hidden select-none'>
                      <ProductImage
                        src={product.photos[0]?.url}
                        alt={product.photos[0]?.description || product.name}
                        sizes='(min-width: 1536px) 14vw, (min-width: 1280px) 20vw, (min-width: 1024px) 33vw, 50vw'
                        priority={index < 5}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className='flex-1 p-4'>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      <Badge variant='secondary'>
                        {names || '-'}
                        {remainingCount > 0 && `... +${remainingCount}`}
                      </Badge>
                      <Badge variant='outline'>{product.brand}</Badge>
                    </div>
                    <CardTitle className='mb-2 line-clamp-2'>{product.name}</CardTitle>
                    <CardDescription className='line-clamp-2'>{stripHtml(product.description)}</CardDescription>
                  </CardContent>
                </Link>
                <CardFooter className='p-2 pt-0'>
                  <div className='w-full space-y-2'>
                    {isAuthenticated ? <div className='font-bold text-lg px-2'>{formatCurrency(product.price)}</div> : null}

                    {cartItem ? (
                      /* Depois do primeiro clique o botão vira seletor: é o que permite comprar 12
                         unidades sem 12 idas ao carrinho, sem sair da vitrine e sem espremer um
                         stepper no card de quem ainda não comprou nada. */
                      <div className='flex items-center justify-between gap-1'>
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-11 w-11 flex-shrink-0'
                          aria-label={`Diminuir quantidade de ${product.name}`}
                          onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                        >
                          <Minus className='h-4 w-4' />
                        </Button>
                        <span className='min-w-8 text-center font-semibold' aria-live='polite'>
                          {cartItem.quantity}
                        </span>
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-11 w-11 flex-shrink-0'
                          disabled={Boolean(stockCeiling && cartItem.quantity >= stockCeiling)}
                          aria-label={`Aumentar quantidade de ${product.name}`}
                          onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className='w-full h-auto min-h-11 whitespace-normal px-2 py-2 text-xs leading-tight sm:text-sm'
                        variant={outOfStock ? 'outline' : 'default'}
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product, outOfStock)}
                      >
                        {outOfStock ? 'Fora de estoque' : 'Adicionar ao carrinho'}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
        )}
        {/* Fora do ramo condicional de propósito: quando a sentinela vivia dentro dele, uma página
            sem nada para exibir nunca a montava e o scroll infinito morria ali, escondendo o resto
            do catálogo em silêncio. */}
        {hasMore && (
          <div ref={observerTarget} className={cn('w-full flex items-center justify-center', isLoadingMore ? 'h-10 mt-4' : 'h-px')}>
            {isLoadingMore && <span className='text-muted-foreground text-sm'>Carregando mais produtos...</span>}
          </div>
        )}
        </>
      )}
    </div>
  )
}
