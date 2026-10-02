import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const companiesFieldMapping: FieldTypeMapping = {
  corporateName: {
    type: 'text',
    label: 'Razão Social'
  },
  fantasyName: {
    type: 'text',
    label: 'Nome Fantasia'
  },
  cnpj: {
    type: 'text',
    label: 'CNPJ'
  },
  status: {
    type: 'select',
    label: 'Status'
  },
  logoUrl: {
    type: 'text',
    label: 'Logo'
  },
  customColor: {
    type: 'text',
    label: 'Cor Personalizada'
  }
}
