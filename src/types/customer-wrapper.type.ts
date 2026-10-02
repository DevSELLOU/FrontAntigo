import { Customer } from '@/interfaces/customer.interface'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { User } from '@/interfaces/user.interface'

export type CustomerWrapper = {
  companyId: number
  customers: Customer[]
  segments: Segment[]
  paymentConditions: PaymentCondition[]
  paymentMethods: PaymentMethod[]
  users: User[]
}
