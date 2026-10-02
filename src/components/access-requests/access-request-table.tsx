'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { StatusBadge } from '@/components/shared/status-badge'
import { AccessRequestStatus } from '@/enums/access-request-status.enum'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { AccessRequests } from '@/interfaces/access-requests.interface'
import { formatCnpj } from '@/utils/format/format-cnpj.util'
import { formatPhoneNumber } from '@/utils/format/format-phone.util'
import { getAccessRequestStatusText } from '@/utils/get-access-request-status-text.util'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { safeTableValue } from '@/utils/safe-table-value'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { CheckCircle2, Clock3 } from 'lucide-react'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { AccessRequestRowOptions } from './access-request-row-options'

interface TableProps {
  accessRequests: AccessRequests[]
  companyId: number
}

const VISIBILITY_STORAGE_KEY = 'access-requests-table-columns'

// `createdAt` and `updatedAt` say almost the same thing on this screen; the request's age is what
// matters when triaging, so the update time starts hidden (available, not removed).
const DEFAULT_VISIBILITY: VisibilityState = { updatedAt: false }

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'companyName', label: 'Empresa' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'email', label: 'E-mail' },
  { id: 'fullName', label: 'Nome completo' },
  { id: 'phoneNumber', label: 'Telefone' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Recebida' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function AccessRequestTable({ accessRequests }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<AccessRequests>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'companyName',
      header: ({ column }) => <SortableColumnHeader column={column} label='Empresa' />,
      cell: ({ row }) => <div className='truncate max-w-60'>{safeTableValue(row.getValue('companyName'))}</div>
    },
    {
      accessorKey: 'cnpj',
      header: ({ column }) => <SortableColumnHeader column={column} label='CNPJ' />,
      cell: ({ row }) => <div className='truncate tabular-nums'>{formatCnpj(row.original.cnpj)}</div>
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortableColumnHeader column={column} label='E-mail' />,
      cell: ({ row }) => <div className='truncate'>{safeTableValue(row.getValue('email'))}</div>
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome completo' />,
      cell: ({ row }) => <div className='truncate'>{safeTableValue(row.getValue('fullName'))}</div>
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => <SortableColumnHeader column={column} label='Telefone' />,
      cell: ({ row }) => <div className='truncate tabular-nums'>{formatPhoneNumber(row.original.phoneNumber)}</div>
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableColumnHeader column={column} label='Status' />,
      cell: ({ row }) => {
        const status = row.original.status
        const isPending = status === AccessRequestStatus.Pending
        const Icon = isPending ? Clock3 : CheckCircle2

        return (
          <StatusBadge variant={isPending ? 'warning' : 'success'} className='gap-1.5 font-semibold'>
            <Icon className='h-3.5 w-3.5' />
            {getAccessRequestStatusText(status)}
          </StatusBadge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableColumnHeader column={column} label='Recebida' />,
      cell: ({ row }) => howTimeAgo(row.getValue('createdAt'))
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
            extraColumnIds={['updatedAt']}
            onReset={resetVisibility}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1' onClick={event => event.stopPropagation()}>
          <AccessRequestRowOptions accessRequest={row.original} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={accessRequests}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhuma requisição de acesso encontrada com os filtros selecionados.'
    />
  )
}
