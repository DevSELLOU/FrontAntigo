import { defaultExcludeFields } from '@/constants/advanced-filter'
import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const productsExcludeFields = [...defaultExcludeFields, 'companyId', 'photos', 'subCategories']

export const productsFieldMapping: FieldTypeMapping = {
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
  ncm: {
    type: 'text',
    label: 'NCM'
  },
  colors: {
    type: 'text',
    label: 'Cores'
  },
  brand: {
    type: 'text',
    label: 'Marca'
  },
  unitOfMeasure: {
    type: 'text',
    label: 'Unidade de medida'
  },
  height: {
    type: 'number',
    label: 'Altura'
  },
  width: {
    type: 'number',
    label: 'Largura'
  },
  length: {
    type: 'number',
    label: 'Comprimento'
  },
  netWeight: {
    type: 'number',
    label: 'Peso líquido'
  },
  thickness: {
    type: 'number',
    label: 'Espessura'
  },
  reference: {
    type: 'text',
    label: 'Referência'
  },
  model: {
    type: 'text',
    label: 'Modelo'
  },
  stock: {
    type: 'text',
    label: 'Estoque'
  }
}
