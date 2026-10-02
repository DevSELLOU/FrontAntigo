export interface VisitRecord {
  id: number
  tripId: number
  customerId: number
  customer?: {
    id: number
    fantasyName: string
    corporateName: string
  }
  timestamp: string
  latitude?: number
  longitude?: number
  notes?: string
  source?: string
  isOutsideRoute?: boolean
  scheduledNextVisit?: string
  companyId?: number
  userId?: number
  user?: {
    id: number
    name: string
  }
  trip?: {
    id: number
    status: string
    route?: {
      id: number
      name: string
      description?: string
      scheduledDate?: string
      customerIds?: number[]
      userIds?: number[]
      createdById?: number
      createdBy?: { id: number; name: string }
    }
  }
  createdAt: string
  updatedAt: string
}