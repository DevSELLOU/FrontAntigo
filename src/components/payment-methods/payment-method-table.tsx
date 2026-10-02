'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { safeTableValue } from '@/utils/safe-table-value'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { PaymentMethodRowOptions } from './payment-method-row-options'

interface TableProps {
  paymentMethods: PaymentMethod[]
  companyId: number
}

const VISIBILITY_STORAGE_KEY = 'payment-methods-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'description', label: 'Descrição' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function PaymentMethodsTable({ paymentMethods }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<PaymentMethod>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome' />,
      cell: ({ row }) => <div className='truncate max-w-60'>{safeTableValue(row.getValue('name'))}</div>
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <SortableColumnHeader column={column} label='Descrição' />,
      cell: ({ row }) => (
        <div className='truncate max-w-72 text-text-muted'>{safeTableValue(row.getValue('description'))}</div>
      )
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
          <PaymentMethodRowOptions paymentMethod={row.original} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={paymentMethods}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhum método de pagamento encontrado com os filtros selecionados.'
    />
  )
}
