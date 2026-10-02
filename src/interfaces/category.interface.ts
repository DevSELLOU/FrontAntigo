import { SubCategory } from './sub-category-interface'

export interface Category {
  id: number
  name: string
  description: string
  companyId: number
  createdAt: Date
  updatedAt: Date
  subCategories: SubCategory[]
}
