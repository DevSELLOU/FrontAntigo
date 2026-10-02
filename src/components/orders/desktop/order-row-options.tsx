'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { RowActionButton } from '@/components/shared/row-action-button'
import { Order } from '@/interfaces/order.interface'
import { OrderWrapper } from '@/types/order-wrapper.type'
import { DollarSign, RefreshCw, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RemoveOrderModal } from '../common/remove-order-modal'
import { OrderStatusModal } from '../common/update-order-status-modal'
import { UpdateOrderValueModal } from '../common/update-order-value'

interface RowOptionsProps {
  order: Order
  orderWrapper: OrderWrapper
}

export function OrderRowOptions({ order, orderWrapper }: RowOptionsProps) {
  const router = useRouter()
  const [paymentModalIsOpen, setPaymentModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)
  const [statusModalIsOpen, setStatusModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center gap-1'>
        <RowActionButton label='Alterar valor pago' onClick={() => setPaymentModalIsOpen(true)}>
          <DollarSign className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton
          label='Duplicar'
          onClick={() => router.push(`/company/${orderWrapper.companyId}/orders/duplicate/${order.id}`)}
        >
          <Copy className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label='Alterar status' onClick={() => setStatusModalIsOpen(true)}>
          <RefreshCw className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label='Remover' onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {paymentModalIsOpen ? (
        <UpdateOrderValueModal
          order={order}
          orderWrapper={orderWrapper}
          open={paymentModalIsOpen}
          onClose={() => setPaymentModalIsOpen(false)}
        />
      ) : null}

      {removeModalIsOpen && (
        <RemoveOrderModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} order={order} />
      )}

      {statusModalIsOpen && (
        <OrderStatusModal open={statusModalIsOpen} onClose={() => setStatusModalIsOpen(false)} order={order} />
      )}
    </TooltipProvider>
  )
}
