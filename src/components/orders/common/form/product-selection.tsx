'use client'

import { History, Info, LayoutGrid, List, Plus, Search, Tag } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Product } from '@/interfaces/product.interface'
import type { CustomerProductHistoryItem } from '@/interfaces/customer-product-history.interface'
import { ProductPurchaseHistory } from './product-purchase-history'
import { useDelayedState } from '@/hooks/use-delayed-state'
import { useProductSearch } from '@/hooks/queries/use-products'
import { formatCurrency } from '@/utils/format/format-currency'
import { ProductDetailModal } from '../product-detail-modal'

type CustomProduct = Product & { image?: string; quantity?: number }

interface ProductSelectionProps {
  products: CustomProduct[]
  selectedProducts: CustomProduct[]
  onAddProduct: (product: Product, quantity: number) => void
  disabled?: boolean
  companyId: number
  /** Histórico de compra do cliente selecionado, indexado por produto. */
  purchaseHistory?: Map<number, CustomerProductHistoryItem>
  purchaseWindowDays?: number
  isLoadingPurchaseHistory?: boolean
  hasCustomerSelected?: boolean
}

export function ProductSelection({
  products,
  selectedProducts,
  onAddProduct,
  disabled = false,
  companyId,
  purchaseHistory,
  purchaseWindowDays = 45,
  isLoadingPurchaseHistory = false,
  hasCustomerSelected = false
}: ProductSelectionProps) {
  const [searchTerm, setSearchTerm, debouncedSearchTerm] = useDelayedState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [onlyPreviouslyBought, setOnlyPreviouslyBought] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null)

  const isSearching = debouncedSearchTerm.trim().length >= 2

  // Server-side search: the preloaded `products` prop is only the first page,
  // so filtering it locally hid every SKU beyond it.
  const { data: searchData, isFetching: isFetchingSearch } = useProductSearch(
    companyId,
    debouncedSearchTerm.trim(),
    isSearching
  )

  const searchResults = searchData && 'data' in searchData ? (searchData.data as CustomProduct[]) : []

  const sourceProducts = isSearching ? searchResults : products

  const availableProducts = sourceProducts
    .filter(product => product.active !== false)
    .filter(product => !selectedProducts.some(p => p.id === product.id))

  // Kept from the preloaded page so the dropdown doesn't shift while typing.
  const categories = [
    ...new Set(
      products
        .filter(product => product.active !== false)
        .flatMap(product => product.subCategories?.map(cat => cat.name) || [])
    )
  ].sort()

  const historyFor = (productId: number) => purchaseHistory?.get(productId)

  const categoryFiltered = availableProducts.filter(
    product => selectedCategory === 'all' || product.subCategories?.some(cat => cat.name === selectedCategory)
  )

  const boughtBeforeCount = purchaseHistory
    ? categoryFiltered.filter(product => purchaseHistory.has(product.id)).length
    : 0

  // Turns the picker into a restock suggestion: what this customer actually buys,
  // most recent first, with everything else after it.
  const filteredProducts = (
    onlyPreviouslyBought && purchaseHistory
      ? categoryFiltered.filter(product => purchaseHistory.has(product.id))
      : categoryFiltered
  ).sort((a, b) => {
    const aHistory = historyFor(a.id)
    const bHistory = historyFor(b.id)

    if (aHistory && bHistory) return bHistory.lastPurchaseAt.localeCompare(aHistory.lastPurchaseAt)
    if (aHistory) return -1
    if (bHistory) return 1
    return 0
  })

  // Typed but not yet dispatched, or request in flight.
  const isAwaitingResults =
    (searchTerm.trim().length >= 2 && searchTerm !== debouncedSearchTerm) || isFetchingSearch

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleAddProduct = () => {
    if (selectedProduct) {
      onAddProduct(selectedProduct, quantity)
      setSelectedProduct(null)
      setQuantity(1)
    }
  }

  const handleOpenProductDetail = (product: Product) => {
    setSelectedProductDetail(product)
    setProductDetailModalOpen(true)
  }

  const handleCloseProductDetail = () => {
    setSelectedProductDetail(null)
    setProductDetailModalOpen(false)
  }

  return (
    // Plain block, not a Card: this already renders inside the form's section card,
    // and nesting one card in another doubled the border.
    <div className='w-full space-y-4'>
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative w-full sm:w-auto flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-text-muted' />
            <Input
              placeholder='Buscar produtos...'
              className='pl-8 w-full'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={disabled}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={disabled}>
            <SelectTrigger className='w-full sm:w-[180px]'>
              <SelectValue placeholder='Categoria' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {boughtBeforeCount > 0 && (
            <Button
              type='button'
              variant={onlyPreviouslyBought ? 'default' : 'outline'}
              size='sm'
              className='w-full sm:w-auto gap-1.5 whitespace-nowrap'
              onClick={() => setOnlyPreviouslyBought(prev => !prev)}
              disabled={disabled}
              aria-pressed={onlyPreviouslyBought}
            >
              <History className='h-4 w-4' />
              Já comprou ({boughtBeforeCount})
            </Button>
          )}

          <div className='flex items-center gap-1 ml-auto'>
            <Button
              type='button'
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size='sm'
              className='px-2.5'
              onClick={() => setViewMode('grid')}
              disabled={disabled}
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size='sm'
              className='px-2.5'
              onClick={() => setViewMode('list')}
              disabled={disabled}
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <Tabs defaultValue='products' className='w-full'>
          <TabsList className='w-full grid grid-cols-2'>
            <TabsTrigger value='products'>{isSearching ? 'Resultados' : 'Produtos'} ({filteredProducts.length})</TabsTrigger>
            <TabsTrigger value='selected'>No pedido ({selectedProducts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value='products' className='mt-4'>
            {isAwaitingResults ? (
              <div className='py-8 text-center text-body text-text-muted'>Buscando produtos...</div>
            ) : filteredProducts.length === 0 ? (
              <div className='py-8 text-center text-body text-text-muted'>
                {searchTerm.trim().length === 1
                  ? 'Digite ao menos 2 caracteres para buscar'
                  : searchTerm
                    ? `Nenhum produto encontrado para "${searchTerm}"`
                    : selectedCategory !== 'all'
                      ? 'Nenhum produto encontrado com os filtros atuais'
                      : 'Nenhum produto disponível'}
              </div>
            ) : (
              <ScrollArea className='h-[400px] pr-4'>
                {viewMode === 'grid' ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={() => handleSelectProduct(product)}
                        isSelected={selectedProduct?.id === product.id}
                        disabled={disabled}
                        onOpenDetail={handleOpenProductDetail}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {filteredProducts.map(product => (
                      <ProductListItem
                        key={product.id}
                        product={product}
                        onSelect={() => handleSelectProduct(product)}
                        isSelected={selectedProduct?.id === product.id}
                        disabled={disabled}
                        onOpenDetail={handleOpenProductDetail}
                        history={historyFor(product.id)}
                        purchaseWindowDays={purchaseWindowDays}
                        quantityInOrder={selectedProducts.find(p => p.id === product.id)?.quantity ?? 0}
                        showHistory={hasCustomerSelected}
                        isLoadingHistory={isLoadingPurchaseHistory}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value='selected' className='mt-4'>
            {selectedProducts.length === 0 ? (
              <div className='py-8 text-center text-body text-text-muted'>Nenhum produto selecionado</div>
            ) : (
              <ScrollArea className='h-[400px] pr-4'>
                <div className='space-y-3'>
                  {selectedProducts.map(product => (
                    <SelectedProductItem
                      key={product.id}
                      product={product}
                      quantity={selectedProducts.find(p => p.id === product.id)?.quantity || 1}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {selectedProduct && (
          <div className='mt-4 rounded-2xl border border-border bg-surface-muted p-4'>
            <div className='flex flex-col sm:flex-row gap-4 items-center'>
              <div className='flex items-center gap-3'>
                {selectedProduct.photos?.[0]?.url ? (
                  <Image
                    src={selectedProduct.photos[0].url || '/placeholder.svg'}
                    alt={selectedProduct.name}
                    width={60}
                    height={60}
                    className='rounded-md border object-cover'
                    unoptimized={true}
                  />
                ) : (
                  <div className='flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-border bg-surface text-center text-xs text-text-muted'>
                    Sem imagem
                  </div>
                )}
                <div>
                  <h3 className='text-label text-text'>{selectedProduct.name}</h3>
                  <p className='text-sm font-bold tabular-nums text-[#008440]'>{formatCurrency(Number(selectedProduct.price))}</p>
                </div>
              </div>

              <div className='flex items-center gap-3 ml-auto'>
                <div className='flex items-center'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-8 w-8 rounded-r-none'
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={disabled}
                  >
                    <span className='sr-only'>Decrease</span>
                    <span>-</span>
                  </Button>
                  <Input
                    type='number'
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className='h-8 w-14 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    disabled={disabled}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-8 w-8 rounded-l-none'
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={disabled}
                  >
                    <span className='sr-only'>Increase</span>
                    <span>+</span>
                  </Button>
                </div>

                <Button onClick={handleAddProduct} disabled={disabled}>
                  <Plus className='h-4 w-4 mr-2' />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        )}

        <ProductDetailModal
          isOpen={productDetailModalOpen}
          onClose={handleCloseProductDetail}
          product={selectedProductDetail}
        />
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onSelect: () => void
  isSelected: boolean
  disabled?: boolean
  onOpenDetail: (product: Product) => void
}

function ProductCard({ product, onSelect, isSelected, disabled, onOpenDetail }: ProductCardProps) {
  return (
    <div
      className={`cursor-pointer overflow-hidden rounded-2xl border bg-surface transition-colors hover:border-border-strong ${isSelected ? 'border-[#008440] ring-1 ring-[#008440]/30' : 'border-border'}`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className='relative aspect-square'>
        {product.photos?.[0]?.url ? (
          <Image
            src={product.photos[0].url || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            className='object-cover'
            unoptimized={true}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-surface-muted text-center text-caption text-text-muted'>
            Sem imagem
          </div>
        )}

        <Badge variant='secondary' className='absolute right-2 top-2 rounded-full'>
          {product.stock || 'Sem estoque'}
        </Badge>
      </div>
      <div className='p-3 space-y-2'>
        <h3 className='line-clamp-1 text-label text-text'>{product.name}</h3>

        <div className='flex flex-wrap gap-1'>
          {product.brand && (
            <Badge variant='outline' className='rounded-full text-xs'>
              {product.brand}
            </Badge>
          )}
          {product.model && (
            <Badge variant='outline' className='rounded-full text-xs'>
              {product.model}
            </Badge>
          )}
        </div>

        <div className='flex items-center justify-between'>
          <span className='font-bold tabular-nums text-[#008440]'>{formatCurrency(Number(product.price))}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={e => {
                    e.stopPropagation()
                    onOpenDetail(product)
                  }}
                >
                  <Info className='h-4 w-4' />
                  <span className='sr-only'>Detalhes</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalhes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

interface ProductListItemProps {
  product: Product
  onSelect: () => void
  isSelected: boolean
  disabled?: boolean
  onOpenDetail: (product: Product) => void
  history?: CustomerProductHistoryItem
  purchaseWindowDays?: number
  quantityInOrder?: number
  showHistory?: boolean
  isLoadingHistory?: boolean
}

function ProductListItem({
  product,
  onSelect,
  isSelected,
  disabled,
  onOpenDetail,
  history,
  purchaseWindowDays = 45,
  quantityInOrder = 0,
  showHistory = false,
  isLoadingHistory = false
}: ProductListItemProps) {
  return (
    <div
      className={`cursor-pointer rounded-2xl border bg-surface p-3 transition-colors hover:border-border-strong hover:bg-surface-muted ${isSelected ? 'border-[#008440] ring-1 ring-[#008440]/30' : 'border-border'}`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className='flex gap-3'>
        <div className='relative h-16 w-16 flex-shrink-0'>
          {product.photos?.[0]?.url ? (
            <Image
              src={product.photos[0].url || '/placeholder.svg'}
              alt={product.name}
              fill
              sizes='64px'
              className='object-cover rounded-md'
              unoptimized={true}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface-muted text-center text-xs text-text-muted'>
              Sem imagem
            </div>
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='line-clamp-1 text-label text-text'>{product.name}</h3>
            <span className='whitespace-nowrap font-bold tabular-nums text-[#008440]'>{formatCurrency(Number(product.price))}</span>
          </div>

          <div className='flex flex-wrap gap-1 mt-1'>
            {product.reference && <span className='text-xs text-text-muted'>Ref: {product.reference}</span>}
            {product.brand && (
              <span className='text-xs text-text-muted ml-1'>
                {product.reference ? '•' : ''} Marca: {product.brand}
              </span>
            )}
          </div>

          <div className='flex items-center mt-1 gap-2'>
            <Badge variant='secondary' className='rounded-full text-xs'>
              {product.stock || 'Sem estoque'}
            </Badge>

            {product.subCategories && product.subCategories.length > 0 && (
              <div className='flex items-center gap-1'>
                <Tag className='h-3 w-3 text-text-muted' />
                <span className='text-xs text-text-muted line-clamp-1'>
                  {product.subCategories.map(cat => cat.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          {showHistory && (
            <div className='mt-2 border-t border-border pt-2'>
              {isLoadingHistory ? (
                <span className='text-caption text-text-muted'>Carregando histórico...</span>
              ) : (
                <ProductPurchaseHistory
                  history={history}
                  windowDays={purchaseWindowDays}
                  quantityInOrder={quantityInOrder}
                />
              )}
            </div>
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 ml-2 flex-shrink-0'
                onClick={e => {
                  e.stopPropagation()
                  onOpenDetail(product)
                }}
              >
                <Info className='h-4 w-4' />
                <span className='sr-only'>Detalhes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

interface SelectedProductItemProps {
  product: CustomProduct
  quantity: number
}

function SelectedProductItem({ product, quantity }: SelectedProductItemProps) {
  return (
    <div className='rounded-2xl border border-border bg-surface p-3'>
      <div className='flex gap-3'>
        <div className='relative h-16 w-16 flex-shrink-0'>
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes='64px' className='object-cover rounded-md' unoptimized={true} />
          ) : (
            <div className='flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface-muted text-center text-xs text-text-muted'>
              Sem imagem
            </div>
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='line-clamp-1 text-label text-text'>{product.name}</h3>
            <div className='text-right'>
              <span className='whitespace-nowrap font-bold tabular-nums text-[#008440]'>
                {formatCurrency(Number(product.price) * quantity)}
              </span>
              <div className='text-xs text-text-muted'>
                {quantity} x {formatCurrency(Number(product.price))}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap gap-1 mt-1'>
            {product.reference && <span className='text-xs text-text-muted'>Ref: {product.reference}</span>}
            {product.model && (
              <span className='text-xs text-text-muted ml-1'>
                {product.reference ? '•' : ''} Modelo: {product.model}
              </span>
            )}
          </div>

          <div className='flex items-center mt-1'>
            <Badge variant='outline' className='rounded-full text-xs'>
              Qtd: {quantity}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
