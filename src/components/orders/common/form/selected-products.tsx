import { Button } from '@/components/ui/button'
import { OrderItemDisplay } from '@/interfaces/order-item-display.interface'
import { formatCurrency } from '@/utils/format/format-currency'
import { Info, Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface SelectedProductsProps {
  products: OrderItemDisplay[]
  handleOpenProductDetail: (product: any) => void
  handleQuantityChange: (productId: number, quantity: number) => void
  handleRemoveProduct: (productId: number) => void
}

export function SelectedProducts({
  products,
  handleOpenProductDetail,
  handleQuantityChange,
  handleRemoveProduct
}: SelectedProductsProps) {
  return (
    <div className='mt-6'>
      <h3 className='mb-3 text-base font-bold text-text'>Produtos no pedido</h3>
      <div className='space-y-4'>
        {products.map(product => (
          <div
            key={product.id}
            className='flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row'
          >
            <div className='mx-auto flex-shrink-0 sm:mx-0'>
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={100}
                  height={100}
                  className='rounded-xl border border-border object-cover'
                  unoptimized={true}
                />
              ) : (
                <div className='flex h-[100px] w-[100px] items-center justify-center rounded-xl border border-border bg-surface-muted p-2 text-center text-caption text-text-muted'>
                  Sem imagem
                </div>
              )}
            </div>
            <div className='flex-grow space-y-2'>
              <div className='flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0'>
                <div className='flex items-center justify-between gap-2'>
                  <h3 className='text-label text-text sm:text-left'>{product.name}</h3>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    aria-label={`Detalhes de ${product.name}`}
                    className='mx-4 h-6 w-6 rounded-lg'
                    onClick={() => handleOpenProductDetail(product)}
                  >
                    <Info className='h-4 w-4' />
                  </Button>
                </div>
                <div className='font-bold tabular-nums text-[#008440] sm:text-right'>
                  {formatCurrency(product.price * product.quantity)}
                </div>
              </div>

              <div className='flex flex-wrap gap-2 text-xs'>
                {product.model && (
                  <span className='rounded-full bg-surface-muted px-2.5 py-1 text-text-body'>
                    Modelo: {product.model}
                  </span>
                )}
                {product.brand && (
                  <span className='rounded-full bg-surface-muted px-2.5 py-1 text-text-body'>
                    Marca: {product.brand}
                  </span>
                )}
                {product.reference && (
                  <span className='rounded-full bg-surface-muted px-2.5 py-1 text-text-body'>
                    Ref: {product.reference}
                  </span>
                )}
                {product.unitOfMeasure && (
                  <span className='rounded-full bg-surface-muted px-2.5 py-1 text-text-body'>
                    Unidade: {product.unitOfMeasure}
                  </span>
                )}
              </div>

              <p className='line-clamp-2 text-sm text-text-muted'>{product.description}</p>

              <div className='flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm tabular-nums text-text-body'>{formatCurrency(product.price)} cada</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label={`Diminuir quantidade de ${product.name}`}
                    className='rounded-xl'
                    onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                  >
                    <Minus className='h-4 w-4' />
                  </Button>
                  <span className='w-8 text-center tabular-nums text-text'>{product.quantity}</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label={`Aumentar quantidade de ${product.name}`}
                    className='rounded-xl'
                    onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='destructive'
                    size='icon'
                    aria-label={`Remover ${product.name} do pedido`}
                    className='rounded-xl'
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
