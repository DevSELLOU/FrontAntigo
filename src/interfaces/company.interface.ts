import { GenericStatus } from '@/enums/generic-status.enum'

export interface Company {
  id: number
  corporateName: string
  fantasyName: string
  cnpj: string
  status: GenericStatus
  logoUrl: string | null
  customColor: string | null
  shopColor: string | null
  coverUrl: string | null
  about: string | null
  whatsapp: string | null
  phone: string | null
  address: string | null
  businessHours: string | null
  allowOrdersWithoutStock?: boolean
  createdAt: Date
  updatedAt: Date
}
