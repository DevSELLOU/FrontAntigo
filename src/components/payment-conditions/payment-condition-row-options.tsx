'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RemovePaymentConditionModal } from './remove-payment-condition-modal'
import { UpdatePaymentConditionModal } from './update-payment-condition-modal'

interface RowOptionsProps {
  paymentCondition: PaymentCondition
}

export function PaymentConditionRowOptions({ paymentCondition }: RowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton
          label={`Editar condição de pagamento ${paymentCondition.name}`}
          onClick={() => setUpdateModalIsOpen(true)}
        >
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton
          label={`Remover condição de pagamento ${paymentCondition.name}`}
          onClick={() => setRemoveModalIsOpen(true)}
        >
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdatePaymentConditionModal
          open={updateModalIsOpen}
          onClose={() => setUpdateModalIsOpen(false)}
          paymentCondition={paymentCondition}
        />
      )}
      {removeModalIsOpen && (
        <RemovePaymentConditionModal
          open={removeModalIsOpen}
          onClose={() => setRemoveModalIsOpen(false)}
          paymentCondition={paymentCondition}
        />
      )}
    </TooltipProvider>
  )
}
