import { UserRole } from '@/enums/user-role.enum'
import { UserStatus } from '@/enums/user-status.enum'
import { Company } from './company.interface'
import { Customer } from './customer.interface'

export interface UserCompany {
  userCompanyId: number
  companyId: number
  companyName: string
  fantasyName: string
  role: UserRole
  logoUrl?: string
}

export interface User {
  id: number
  name: string
  email: string
  position: string
  password: string
  password_reset_token: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  companyId?: number
  activeCompanyId?: number
  companies?: UserCompany[]
  customerId?: number
  company?: Company
  customer?: Customer
}
