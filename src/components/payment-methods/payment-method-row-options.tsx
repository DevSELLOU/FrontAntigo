'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RemovePaymentMethodModal } from './remove-payment-method-modal'
import { UpdatePaymentMethodModal } from './update-payment-method-modal'

interface RowOptionsProps {
  paymentMethod: PaymentMethod
}

export function PaymentMethodRowOptions({ paymentMethod }: RowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton
          label={`Editar método de pagamento ${paymentMethod.name}`}
          onClick={() => setUpdateModalIsOpen(true)}
        >
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton
          label={`Remover método de pagamento ${paymentMethod.name}`}
          onClick={() => setRemoveModalIsOpen(true)}
        >
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdatePaymentMethodModal
          open={updateModalIsOpen}
          onClose={() => setUpdateModalIsOpen(false)}
          paymentMethod={paymentMethod}
        />
      )}
      {removeModalIsOpen && (
        <RemovePaymentMethodModal
          open={removeModalIsOpen}
          onClose={() => setRemoveModalIsOpen(false)}
          paymentMethod={paymentMethod}
        />
      )}
    </TooltipProvider>
  )
}
