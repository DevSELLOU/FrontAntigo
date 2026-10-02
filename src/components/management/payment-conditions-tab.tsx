'use client'

import { ManagementListTab } from '@/components/management/management-list-tab'
import { CreatePaymentConditionModal } from '@/components/payment-conditions/create-payment-condition-modal'
import { ImportPaymentConditionsModal } from '@/components/payment-conditions/import-payment-conditions-modal'
import { PaymentConditionsTable } from '@/components/payment-conditions/payment-condition-table'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { CalendarClock } from 'lucide-react'

interface PaymentConditionsTabProps {
  paymentConditions: PaymentCondition[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
  isAdministrator: boolean
}

export function PaymentConditionsTab({
  paymentConditions,
  metadata,
  filterFields,
  companyId,
  isAdministrator
}: PaymentConditionsTabProps) {
  return (
    <ManagementListTab
      tab='condicoes-pagamento'
      isAdministrator={isAdministrator}
      companyId={companyId}
      icon={<CalendarClock className='h-5 w-5' />}
      title='Condições de pagamento'
      description='Defina os prazos e parcelamentos oferecidos nos pedidos.'
      filterFields={filterFields}
      filterTitle='Filtrar condições de pagamento'
      filterSubtitle='Refine por nome e descrição.'
      createLabel='Nova condição'
      renderCreateModal={close => <CreatePaymentConditionModal open onClose={close} companyId={companyId} />}
      secondaryActions={<ImportPaymentConditionsModal />}
      metadata={metadata}
    >
      <PaymentConditionsTable paymentConditions={paymentConditions} companyId={companyId} />
    </ManagementListTab>
  )
}
