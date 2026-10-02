'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { SubSegment } from '@/interfaces/sub-segment.interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { SubSegmentRowOptions } from './sub-segment-row-options'

interface TableProps {
  companyId: number
  subSegments: SubSegment[]
}

const VISIBILITY_STORAGE_KEY = 'sub-segments-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'createdAt', label: 'Criado há' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function SubSegmentTable({ subSegments, companyId }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<SubSegment>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <SortableColumnHeader column={column} label='ID' />,
      cell: ({ row }) => row.getValue<number>('id')?.toString().padStart(4, '0')
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableColumnHeader column={column} label='Nome' />,
      cell: ({ row }) => <div className='truncate max-w-72'>{row.getValue('name') || '-'}</div>
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableColumnHeader column={column} label='Criado há' />,
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
            onReset={resetVisibility}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1' onClick={event => event.stopPropagation()}>
          <SubSegmentRowOptions subSegment={row.original} companyId={companyId} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={subSegments}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhum subsegmento encontrado com os filtros selecionados.'
    />
  )
}
