import { UserRole } from '@/enums/user-role.enum'
import { z } from 'zod'

export const UserCompanySchema = z.object({
  name: z.string().min(3, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  role: z.enum([
    UserRole.Ceo, 
    UserRole.CompanyAdministrator, 
    UserRole.CustomerClient,
    UserRole.DirectorOfSales,
    UserRole.NationalManager,
    UserRole.RegionalManager,
    UserRole.SalesCoordinator,
    UserRole.SalesRep
  ], { message: 'Função inválida' }),
})
