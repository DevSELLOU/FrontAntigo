import type { ScheduledVisit } from './scheduled-visit.interface'
import type { VisitRecord } from './visit-record.interface'

export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'INCOMPLETE'

export interface Trip {
  id: number
  customerIds: number[]
  status: TripStatus
  scheduledDate?: string
  routeId?: number
  route?: {
    id: number
    name: string
    customerIds: number[]
    description?: string
  }
  userId: number
  companyId: number
  completionNote?: string
  dailyLimit?: number
  overflow?: boolean
  createdAt: string
  updatedAt: string
  visitRecords?: VisitRecord[]
  scheduledVisits?: ScheduledVisit[]
}