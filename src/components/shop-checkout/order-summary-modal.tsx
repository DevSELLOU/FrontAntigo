'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { CartItem } from '@/contexts/shop-context'
import { formatCurrency } from '@/utils/format/format-currency'
import Image from 'next/image'
import { Loading } from '../loading'

interface OrderSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isOrderPending: boolean
  orderDetails: {
    items: CartItem[]
    paymentMethod: string
    paymentCondition: string
    subtotal: number
    customer: {
      name: string
      email: string
    }
    observation?: string
  }
}

export function OrderSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  isOrderPending,
  orderDetails
}: OrderSummaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='xl:max-w-2xl xl:max-h-[95%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Confirmar Pedido</DialogTitle>
          <DialogDescription>Revise os detalhes do seu pedido antes de finalizar</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <h4 className='font-medium'>Informações do Cliente</h4>
            <p className='text-sm text-muted-foreground'>
              {orderDetails.customer.name}
              <br />
              {orderDetails.customer.email}
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>Forma de Pagamento</h4>
            <p className='text-sm text-muted-foreground'>
              {orderDetails.paymentMethod}
              <br />
              {orderDetails.paymentCondition}
            </p>
          </div>

          {orderDetails.observation && (
            <div className='space-y-2'>
              <h4 className='font-medium'>Observações</h4>
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{orderDetails.observation}</p>
            </div>
          )}

          <div className='space-y-2'>
            <h4 className='font-medium'>Itens do Pedido</h4>
            <div className='h-[200px] overflow-y-auto rounded-md border p-4'>
              <div className='space-y-4'>
                {orderDetails.items.map(item => (
                  <div key={item.id} className='flex items-center space-x-4'>
                    <div className='relative h-16 w-16 flex-shrink-0'>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes='64px' className='rounded object-cover' />
                      ) : (
                        <div className='h-full w-full rounded border flex items-center justify-center'>
                          <span className='text-xs text-muted-foreground text-center'>Sem Imagem</span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1 space-y-1'>
                      <h5 className='text-sm font-medium'>{item.name}</h5>
                      <p className='text-sm text-muted-foreground'>Quantidade: {item.quantity}</p>
                      <p className='text-sm font-medium'>{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='flex justify-between items-center border-t pt-4'>
            <span className='font-medium'>Total do Pedido</span>
            <span className='text-lg font-bold'>{formatCurrency(orderDetails.subtotal)}</span>
          </div>
        </div>

        <DialogFooter className='gap-4'>
          <Button variant='outline' onClick={onClose} disabled={isOrderPending}>
            Voltar
          </Button>
          <Button onClick={() => onConfirm()} disabled={isOrderPending}>
            Confirmar Pedido {isOrderPending && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
