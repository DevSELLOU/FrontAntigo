export type CreateTripDto = {
  routeId?: number
  scheduledDate?: string
  userId: number
  dailyLimit?: number
}

export type CheckInDto = {
  customerId: number
  latitude?: number
  longitude?: number
  notes?: string
  scheduledNextVisit: string
}

export type CompleteTripDto = {
  status: string
  completionNote?: string
}

export type SkipCustomerDto = {
  customerId: number
  scheduledNextVisit: string
  notes?: string
}