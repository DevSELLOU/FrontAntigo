import { ProductStockType } from '@/enums/product-stock-type.enum'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  minPrice?: number
  commissionPercentage?: number
  ncm: string
  colors: string
  brand: string
  unitOfMeasure: string
  height: number
  length: number
  width: number
  netWeight: number
  thickness: number
  reference: string
  supplierCode: string
  model: string
  videoUrl?: string | null
  stock: string
  companyId: number
  ipi: number
  st: number
  barcode: string
  manufacturer: string
  icms: number
  photos: ProductPhoto[]
  createdAt: Date
  updatedAt: Date
  subCategories: SubCategory[]
  favorite: boolean
  active: boolean

  heightUnit?: string
  lengthUnit?: string
  widthUnit?: string
  weightUnit?: string
  thicknessUnit?: string
}

export interface ProductPhoto {
  id: number
  url: string
  description: string
  productId: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductStockMovement {
  id: number
  quantity: number
  type: ProductStockType
  productId: number
  orderId: number
  createdAt: Date
  updatedAt: Date
}

interface SubCategory {
  id: number
  name: string
  categoryId: number
  createdAt: Date
  updatedAt: Date
  ProductSubCategory: ProductSubCategory
}

interface ProductSubCategory {
  productId: number
  subCategoryId: number
  createdAt: Date
  updatedAt: Date
}