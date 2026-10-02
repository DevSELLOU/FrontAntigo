import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const priceTablesFieldMapping: FieldTypeMapping = {
  name: {
    type: 'text',
    label: 'Nome'
  },
  description: {
    type: 'text',
    label: 'Descrição'
  },
  price: {
    type: 'number',
    label: 'Preço'
  },
  status: {
    type: 'select',
    label: 'Status'
  }
}
