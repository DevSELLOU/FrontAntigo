import { defaultExcludeFields } from '@/constants/advanced-filter'
import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { FieldTypeMapping } from '@/utils/advanced-filter/filter-fields'

export const customersExcludeFields = [
  ...defaultExcludeFields,
  'companyId',
  'subSegmentId',
  'id',
  'paymentConditions',
  'paymentMethods',
  'orders',
  'subSegment',
  'customerClients',
  'companyPhone',
  'youtubeUrl',
  'logoUrl',
  'segment',
  'taxRegime',
  'taxWithholding',
  'operationNature',
  'bank',
  'agency',
  'account',
  'accountType',
  'invoiceEmail',
  'orderEmail',
  'billingEmail',
  'customerGroupCode'
]

const stateOptions = Object.values(CountryState).map(state => ({ label: state, value: state }))

const customerStatusLabels: Record<CustomerStatus, string> = {
  [CustomerStatus.Active]: 'Ativo',
  [CustomerStatus.Inactive]: 'Inativo',
  [CustomerStatus.Defaulting]: 'Inadimplente'
}
const statusOptions = Object.values(CustomerStatus).map(status => ({
  label: customerStatusLabels[status],
  value: status
})
)

export const customersFieldMapping: FieldTypeMapping = {
  corporateName: {
    label: 'Razão Social',
    type: 'text'
  },
  fantasyName: {
    label: 'Nome Fantasia',
    type: 'text'
  },
  document: {
    label: 'CPF/CNPJ',
    type: 'text'
  },
  stateRegistration: {
    label: 'Inscrição Estadual',
    type: 'text'
  },
  creditLimit: {
    label: 'Limite de Crédito',
    type: 'number'
  },
  creditLimitUsed: {
    label: 'Limite de Crédito Utilizado',
    type: 'number'
  },
  gln: {
    label: 'GLN',
    type: 'text'
  },
  cep: {
    label: 'CEP',
    type: 'text'
  },
  address: {
    label: 'Endereço',
    type: 'text'
  },
  city: {
    label: 'Cidade',
    type: 'text'
  },
  UF: {
    label: 'Estado',
    type: 'select',
    options: stateOptions
  },
  status: {
    label: 'Status',
    type: 'select',
    options: statusOptions
  },
  neighborhood: {
    label: 'Bairro',
    type: 'text'
  },
  phoneNumber: {
    label: 'Telefone',
    type: 'text'
  },
  email: {
    label: 'E-mail',
    type: 'text'
  },
  url: {
    label: 'URL',
    type: 'text'
  },
  observations: {
    label: 'Observações',
    type: 'text'
  }
}
