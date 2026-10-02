'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { PaymentConditionRowOptions } from './payment-condition-row-options'

interface TableProps {
  paymentConditions: PaymentCondition[]
  companyId: number
}

const VISIBILITY_STORAGE_KEY = 'payment-conditions-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'description', label: 'Descrição' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function PaymentConditionsTable({ paymentConditions }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<PaymentCondition>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome' />,
      cell: ({ row }) => <div className='truncate max-w-60'>{row.getValue('name') || '-'}</div>
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <SortableColumnHeader column={column} label='Descrição' />,
      cell: ({ row }) => <div className='truncate max-w-72 text-text-muted'>{row.getValue('description') || '-'}</div>
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
          <PaymentConditionRowOptions paymentCondition={row.original} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={paymentConditions}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhuma condição de pagamento encontrada com os filtros selecionados.'
    />
  )
}
