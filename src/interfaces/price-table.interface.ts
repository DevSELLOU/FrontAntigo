import { GenericStatus } from '@/enums/generic-status.enum'

export interface PriceTable {
  id: number
  name: string
  description?: string
  price?: number
  adjustmentType?: 'PERCENTAGE_DISCOUNT' | 'PERCENTAGE_MARKUP' | 'FIXED_VALUE'
  adjustmentValue?: number
  status: GenericStatus | 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  companyId: number
  createdAt: Date
  updatedAt: Date
  items: PriceTableItem[]
  rules?: PriceTableRule[]
}

export interface PriceTableItem {
  priceTableId: number
  productId: number
  manualPrice?: number
  isManual?: boolean
  createdAt: Date
  updatedAt: Date
  product: PriceTableItemProduct
}

interface PriceTableItemProduct {
  id: number
  name: string
  description: string
  price: string
  reference: string | null
  stock: number
}

export interface PriceTableRule {
  id: number
  priceTableId: number
  priority?: number
  conditions?: RuleCondition[]
  adjustmentType?: 'PERCENTAGE_DISCOUNT' | 'PERCENTAGE_MARKUP' | 'FIXED_VALUE'
  adjustmentValue?: number
}

export interface RuleCondition {
  field: string
  operator: 'EQUALS' | 'CONTAINS' | 'IN' | 'GREATER_THAN_OR_EQUALS'
  value: string | number | string[]
}

export interface ProductPriceData {
  productId: number
  productName: string
  basePrice: number
  minPrice?: number
  prices: ProductPriceForTable[]
}

export interface ProductPriceForTable {
  tableId: number
  tableName: string
  finalPrice: number
  isManual: boolean
  isCappedByMinPrice: boolean
}