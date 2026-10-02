'use client'

import { useSession } from 'next-auth/react'
import { isAdministratorRole } from '@/utils/users/is-administrator-role.util'
import { useMemo } from 'react'

interface UserCompany {
  userCompanyId: number
  companyId: number
  companyName: string
  fantasyName: string
  role: string
  logoUrl?: string
}

/**
 * Hook para obter informações de autenticação e permissões do usuário logado.
 */
export const useAuth = () => {
  const { data: session, status } = useSession()

  const user = session?.user
  const role = user?.role
  const isLoading = status === 'loading'

  const isAdministrator = useMemo(() => isAdministratorRole(role), [role])

  const companies = useMemo(() => {
    return (user?.companies as UserCompany[]) || []
  }, [user?.companies])

  const activeCompanyId = user?.activeCompanyId

  const hasMultipleCompanies = companies.length > 1

  return { user, role, isLoading, isAdministrator, companies, activeCompanyId, hasMultipleCompanies }
}
