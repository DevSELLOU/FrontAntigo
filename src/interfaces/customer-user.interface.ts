export interface CustomerUser {
  id: number
  name: string
  email: string
  password: string
  password_reset_token: null
  role: string
  status: string
  position: string
  companyId: number
  customerId: number
  createdAt: Date
  updatedAt: Date
}
