'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { Segment } from '@/interfaces/segment.interface'
import { getSubItemsCount } from '@/utils/get-subcategories-count'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { SegmentRowOptions } from './segment-row-options'

interface TableProps {
  segments: Segment[]
  companyId: number
}

const VISIBILITY_STORAGE_KEY = 'segments-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'description', label: 'Descrição' },
  { id: 'subSegments', label: 'Subsegmentos' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function SegmentTable({ segments }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<Segment>[] = [
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
      accessorKey: 'subSegments',
      // Relation, not a column the backend can sort by — see the equivalent note in CategoryTable.
      enableSorting: false,
      header: 'Subsegmentos',
      cell: ({ row }) => {
        const { names, remainingCount } = getSubItemsCount(row.original.subSegments)

        return (
          <div className='max-w-60 truncate'>
            {names || '-'}
            {remainingCount > 0 && `... +${remainingCount}`}
          </div>
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
          <SegmentRowOptions segment={row.original} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={segments}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhum segmento encontrado com os filtros selecionados.'
    />
  )
}
