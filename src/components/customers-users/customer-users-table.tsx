'use client'

import { CustomerUser } from '@/interfaces/customer-user.interface'
import { Customer } from '@/interfaces/customer.interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { getUserStatusText } from '@/utils/users/get-user-status-text.util'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '../ui/badge'
import { DataTable } from '../ui/data-table'
import { CustomerUserRowOptions } from './customer-user-row-options'

interface UsersTableProps {
  customerUsers: CustomerUser[]
  customer: Customer
}

const columns: ColumnDef<CustomerUser>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.getValue('id')?.toString().padStart(4, '0')
  },
  {
    accessorKey: 'name',
    header: 'Nome'
  },
  {
    accessorKey: 'email',
    header: 'E-mail'
  },
  {
    accessorKey: 'position',
    header: 'Tipo'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant='outline'>{getUserStatusText(row.getValue('status'))}</Badge>
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado',
    cell: ({ row }) => howTimeAgo(row.getValue('createdAt'))
  },
  {
    accessorKey: 'updatedAt',
    header: 'Última atualização',
    cell: ({ row }) => howTimeAgo(row.getValue('updatedAt'))
  }
]

export function CustomerUsersTable({ customerUsers, customer }: UsersTableProps) {
  const columnActions: ColumnDef<CustomerUser>[] = [
    {
      id: 'actions',
      cell: ({ row }) => {
        const customerUser = row.original

        return (
          <div className='flex items-center justify-end space-x-2'>
            <CustomerUserRowOptions customerUser={customerUser} customer={customer} />
          </div>
        )
      }
    }
  ]

  return <DataTable columns={[...columns, ...columnActions]} data={customerUsers} />
}
