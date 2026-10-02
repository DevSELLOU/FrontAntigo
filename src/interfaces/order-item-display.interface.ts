import { SubCategory } from './sub-category-interface'

export interface OrderItemDisplay {
  id: number
  name: string
  quantity: number
  price: number
  description?: string
  image?: string
  ncm?: string
  colors?: string
  brand?: string
  unitOfMeasure?: string
  height?: number
  length?: number
  width?: number
  netWeight?: number
  thickness?: number
  reference?: string
  model?: string
  stock?: string
  subCategories?: SubCategory[]
}
