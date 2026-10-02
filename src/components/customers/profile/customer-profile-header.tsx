'use client'

import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { Customer } from '@/interfaces/customer.interface'
import { getCustomerTypeText } from '@/utils/customers/customer-type.util'
import { formatCpfCnpj } from '@/utils/format/format-cpf-cnpj.util'
import { getCustomerStatusText } from '@/utils/get-customer-status-text.util'
import { Contact } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CustomerProfileHeaderProps {
  customer: Customer
  companyId: number
  /**
   * `card` is the glass shell used on the full profile page. `plain` drops it, for the detail
   * sheet: a SheetContent already has its own SheetTitle, and nesting a second card header inside
   * it reads as two competing page titles.
   */
  variant?: 'card' | 'plain'
}

const STATUS_VARIANT: Record<CustomerStatus, 'success' | 'neutral' | 'danger'> = {
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'neutral',
  [CustomerStatus.Defaulting]: 'danger'
}

export function CustomerProfileHeader({ customer, companyId, variant = 'card' }: CustomerProfileHeaderProps) {
  const router = useRouter()

  const status = customer.status ?? CustomerStatus.Active
  const typeLabel = getCustomerTypeText(customer.customerType)

  const handleCreateOrder = () => {
    router.push(`/company/${companyId}/orders/create?customerId=${customer.id}`)
  }

  return (
    <ListingPageHeader
      card={variant === 'card'}
      icon={<Contact className='h-5 w-5' />}
      eyebrow='Perfil do cliente'
      title={customer.fantasyName}
      description={`${customer.corporateName} · ${formatCpfCnpj(customer.document)}`}
      showViewSelector={false}
      secondaryActions={
        <div className='flex flex-wrap items-center gap-2'>
          <StatusBadge variant={STATUS_VARIANT[status] ?? 'neutral'} className='font-semibold'>
            {getCustomerStatusText(status)}
          </StatusBadge>
          {typeLabel && <StatusBadge variant='neutral'>{typeLabel}</StatusBadge>}
        </div>
      }
      primaryAction={{ label: 'Novo pedido', onClick: handleCreateOrder }}
    />
  )
}
