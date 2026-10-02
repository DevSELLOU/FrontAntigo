'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/interfaces/product.interface'
import { PriceTable as PriceTableType } from '@/interfaces/price-table.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Save, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { UpdatePriceTableModal } from './update-price-table-modal'
import { formatCurrencyMask, parseCurrencyMask } from '@/utils/format/format-price'

interface TableProps {
  companyId: number
  priceTables: PriceTableType[]
  companyColor?: string | null
}

interface PriceItem {
  productId: number
  manualPrice: number | null
}

export function PriceTable({ priceTables, companyId, companyColor }: TableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pricesByTable, setPricesByTable] = useState<{ [priceTableId: number]: PriceItem[] }>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedPrices, setEditedPrices] = useState<{ [key: string]: number | null | string }>({})
  const [editedBasePrices, setEditedBasePrices] = useState<{ [key: string]: number | null | string }>({})
  const [editingTable, setEditingTable] = useState<PriceTableType | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const productsResponse = await clientFetch<PaginatedResponse<Product>>(
          `/company/${companyId}/products?limit=1000`,
          { method: 'GET' }
        )

        if (isApiErrorResponse(productsResponse)) {
          throw new Error(productsResponse.message)
        }

        setProducts(productsResponse.data)

        const allPrices: { [priceTableId: number]: PriceItem[] } = {}
        for (const pt of priceTables) {
          const pricesResponse = await clientFetch<{ data: PriceItem[] }>(
            `/company/${companyId}/price-tables/${pt.id}/items`,
            { method: 'GET' }
          )

          if (!isApiErrorResponse(pricesResponse) && pricesResponse.data) {
            allPrices[pt.id] = pricesResponse.data
          } else {
            allPrices[pt.id] = []
          }
        }
        setPricesByTable(allPrices)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (priceTables.length > 0) {
      fetchData()
    } else {
      // Without this, isLoading (initialized true) never turns off when a company has zero
      // price tables — the empty-state message below is unreachable, and the screen is stuck
      // on "Carregando..." forever. Not a new bug: dormant since before this file existed in
      // its current form, just never hit until a company with no price tables opened this tab.
      setIsLoading(false)
    }
  }, [companyId, priceTables.length, refreshKey])

  const getPrice = (priceTableId: number, productId: number): number | null => {
    const key = `${priceTableId}-${productId}`
    const value = editedPrices[key]
    if (value !== undefined) {
      return typeof value === 'number' ? value : null
    }
    const items = pricesByTable[priceTableId] || []
    const item = items.find(i => i.productId === productId)
    return item?.manualPrice ?? null
  }

  const handleFocus = (priceTableId: number, productId: number) => {
    const price = getPrice(priceTableId, productId)
    const key = `${priceTableId}-${productId}-focused`
    setEditedPrices(prev => ({ ...prev, [key]: price !== null ? price.toString().replace('.', ',') : '' }))
  }

  const handleBlur = (priceTableId: number, productId: number) => {
    const key = `${priceTableId}-${productId}-focused`
    const rawValue = editedPrices[key]
    const price = typeof rawValue === 'string' ? parseCurrencyMask(rawValue) : null
    const actualKey = `${priceTableId}-${productId}`
    setEditedPrices(prev => {
      const newState = { ...prev }
      delete newState[key]
      if (price !== null) {
        newState[actualKey] = price
      } else {
        delete newState[actualKey]
      }
      return newState
    })
    setHasChanges(true)
  }

  const handlePriceChange = (priceTableId: number, productId: number, value: string) => {
    const key = `${priceTableId}-${productId}-focused`
    setEditedPrices(prev => ({ ...prev, [key]: value }))
  }

  const getInputValue = (priceTableId: number, productId: number): string => {
    const key = `${priceTableId}-${productId}-focused`
    const value = editedPrices[key]
    if (value !== undefined) {
      return typeof value === 'string' ? value : ''
    }
    const price = getPrice(priceTableId, productId)
    return formatCurrencyMask(price)
  }

  const handleBasePriceFocus = (productId: number) => {
    const product = products.find(p => p.id === productId)
    const price = product?.price ?? null
    setEditedBasePrices(prev => ({
      ...prev,
      [`${productId}-focused`]: price !== null ? price.toString().replace('.', ',') : ''
    }))
  }

  const handleBasePriceBlur = (productId: number) => {
    const key = `${productId}-focused`
    const rawValue = editedBasePrices[key]
    const price = typeof rawValue === 'string' ? parseCurrencyMask(rawValue) : null
    setEditedBasePrices(prev => {
      const newState = { ...prev }
      delete newState[key]
      if (price !== null) {
        newState[productId] = price
      } else {
        delete newState[productId]
      }
      return newState
    })
    setHasChanges(true)
  }

  const handleBasePriceChange = (productId: number, value: string) => {
    setEditedBasePrices(prev => ({
      ...prev,
      [`${productId}-focused`]: value
    }))
  }

  const getBasePriceInputValue = (productId: number): string => {
    const key = `${productId}-focused`
    const value = editedBasePrices[key]
    if (value !== undefined) {
      return typeof value === 'string' ? value : ''
    }
    const product = products.find(p => p.id === productId)
    return formatCurrencyMask(product?.price ?? null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const productPriceUpdates: { id: number; price: number }[] = []
      for (const product of products) {
        const newPrice = editedBasePrices[product.id]
        if (typeof newPrice === 'number') {
          productPriceUpdates.push({ id: product.id, price: newPrice })
        }
      }

      if (productPriceUpdates.length > 0) {
        for (const update of productPriceUpdates) {
          await clientFetch(
            `/company/${companyId}/products/${update.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ price: update.price }),
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }

      for (const priceTable of priceTables) {
        const items: PriceItem[] = []
        for (const product of products) {
          const price = getPrice(priceTable.id, product.id)
          if (price !== null) {
            items.push({ productId: product.id, manualPrice: price })
          }
        }

        if (items.length > 0) {
          await clientFetch(
            `/company/${companyId}/price-tables/${priceTable.id}/items`,
            {
              method: 'PATCH',
              body: JSON.stringify({ items }),
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }

      toast({
        title: 'Preços salvos com sucesso',
        status: 'success'
      })
      setHasChanges(false)
      setEditedPrices({})
      setEditedBasePrices({})

      const productsResponse = await clientFetch<PaginatedResponse<Product>>(
        `/company/${companyId}/products?limit=1000`,
        { method: 'GET' }
      )
      if (!isApiErrorResponse(productsResponse)) {
        setProducts(productsResponse.data)
      }

      const allPrices: { [priceTableId: number]: PriceItem[] } = {}
      for (const pt of priceTables) {
        const pricesResponse = await clientFetch<{ data: PriceItem[] }>(
          `/company/${companyId}/price-tables/${pt.id}/items`,
          { method: 'GET' }
        )
        if (!isApiErrorResponse(pricesResponse) && pricesResponse.data) {
          allPrices[pt.id] = pricesResponse.data
        } else {
          allPrices[pt.id] = []
        }
      }
      setPricesByTable(allPrices)
    } catch (error) {
      console.error('Failed to save prices:', error)
      toast({
        title: 'Erro ao salvar preços',
        status: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div role='status' aria-live='polite' className='rounded-2xl border border-border bg-surface shadow-sm'>
        <div className='flex items-center gap-2 p-5 text-text-muted'>
          <Loader2 aria-hidden='true' className='h-4 w-4 animate-spin' />
          <span className='text-caption'>Carregando...</span>
        </div>
        <div aria-hidden='true' className='animate-pulse border-t border-border'>
          <div className='h-11 border-b border-border bg-surface-muted' />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='h-16 border-b border-border last:border-b-0 bg-surface' />
          ))}
        </div>
      </div>
    )
  }

  if (priceTables.length === 0) {
    return (
      <div className='rounded-2xl border border-border bg-surface shadow-sm'>
        <div className='flex h-24 items-center justify-center text-body text-text-muted'>
          Nenhuma tabela de preço encontrada.
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='sticky top-0 z-20 flex justify-end bg-app pb-2'>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          <Save className='h-4 w-4 mr-2' />
          {saving ? 'Salvando...' : 'Salvar preços'}
        </Button>
      </div>
      <div className='overflow-auto max-h-[65vh] rounded-2xl border border-border bg-surface shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='sticky left-0 z-10 w-[200px] border-r border-border bg-surface'>
                Produto
              </TableHead>
              <TableHead className='w-[120px]'>Preço Base</TableHead>
              {priceTables.map(pt => (
                <TableHead key={pt.id} className='min-w-[150px]'>
                  <button
                    type='button'
                    onClick={() => setEditingTable(pt)}
                    aria-label={`Editar tabela ${pt.name}`}
                    className='inline-flex items-center gap-1.5 pb-1 hover:text-text'
                    style={companyColor ? { borderBottom: `2px solid #${companyColor}` } : undefined}
                  >
                    <span>{pt.name}</span>
                    <Pencil className='h-3 w-3 text-text-muted' />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell className='sticky left-0 z-10 border-r border-border bg-surface py-3'>
                  <div className='font-medium'>{product.name}</div>
                  <div className='mt-0.5 flex flex-wrap items-center gap-x-1.5 text-caption text-text-muted'>
                    <span>Cód. Cliente: {product.reference || '-'}</span>
                    <span aria-hidden='true'>·</span>
                    <span>Cód. Barras: {product.barcode || '-'}</span>
                    {product.supplierCode && (
                      <>
                        <span aria-hidden='true'>·</span>
                        <span>Fornecedor: {product.supplierCode}</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type='text'
                    inputMode='decimal'
                    placeholder='0,00'
                    value={getBasePriceInputValue(product.id)}
                    onFocus={() => handleBasePriceFocus(product.id)}
                    onBlur={() => handleBasePriceBlur(product.id)}
                    onChange={e => handleBasePriceChange(product.id, e.target.value)}
                    className='h-8'
                  />
                </TableCell>
                {priceTables.map(pt => {
                  const basePrice = product.price
                  const tablePrice = getPrice(pt.id, product.id)
                  const delta = basePrice && tablePrice !== null ? (tablePrice - basePrice) / basePrice : null

                  return (
                    <TableCell key={pt.id}>
                      <Input
                        type='text'
                        inputMode='decimal'
                        placeholder='0,00'
                        value={getInputValue(pt.id, product.id)}
                        onFocus={() => handleFocus(pt.id, product.id)}
                        onBlur={() => handleBlur(pt.id, product.id)}
                        onChange={e => handlePriceChange(pt.id, product.id, e.target.value)}
                        className='h-8'
                      />
                      {delta !== null && (
                        <div className='mt-1 flex items-center gap-1 text-caption text-text-muted'>
                          <span aria-hidden='true'>{delta < 0 ? '↘' : '↗'}</span>
                          <span className={cn('font-bold', delta < 0 ? 'text-danger-foreground' : 'text-success-foreground')}>
                            {`${delta > 0 ? '+' : delta < 0 ? '-' : ''}${Math.abs(delta * 100).toFixed(1).replace('.', ',')}%`}
                          </span>
                          <span>vs. base</span>
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editingTable && (
<UpdatePriceTableModal
                open={editingTable !== null}
                onClose={() => setEditingTable(null)}
                companyId={companyId}
                priceTable={editingTable as PriceTableType}
                companyColor={companyColor}
                onSuccess={() => setRefreshKey(k => k + 1)}
              />
      )}
    </div>
  )
}