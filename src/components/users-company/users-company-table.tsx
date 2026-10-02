'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserStatus } from '@/enums/user-status.enum'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { User } from '@/interfaces/user.interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { getUserRoleText } from '@/utils/users/get-user-role-text.util'
import { getUserStatusText } from '@/utils/users/get-user-status-text.util'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { CheckCircle2, CircleDashed, CircleSlash } from 'lucide-react'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { UserCompanyRowOptions } from './user-company-row-options'

interface UsersTableProps {
  companyId: number
  users: User[]
}

const VISIBILITY_STORAGE_KEY = 'company-users-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'email', label: 'E-mail' },
  { id: 'role', label: 'Função' },
  { id: 'status', label: 'Status' },
  { id: 'updatedAt', label: 'Última atualização' }
]

const STATUS_VARIANT: Record<
  string,
  { label: string; variant: 'success' | 'neutral' | 'warning'; icon: typeof CheckCircle2 }
> = {
  [UserStatus.Active]: { label: getUserStatusText(UserStatus.Active), variant: 'success', icon: CheckCircle2 },
  [UserStatus.Inactive]: { label: getUserStatusText(UserStatus.Inactive), variant: 'neutral', icon: CircleSlash },
  [UserStatus.Onboarding]: { label: getUserStatusText(UserStatus.Onboarding), variant: 'warning', icon: CircleDashed }
}

export function UsersCompanyTable({ users, companyId }: UsersTableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome' />
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortableColumnHeader column={column} label='E-mail' />
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <SortableColumnHeader column={column} label='Função' />,
      cell: ({ row }) => (
        <StatusBadge variant='neutral' className='font-semibold'>
          {getUserRoleText(row.getValue('role'))}
        </StatusBadge>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableColumnHeader column={column} label='Status' />,
      cell: ({ row }) => {
        const status = row.original.status
        const config = STATUS_VARIANT[status]
        if (!config) return <StatusBadge variant='neutral'>{getUserStatusText(status)}</StatusBadge>

        const Icon = config.icon
        return (
          <StatusBadge variant={config.variant} className='gap-1.5 font-semibold'>
            <Icon className='h-3.5 w-3.5' />
            {config.label}
          </StatusBadge>
        )
      }
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <SortableColumnHeader column={column} label='Última atualização' />,
      cell: ({ row }) => howTimeAgo(row.getValue('updatedAt'))
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => (
        <div className='flex justify-end'>
          <ColumnVisibilityToggle
            columns={TOGGLEABLE_COLUMNS}
            visibility={columnVisibility}
            onToggle={toggleColumn}
            onReset={resetVisibility}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1' onClick={event => event.stopPropagation()}>
          <UserCompanyRowOptions user={row.original} companyId={companyId} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhum usuário encontrado com os filtros selecionados.'
    />
  )
}
