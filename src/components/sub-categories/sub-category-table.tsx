'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { SubCategoryRowOptions } from './sub-category-row-options'

interface TableProps {
  companyId: number
  subCategories: SubCategory[]
}

const VISIBILITY_STORAGE_KEY = 'sub-categories-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'createdAt', label: 'Criado há' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function SubCategoryTable({ subCategories, companyId }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<SubCategory>[] = [
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
          <SubCategoryRowOptions subCategory={row.original} companyId={companyId} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={subCategories}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhuma subcategoria encontrada com os filtros selecionados.'
    />
  )
}
