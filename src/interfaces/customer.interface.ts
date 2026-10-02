import { CountryState } from '@/enums/country-state.enum'
import { CustomerStatus } from '@/enums/customer-status.enum'
import { CustomerType } from '@/enums/customer-type.enum'
import { Order } from './order.interface'

export interface CustomerAddress {
  postalCode: string
  street: string
  neighborhood: string
  city: string
  state: string
  number: string
  complement?: string
}

export interface Customer {
  id: number
  corporateName: string
  fantasyName: string
  document: string
  stateRegistration: string
  creditLimit: string
  creditLimitUsed: string
  gln?: string
  cep: string
  address: string
  city: string
  UF: CountryState
  neighborhood: string
  phoneNumber: string
  email: string
  url: string
  observations: string
  companyId: number
  subSegmentId: string
  createdAt: Date
  updatedAt: Date
  status?: CustomerStatus
  customerType?: CustomerType
  tags?: string[]
  primaryContactName?: string
  emails?: string[]
  phones?: string[]
  billingAddress?: CustomerAddress
  shippingAddress?: CustomerAddress
  paymentConditions: Payment[]
  paymentMethods: Payment[]
  sellers?: { id: number; name: string }[]
  orders?: Order[]
}

export interface Payment {
  id: number
  name: string
  description: string
  companyId: number
  createdAt: Date
  updatedAt: Date
  CustomerPaymentCondition?: CustomerPayment
  CustomerPaymentMethod?: CustomerPayment
}

export interface CustomerPayment {
  customerId: number
  paymentConditionId?: number
  createdAt: Date
  updatedAt: Date
  paymentMethodId?: number
}
