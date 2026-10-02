export type ScheduledVisitStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export interface ScheduledVisit {
  id: number
  customerId: number
  customer?: {
    id: number
    fantasyName: string
    corporateName: string
  }
  userId: number
  user?: {
    id: number
    name: string
  }
  companyId: number
  scheduledDate: string
  status: ScheduledVisitStatus
  sourceTripId?: number
  sourceVisitRecordId?: number
  sourceTrip?: {
    id: number
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
  notes?: string
  createdAt: string
  updatedAt: string
}
