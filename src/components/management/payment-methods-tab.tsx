'use client'

import { ManagementListTab } from '@/components/management/management-list-tab'
import { CreatePaymentMethodModal } from '@/components/payment-methods/create-payment-method-modal'
import { ImportPaymentMethodsModal } from '@/components/payment-methods/import-payment-methods-modal'
import { PaymentMethodsTable } from '@/components/payment-methods/payment-method-table'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { CreditCard } from 'lucide-react'

interface PaymentMethodsTabProps {
  paymentMethods: PaymentMethod[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
  isAdministrator: boolean
}

export function PaymentMethodsTab({
  paymentMethods,
  metadata,
  filterFields,
  companyId,
  isAdministrator
}: PaymentMethodsTabProps) {
  return (
    <ManagementListTab
      tab='metodos-pagamento'
      isAdministrator={isAdministrator}
      companyId={companyId}
      icon={<CreditCard className='h-5 w-5' />}
      title='Métodos de pagamento'
      description='Defina as formas de pagamento aceitas nos pedidos.'
      filterFields={filterFields}
      filterTitle='Filtrar métodos de pagamento'
      filterSubtitle='Refine por nome e descrição.'
      createLabel='Novo método'
      renderCreateModal={close => <CreatePaymentMethodModal open onClose={close} companyId={companyId} />}
      secondaryActions={<ImportPaymentMethodsModal />}
      metadata={metadata}
    >
      <PaymentMethodsTable paymentMethods={paymentMethods} companyId={companyId} />
    </ManagementListTab>
  )
}
