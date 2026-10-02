'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { StatusBadge } from '@/components/shared/status-badge'
import { GenericStatus } from '@/enums/generic-status.enum'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { Company } from '@/interfaces/company.interface'
import { formatCnpj } from '@/utils/format/format-cnpj.util'
import { getGenericStatusText } from '@/utils/get-generic-status-text.util'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { CheckCircle2, CircleDashed, CircleSlash } from 'lucide-react'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { CompanyRowOptions } from './company-row-options'

const VISIBILITY_STORAGE_KEY = 'companies-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'corporateName', label: 'Razão Social' },
  { id: 'fantasyName', label: 'Nome Fantasia' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'status', label: 'Status' },
  { id: 'updatedAt', label: 'Última atualização' }
]

const STATUS_VARIANT: Record<string, { label: string; variant: 'success' | 'neutral' | 'warning'; icon: typeof CheckCircle2 }> = {
  [GenericStatus.Active]: { label: getGenericStatusText(GenericStatus.Active), variant: 'success', icon: CheckCircle2 },
  [GenericStatus.Inactive]: { label: getGenericStatusText(GenericStatus.Inactive), variant: 'neutral', icon: CircleSlash },
  [GenericStatus.Draft]: { label: getGenericStatusText(GenericStatus.Draft), variant: 'warning', icon: CircleDashed }
}

export function CompanyTable({ companies }: { companies: Company[] }) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'corporateName',
      header: ({ column }) => <SortableColumnHeader column={column} label='Razão Social' />,
      cell: ({ row }) => <div className='truncate max-w-72'>{row.getValue('corporateName') || '-'}</div>
    },
    {
      accessorKey: 'fantasyName',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome Fantasia' />,
      cell: ({ row }) => <div className='truncate max-w-40'>{row.getValue('fantasyName') || '-'}</div>
    },
    {
      accessorKey: 'cnpj',
      header: ({ column }) => <SortableColumnHeader column={column} label='CNPJ' />,
      cell: ({ row }) => formatCnpj(row.getValue('cnpj'))
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableColumnHeader column={column} label='Status' />,
      cell: ({ row }) => {
        const status = row.original.status
        const config = STATUS_VARIANT[status]
        if (!config) return <StatusBadge variant='neutral'>{getGenericStatusText(status)}</StatusBadge>

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
      cell: ({ row }) => {
        const company = row.original

        return (
          <div className='flex items-center justify-end gap-1' onClick={e => e.stopPropagation()}>
            <CompanyRowOptions company={company} />
          </div>
        )
      }
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={companies}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhuma empresa encontrada com os filtros selecionados.'
    />
  )
}
