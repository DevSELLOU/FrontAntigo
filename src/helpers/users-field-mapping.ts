import { defaultExcludeFields } from '@/constants/advanced-filter'
import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const usersExcludeFields = [
  ...defaultExcludeFields,
  'password',
  'password_reset_token',
  'companyId',
  'customerId',
  'company',
  'customer'
]

export const usersFieldMapping: FieldTypeMapping = {
  name: {
    type: 'text',
    label: 'Nome'
  },
  email: {
    type: 'text',
    label: 'Email'
  },
  position: {
    type: 'text',
    label: 'Cargo'
  },
  role: {
    type: 'select',
    label: 'Função'
  },
  status: {
    type: 'select',
    label: 'Status'
  }
}
