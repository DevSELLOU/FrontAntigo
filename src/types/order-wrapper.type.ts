import { Customer } from '@/interfaces/customer.interface'
import { Order } from '@/interfaces/order.interface'
import { Product } from '@/interfaces/product.interface'
import { User } from '@/interfaces/user.interface'

export type OrderWrapper = {
  companyId: number
  orders: Order[]
  products: Product[]
  customers: Customer[]
  users: User[]
}
