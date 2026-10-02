import { defaultExcludeFields } from '@/constants/advanced-filter'
import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const accessRequestExcludeFields = [...defaultExcludeFields, 'companyId', 'customerId', 'customer']

export const accessRequestsFieldMapping: FieldTypeMapping = {
  fullName: {
    label: 'Nome',
    type: 'text'
  },
  companyName: {
    label: 'Empresa',
    type: 'text'
  },
  phoneNumber: {
    label: 'Telefone',
    type: 'text'
  },
  cnpj: {
    label: 'CNPJ',
    type: 'text'
  },
  email: {
    label: 'E-mail',
    type: 'text'
  },
  status: {
    label: 'Status',
    type: 'select'
  }
}
