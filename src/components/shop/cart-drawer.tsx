'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useShop } from '@/hooks/use-shop'
import { formatCurrency } from '@/utils/format/format-currency'

import { Minus, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function CartDrawer() {
  const router = useRouter()
  const { state, dispatch, company } = useShop()

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: id })
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    }
  }

  const atStockCeiling = (item: (typeof state.items)[number]) =>
    Boolean(item.stock && item.quantity >= item.stock)

  const goToCheckout = () => {
    dispatch({ type: 'TOGGLE_CART' })
    router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/checkout`)
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={() => dispatch({ type: 'TOGGLE_CART' })}>
      <SheetContent className='flex w-full flex-col sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>Carrinho ({totalItems})</SheetTitle>
        </SheetHeader>
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 -mx-6 px-6 overflow-y-auto'>
            {state.items.length === 0 ? (
              <div className='flex h-full min-h-64 flex-col items-center justify-center'>
                <p className='text-muted-foreground mb-4'>Seu carrinho está vazio </p>
                <Button variant='outline' onClick={() => dispatch({ type: 'TOGGLE_CART' })}>
                  Continuar comprando
                </Button>
              </div>
            ) : (
              <div className='divide-y'>
                {state.items.map(item => (
                  <div key={item.id} className='flex gap-4 py-4'>
                    <div className='relative w-24 h-24'>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes='96px' className='object-cover rounded-md' />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center border rounded-md px-1'>
                          <span className='text-muted-foreground text-center text-xs'>Sem Imagem</span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium'>{item.name}</h3>
                      <p className='mb-2 text-sm text-muted-foreground'>
                        {formatCurrency(item.price)}
                        {item.quantity > 1 && (
                          <span className='ml-2 font-medium text-text'>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        )}
                      </p>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-11 w-11'
                          aria-label={item.quantity === 1 ? `Remover ${item.name} do carrinho` : `Diminuir quantidade de ${item.name}`}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className='h-4 w-4' />
                        </Button>
                        <span className='w-8 text-center' aria-live='polite'>
                          {item.quantity}
                        </span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-11 w-11'
                          aria-label={`Aumentar quantidade de ${item.name}`}
                          disabled={atStockCeiling(item)}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-11 w-11 flex-shrink-0'
                      aria-label={`Remover ${item.name} do carrinho`}
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {state.items.length > 0 && (
            <div className='border-t py-4 space-y-4'>
              <div className='flex justify-between text-lg font-semibold'>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button className='w-full' variant='outline' size='lg' onClick={() => dispatch({ type: 'TOGGLE_CART' })}>
                Continuar comprando
              </Button>
              <Button className='w-full' size='lg' onClick={goToCheckout}>
                Finalizar pedido
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
