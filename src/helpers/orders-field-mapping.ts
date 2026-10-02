import { defaultExcludeFields } from '@/constants/advanced-filter'
import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const ordersExcludeFields = [
  ...defaultExcludeFields,
  'isCustomerClientOrder',
  'paymentMethodId',
  'paymentConditionId',
  'responsibleUserId',
  'customerId',
  'companyId',
  'orderItems',
  'year',
  'month'
]

export const ordersFieldMapping: FieldTypeMapping = {
  observation: {
    type: 'text',
    label: 'Observação'
  },
  amountPaid: {
    type: 'number',
    label: 'Valor Pago'
  },
  status: {
    type: 'select',
    label: 'Status'
  },
  returnReason: {
    type: 'text',
    label: 'Motivo da Devolução'
  },
  totalValue: {
    type: 'number',
    label: 'Valor Total'
  },
  discount: {
    type: 'number',
    label: 'Desconto'
  },
  customer: {
    type: 'text',
    label: 'Cliente'
  },
  responsibleUser: {
    type: 'text',
    label: 'Responsável'
  },
  paymentCondition: {
    type: 'text',
    label: 'Condição de Pagamento'
  },
  purchaseOrderNumber: {
    type: 'number',
    label: 'Número do pedido de compra'
  },
  paymentMethod: {
    type: 'text',
    label: 'Método de pagamento'
  },
}
