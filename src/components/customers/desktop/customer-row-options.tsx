'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Customer } from '@/interfaces/customer.interface'
import { ExternalLink, Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RemoveCustomerModal } from '../common/remove-customer-modal'

interface CustomerRowOptionsProps {
  customer: Customer
  companyId: string | number
  onOpenDetails: (customer: Customer) => void
}

/**
 * Inline row actions, same shape as `users/user-row-options.tsx` — no dropdown menu, per
 * DESIGN.md §12 ("actions stay inline"). Every button carries a real accessible name via
 * RowActionButton's aria-label; the previous version passed `name` to a lucide icon, which does
 * nothing at all, leaving two icon buttons unnamed for screen readers.
 *
 * The old "Tabela de Preços" action is deliberately not carried over: it pushed to
 * /company/:id/price-tables/:customerId, and no such route exists in the app.
 */
export function CustomerRowOptions({ customer, companyId, onOpenDetails }: CustomerRowOptionsProps) {
  const router = useRouter()
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton label='Abrir perfil' onClick={() => router.push(`/company/${companyId}/customers/${customer.id}`)}>
          <ExternalLink className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label='Ver detalhes' onClick={() => onOpenDetails(customer)}>
          <Eye className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label='Remover cliente' onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {removeModalIsOpen && (
        <RemoveCustomerModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} customer={customer} />
      )}
    </TooltipProvider>
  )
}
