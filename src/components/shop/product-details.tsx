'use client'

import { useShop } from '@/hooks/use-shop'
import { useToast } from '@/hooks/use-toast'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { Product } from '@/interfaces/product.interface'
import { cn } from '@/lib/utils'
import { useCurrentHref } from '@/hooks/use-current-href'
import { buildShopSignInHref } from '@/utils/shop-return-to.util'
import { parseVideoUrl } from '@/utils/parse-video-url.util'
import { formatCurrency } from '@/utils/format/format-currency'
import { Minus, Play, Plus } from 'lucide-react'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ProductImage } from './product-image'

export function ProductDetails({ product }: { product: Product }) {
  const route = useRouter()
  const currentHref = useCurrentHref()
  const { dispatch, company } = useShop()
  const { toast } = useToast()
  const { isAuthenticated } = useShopAuth()
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const stockCeiling = Number(product.stock) || undefined

  // The seller pastes a share link; this only ever yields an embed address we build ourselves from
  // a recognised host plus a pattern-matched id, so the stored string never becomes an iframe src.
  const video = useMemo(() => parseVideoUrl(product.videoUrl), [product.videoUrl])

  const outOfStock = !product?.stock || product.stock === '0'

  // Only the specs the seller actually filled in. Substituting 'Não informado' for the blanks made
  // a sparsely-registered product render a wall of eleven "Não informado" rows, which reads as a
  // broken catalogue rather than a short one.
  const specifications = useMemo(
    () =>
      [
        { name: 'Marca', value: product.brand },
        { name: 'Modelo', value: product.model },
        { name: 'Cores', value: product.colors },
        { name: 'NCM', value: product.ncm },
        { name: 'Largura', value: product.width },
        { name: 'Altura', value: product.height },
        { name: 'Comprimento', value: product.length },
        { name: 'Peso líquido', value: product.netWeight },
        { name: 'Espessura', value: product.thickness },
        { name: 'Referência', value: product.reference },
        { name: 'Código do Fornecedor', value: product.supplierCode }
      ].filter(spec => spec.value !== null && spec.value !== undefined && String(spec.value).trim() !== ''),
    [product]
  )

  const handleAddToCart = () => {
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
        quantity,
        stock: stockCeiling
      }
    })

    toast({ title: `${quantity}× ${product.name} no carrinho`, status: 'success' })
  }

  return (
    <div className='grid grid-cols-12 gap-4 lg:gap-8'>
      <div className='col-span-12 space-y-4 lg:col-span-4'>
        <div className='relative aspect-square overflow-hidden rounded-lg border select-none'>
          {showVideo && video ? (
            <iframe
              src={video.embedUrl}
              title={`Vídeo do produto ${product.name}`}
              className='absolute inset-0 h-full w-full'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              referrerPolicy='strict-origin-when-cross-origin'
            />
          ) : (
            <ProductImage
              src={product.photos[selectedPhoto]?.url}
              alt={product.photos[selectedPhoto]?.description || product.name}
              sizes='(min-width: 1024px) 33vw, 100vw'
              priority
            />
          )}
        </div>

        {(product.photos.length > 1 || video) && (
          <div className='flex gap-3 overflow-x-auto pb-1'>
            {product.photos.map((image, index) => (
              <button
                key={index}
                type='button'
                aria-label={`Ver imagem ${index + 1} de ${product.photos.length}`}
                aria-pressed={!showVideo && selectedPhoto === index}
                className={cn(
                  'relative aspect-square w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border sm:w-24',
                  !showVideo && selectedPhoto === index ? 'border-2 border-primary' : 'border-border'
                )}
                onClick={() => {
                  setShowVideo(false)
                  setSelectedPhoto(index)
                }}
              >
                <ProductImage src={image.url} alt={`${product.name} ${index + 1}`} sizes='96px' fit='cover' />
              </button>
            ))}

            {video && (
              <button
                type='button'
                aria-label='Ver vídeo do produto'
                aria-pressed={showVideo}
                className={cn(
                  'relative flex aspect-square w-20 flex-shrink-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg border bg-surface-muted sm:w-24',
                  showVideo ? 'border-2 border-primary' : 'border-border'
                )}
                onClick={() => setShowVideo(true)}
              >
                <Play className='h-6 w-6 text-text-muted' aria-hidden='true' />
              </button>
            )}
          </div>
        )}
      </div>

      <div className='space-y-6 col-span-12 lg:col-span-8'>
        <div>
          <div className='mb-3 flex flex-wrap gap-2'>
            {product.subCategories.map(subCategory => (
              <Badge key={subCategory.id} variant='secondary'>
                {subCategory.name}
              </Badge>
            ))}
            <Badge variant='outline'>{product.brand}</Badge>
          </div>
          <h1 className='text-2xl font-bold sm:text-3xl'>{product.name}</h1>
          {isAuthenticated ? (
            <div>
              <p className='mt-2 text-xl font-bold sm:text-2xl'>{formatCurrency(product.price)}</p>
              <p>{product.unitOfMeasure}</p>
            </div>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className='prose prose-sm max-w-none'>
              {parse(DOMPurify.sanitize(product.description))}
            </CardDescription>
          </CardContent>
        </Card>

        {specifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {specifications.map(spec => (
                  <div key={spec.name}>
                    <div className='text-sm font-medium'>{spec.name}</div>
                    <div className='text-sm text-muted-foreground'>{spec.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!outOfStock && (
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium'>Quantidade</span>
            <div className='flex items-center gap-2'>
              <Button
                size='icon'
                variant='outline'
                className='h-11 w-11'
                aria-label='Diminuir quantidade'
                disabled={quantity <= 1}
                onClick={() => setQuantity(current => Math.max(1, current - 1))}
              >
                <Minus className='h-4 w-4' />
              </Button>
              <span className='min-w-10 text-center text-lg font-semibold' aria-live='polite'>
                {quantity}
              </span>
              <Button
                size='icon'
                variant='outline'
                className='h-11 w-11'
                aria-label='Aumentar quantidade'
                disabled={Boolean(stockCeiling && quantity >= stockCeiling)}
                onClick={() => setQuantity(current => (stockCeiling ? Math.min(stockCeiling, current + 1) : current + 1))}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Sticky below `lg`: the button used to sit after the description and eleven spec rows,
            so the one action the page exists for was the last thing a phone user could reach. */}
        <div className='sticky bottom-0 -mx-4 border-t bg-surface px-4 py-3 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0'>
          <Button
            className='min-h-12 w-full'
            variant={outOfStock ? 'secondary' : 'default'}
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? 'Produto fora de estoque' : 'Adicionar ao carrinho'}
          </Button>
        </div>
      </div>
    </div>
  )
}
