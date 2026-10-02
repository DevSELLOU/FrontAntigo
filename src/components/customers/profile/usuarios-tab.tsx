'use client'

import { CreateCustomerUserButton } from '@/components/customers-users/create-customer-user-button'
import { CustomerUsersTable } from '@/components/customers-users/customer-users-table'
import { Pagination } from '@/components/admin/pagination'
import { Customer } from '@/interfaces/customer.interface'
import { CustomerUser } from '@/interfaces/customer-user.interface'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { usersCompanyFieldMapping, usersExcludeFields } from '@/helpers/users-company-field-mapping'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { AdvancedFilter } from '@/components/admin/advanced-filter'

interface UsuariosTabProps {
  customer: Customer
  customerUsers: CustomerUser[]
  customerUsersMetadata: PaginatedResponseMetadata
}

export function UsuariosTab({ customer, customerUsers, customerUsersMetadata }: UsuariosTabProps) {
  const filterFields = apiToFilterFields({
    data: customerUsers?.[0],
    enumReference: 'users',
    excludeFields: usersExcludeFields,
    fieldMappings: {
      ...usersCompanyFieldMapping,
      position: {
        type: 'text',
        label: 'Tipo'
      }
    }
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <h3 className='text-h3 text-text'>Usuários</h3>
        <CreateCustomerUserButton companyId={customer.companyId} customerId={customer.id} />
      </div>
      {/* This inline AdvancedFilter writes to the page URL, and the profile page feeds that same
          `filters` param into its customers-clients request — so here, on the full profile page,
          it genuinely works. It used to also render inside the listing's detail sheet, where it
          rewrote the listing's own filters from underneath the open drawer; that is now solved by
          the sheet hiding this tab, not by deleting a working control. */}
      <AdvancedFilter fields={filterFields} />
      {customerUsers.length > 0 ? (
        <>
          <CustomerUsersTable customer={customer} customerUsers={customerUsers} />
          <Pagination metadata={customerUsersMetadata} />
        </>
      ) : (
        <div className='flex h-48 flex-col items-center justify-center gap-2 text-text-muted'>
          <p className='text-h3'>Nenhum usuário encontrado</p>
          <p className='text-caption'>Clique em &quot;Criar usuário&quot; para adicionar um novo usuário.</p>
        </div>
      )}
    </div>
  )
}
