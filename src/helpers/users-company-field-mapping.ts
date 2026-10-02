import { defaultExcludeFields } from '@/constants/advanced-filter'
import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const usersExcludeFields = [
  ...defaultExcludeFields,
  'customerId',
  'companyId',
  'password',
  'password_reset_token'
]

export const usersCompanyFieldMapping: FieldTypeMapping = {
  name: {
    type: 'text',
    label: 'Nome'
  },
  position: {
    type: 'text',
    label: 'Cargo'
  },
  role: {
    type: 'text',
    label: 'Função'
  }
}
