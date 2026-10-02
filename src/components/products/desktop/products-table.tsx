'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import type { Category } from '@/interfaces/category.interface'
import type { PriceTable } from '@/interfaces/price-table.interface'
import type { Product } from '@/interfaces/product.interface'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { formatCurrency } from '@/utils/format/format-currency'
import { getSubItemsCount } from '@/utils/get-subcategories-count'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import type {
  ColumnDef,
  Row,
  VisibilityState
} from '@tanstack/react-table'
import {
  CheckCircle2,
  CircleOff,
  ImageOff
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { ProductStockBadge } from '../common/product-stock-badge'
import { ProductViewModal } from '../common/product-view-modal'
import { DataTable } from '../../ui/data-table'
import { SortableColumnHeader } from '../../ui/sortable-column-header'
import { DynamicPriceColumn } from './dynamic-price-column'
import { ProductRowOptions } from './product-row-options'

interface TableProps {
  products: Product[]
  categories: Category[]
  priceTables?: PriceTable[]
}

const VISIBILITY_STORAGE_KEY = 'products-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'name', label: 'Produto' },
  { id: 'subCategories', label: 'Categoria' },
  { id: 'price', label: 'Preço' },
  { id: 'stock', label: 'Estoque' },
  { id: 'active', label: 'Status' },
  { id: 'updatedAt', label: 'Atualização' }
]

function ProductImage({
  product
}: {
  product: Product
}) {
  const [imageHasError, setImageHasError] =
    useState(false)

  const imageUrl = product.photos?.[0]?.url

  return (
    <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted'>
      {imageUrl && !imageHasError ? (
        <Image
          src={imageUrl}
          alt={
            product.photos?.[0]?.description ||
            product.name
          }
          fill
          sizes='48px'
          onError={() => setImageHasError(true)}
          unoptimized={true}
          className='object-cover'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center text-text-muted'>
          <ImageOff className='h-5 w-5' />
        </div>
      )}
    </div>
  )
}

export function ProductsTable({
  products,
  categories,
  priceTables = []
}: TableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_VISIBILITY)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { sorting, handleSortingChange } = useUrlSorting()

  useEffect(() => {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved))
      } catch {
        // ignore malformed storage value
      }
    }
  }, [])

  const handleColumnVisibilityChange = (visibility: VisibilityState) => {
    setColumnVisibility(visibility)
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  }

  const toggleColumn = (id: string, visible: boolean) => {
    handleColumnVisibilityChange({ ...columnVisibility, [id]: visible })
  }

  const baseColumns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableColumnHeader column={column} label='Produto' />,
      size: 360,
      minSize: 320,
      cell: ({ row }: { row: Row<Product> }) => {
        const product = row.original

        return (
          <div className='flex min-w-[320px] items-center gap-3'>
            <ProductImage product={product} />

            <div className='min-w-0 flex-1'>
              <div className='flex min-w-0 items-center gap-2'>
                <p className='max-w-[245px] truncate text-sm font-semibold text-text'>
                  {product.name || '-'}
                </p>

                <span className='shrink-0 rounded-full bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-text-muted'>
                  {product.id.toString().padStart(4, '0')}
                </span>
              </div>

              <p className='mt-0.5 max-w-[285px] truncate text-xs text-text-muted'>
                {[product.brand, product.model]
                  .filter(Boolean)
                  .join(' ') || 'Marca não informada'}
              </p>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'subCategories',
      header: ({ column }) => <SortableColumnHeader column={column} label='Categoria' />,
      size: 180,
      minSize: 160,
      cell: ({ row }: { row: Row<Product> }) => {
        const { names, remainingCount } =
          getSubItemsCount(row.original.subCategories)

        return (
          <span className='inline-flex max-w-[170px] truncate rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-body'>
            {names || 'Sem categoria'}
            {remainingCount > 0 &&
              ` +${remainingCount}`}
          </span>
        )
      }
    },
    {
      accessorKey: 'price',
      header: ({ column }) => <SortableColumnHeader column={column} label='Preço' />,
      size: 150,
      minSize: 140,
      cell: ({ row }: { row: Row<Product> }) => (
        <span className='whitespace-nowrap text-sm font-bold text-[#008440]'>
          {formatCurrency(row.original.price)}
        </span>
      )
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => <SortableColumnHeader column={column} label='Estoque' />,
      size: 110,
      minSize: 100,
      cell: ({ row }: { row: Row<Product> }) => <ProductStockBadge product={row.original} hideInactiveState />
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <SortableColumnHeader column={column} label='Status' />,
      size: 130,
      minSize: 120,
      cell: ({ row }: { row: Row<Product> }) => {
        const isActive = row.original.active !== false

        return (
          <span
            className={
              isActive
                ? 'inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground'
                : 'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-muted'
            }
          >
            {isActive ? (
              <CheckCircle2 className='h-3.5 w-3.5' />
            ) : (
              <CircleOff className='h-3.5 w-3.5' />
            )}

            {isActive ? 'Ativo' : 'Inativo'}
          </span>
        )
      }
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <SortableColumnHeader column={column} label='Atualização' />,
      size: 145,
      minSize: 135,
      cell: ({ row }: { row: Row<Product> }) => (
        <span className='whitespace-nowrap text-sm text-text-muted'>
          {howTimeAgo(row.getValue('updatedAt'))}
        </span>
      )
    }
  ]

  const dynamicColumns: ColumnDef<Product>[] =
  priceTables.map(table => ({
    id: `priceTable_${table.id}`,
    accessorKey: `priceTable_${table.id}`,
    enableSorting: false,

    header: () => (
      <div className='min-w-[210px] whitespace-nowrap'>
        {table.name}
      </div>
    ),

    size: 220,
    minSize: 210,

    cell: ({ row }: { row: Row<Product> }) => (
      <div className='min-w-[210px] whitespace-nowrap'>
        <DynamicPriceColumn
          product={row.original}
          priceTableId={table.id}
          priceTableName={table.name}
        />
      </div>
    )
  }))

  const actionColumns: ColumnDef<Product>[] = [
    {
      id: 'actions',
      enableSorting: false,
      header: () => (
        <div className='flex justify-end'>
          <ColumnVisibilityToggle
            columns={TOGGLEABLE_COLUMNS}
            visibility={columnVisibility}
            onToggle={toggleColumn}
            onReset={() => handleColumnVisibilityChange(DEFAULT_VISIBILITY)}
          />
        </div>
      ),
      size: 130,
      minSize: 130,
      cell: ({ row }: { row: Row<Product> }) => (
        <div className='flex min-w-[120px] items-center justify-end gap-1' onClick={e => e.stopPropagation()}>
          <ProductRowOptions
            product={row.original}
            categories={categories}
          />
        </div>
      )
    }
  ]

  return (
  <div className='min-w-0'>
    <DataTable
      columns={[
        ...baseColumns,
        ...dynamicColumns,
        ...actionColumns
      ]}
      data={products}
      onRowClick={product => setSelectedProduct(product)}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={handleColumnVisibilityChange}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhum produto encontrado com os filtros selecionados.'
    />

    {selectedProduct && (
      <ProductViewModal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        categories={categories}
      />
    )}
  </div>
  )
}
