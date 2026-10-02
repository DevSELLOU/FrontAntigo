export interface HistoryEntry {
  id: number
  type: 'visit' | 'skip'
  customerId: number
  customer?: {
    id: number
    fantasyName: string
    corporateName: string
  }
  userId?: number
  user?: {
    id: number
    name: string
  }
  companyId?: number
  timestamp: string
  notes?: string
  source?: string
  isOutsideRoute?: boolean
  scheduledNextVisit?: string
  latitude?: number
  longitude?: number
  routeName?: string
  routeDescription?: string
  routeScheduledDate?: string
  routeCustomerCount?: number
  routeUserCount?: number
  routeCreatedBy?: { id: number; name: string }
}
