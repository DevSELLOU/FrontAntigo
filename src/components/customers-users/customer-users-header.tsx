import { Customer } from '@/interfaces/customer.interface'
import { GenericHeaderTitle } from '../admin/generic-header-title'
import { CreateCustomerUserButton } from './create-customer-user-button'

export function CustomerUsersHeader({ customer }: { customer: Customer }) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <GenericHeaderTitle
        title='Clientes da empresa'
        description={`Gerencie os clientes da empresa: ${customer.fantasyName}`}
      />
      <CreateCustomerUserButton companyId={customer.companyId} customerId={customer.id} />
    </div>
  )
}
