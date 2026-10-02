'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Category } from '@/interfaces/category.interface'
import { Product } from '@/interfaces/product.interface'
import { formatCurrency } from '@/utils/format/format-currency'
import { getSubItemsCount } from '@/utils/get-subcategories-count'
import DOMPurify from 'dompurify'
import {
  ImageOff,
  Star
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { ProductStockBadge } from '@/components/products/common/product-stock-badge'
import { ProductViewModal } from '@/components/products/common/product-view-modal'

export default function ProductCard({
  product,
  categories
}: {
  product: Product
  categories: Category[]
}) {
  const [
    isViewModalOpen,
    setIsViewModalOpen
  ] = useState(false)

  const {
    names: categoriesNames,
    remainingCount:
      remainingCategoriesCount
  } = getSubItemsCount(
    product?.subCategories
  )

  const openProduct = () => {
    setIsViewModalOpen(true)
  }

  return (
    <>
      <Card
        role='button'
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={event => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault()
            openProduct()
          }
        }}
        className={`group h-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--glass-hover-border)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35DD48]/40 ${
          product?.active === false
            ? 'border-danger-border bg-danger/20'
            : ''
        }`}
      >
        <div className='relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-surface-muted'>
          {product?.photos?.length > 0 ? (
            <Image
              src={product.photos[0].url}
              alt={
                product.photos[0].description ||
                product.name
              }
              fill
              sizes='(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
              className='object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]'
              unoptimized={true}
            />
          ) : (
            <div className='flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted'>
              <ImageOff className='h-7 w-7' />
              <span className='text-[10px]'>
                Imagem indisponível
              </span>
            </div>
          )}

          <div className='absolute left-3 top-3'>
            <span className='rounded-full border border-border bg-surface/95 px-2 py-0.5 font-mono text-[9px] font-semibold text-text-muted shadow-sm backdrop-blur-sm'>
              ID{' '}
              {product.id
                .toString()
                .padStart(4, '0')}
            </span>
          </div>

          {product.favorite ? (
            <div className='absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 shadow-sm backdrop-blur-sm'>
              <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
            </div>
          ) : null}
        </div>

        <div className='flex flex-col p-4'>
          <div className='min-w-0'>
            <h2 className='line-clamp-2 text-sm font-bold leading-5 text-text'>
              {product.name}
            </h2>

            <p className='mt-1 truncate text-xs text-text-muted'>
              {[product.brand, product.model]
                .filter(Boolean)
                .join(' ') || '-'}
            </p>
          </div>

          {product.description ? (
            <p className='mt-3 line-clamp-2 text-xs leading-5 text-text-muted'>
              {DOMPurify.sanitize(product.description, { ALLOWED_TAGS: [] })}
            </p>
          ) : null}

          <div className='mt-3'>
            <span className='text-lg font-bold tracking-tight text-[#008440]'>
              {formatCurrency(
                product.price
              )}
            </span>
          </div>

          <div className='mt-3 flex flex-wrap items-center gap-1.5'>
            <Badge
              variant='secondary'
              className='max-w-full truncate rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-medium text-text-body'
            >
              {categoriesNames || '-'}
              {remainingCategoriesCount > 0 &&
                `... +${remainingCategoriesCount}`}
            </Badge>

            <ProductStockBadge product={product} className='text-[10px]' />
          </div>
        </div>
      </Card>

      {isViewModalOpen && (
        <ProductViewModal
          open={isViewModalOpen}
          onClose={() =>
            setIsViewModalOpen(false)
          }
          product={product}
          categories={categories}
        />
      )}
    </>
  )
}
