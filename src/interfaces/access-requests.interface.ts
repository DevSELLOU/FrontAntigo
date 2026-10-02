import { AccessRequestStatus } from '@/enums/access-request-status.enum'

export interface AccessRequests {
  id: number
  fullName: string
  companyName: string
  phoneNumber: string
  cnpj: string
  email: string
  companyId: number
  customerId: null
  status: AccessRequestStatus
  createdAt: Date
  updatedAt: Date
  customer: null
}
