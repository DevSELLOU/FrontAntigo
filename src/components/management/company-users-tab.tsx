'use client'

import { ManagementListTab } from '@/components/management/management-list-tab'
import { CreateUserCompanyModal } from '@/components/users-company/create-user-company-modal'
import { UsersCompanyTable } from '@/components/users-company/users-company-table'
import type { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import type { User } from '@/interfaces/user.interface'
import type { FilterField } from '@/utils/advanced-filter/filter-fields'
import { Users } from 'lucide-react'

interface CompanyUsersTabProps {
  users: User[]
  metadata: PaginatedResponseMetadata
  filterFields: FilterField[]
  companyId: number
  isAdministrator: boolean
}

export function CompanyUsersTab({ users, metadata, filterFields, companyId, isAdministrator }: CompanyUsersTabProps) {
  return (
    <ManagementListTab
      tab='usuarios'
      isAdministrator={isAdministrator}
      companyId={companyId}
      icon={<Users className='h-5 w-5' />}
      title='Usuários'
      description='Gerencie quem acessa a empresa, com qual função e situação.'
      filterFields={filterFields}
      filterTitle='Filtrar usuários'
      filterSubtitle='Refine por nome, cargo e função.'
      createLabel='Novo usuário'
      renderCreateModal={close => <CreateUserCompanyModal open onClose={close} companyId={companyId} />}
      metadata={metadata}
    >
      <UsersCompanyTable users={users} companyId={companyId} />
    </ManagementListTab>
  )
}
