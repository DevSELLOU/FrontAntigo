import { OrderStatus } from '@/enums/order-status.enum'
import { ProductPhoto } from './product.interface'

export interface Order {
  id: number
  observation: string
  amountPaid: number
  status: OrderStatus
  returnReason: string
  isCustomerClientOrder: null
  totalValue: number
  paymentMethodId: number | null
  paymentConditionId: number
  responsibleUserId: number
  responsibleUsers?: { id: number; name: string }[]
  customerId: number
  companyId: number
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItem[]
  discount: number
  isBudget: boolean
  programmedDate?: string
  purchaseOrderNumber?: string
}

export interface OrderItem {
  quantity: number
  orderId: number
  productId: number
  createdAt: Date
  updatedAt: Date
  product: OrderItemProduct
}

export interface OrderItemProduct {
  id: number
  name: null | string
  description: string
  price: string
  ncm: null
  photos: ProductPhoto[]
  colors: null
  brand: null
  unitOfMeasure: null
  height: null
  length: null
  width: null
  netWeight: null
  thickness: null
  reference: null
  supplierCode: string
  barcode: string
  model: null
  stock: number | null
  companyId: number
  createdAt: Date
  updatedAt: Date
}
