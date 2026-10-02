export interface Route {
  id: number
  name: string
  customerIds: number[]
  description?: string
  scheduledDate?: string
  userIds?: number[]
  companyId: number
  isFixed?: boolean
  createdById?: number
  createdBy?: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface RouteCustomer {
  id: number
  fantasyName: string
  corporateName: string
  address: string
}