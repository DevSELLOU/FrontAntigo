'use client'

import { ColumnVisibilityToggle } from '@/components/shared/column-visibility-toggle'
import { usePersistedColumnVisibility } from '@/hooks/use-persisted-column-visibility'
import { Category } from '@/interfaces/category.interface'
import { getSubItemsCount } from '@/utils/get-subcategories-count'
import { howTimeAgo } from '@/utils/how-time-ago.util'
import { useUrlSorting } from '@/hooks/use-url-sorting'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import { DataTable } from '../ui/data-table'
import { SortableColumnHeader } from '../ui/sortable-column-header'
import { CategoryRowOptions } from './category-row-options'

interface TableProps {
  categories: Category[]
  companyId: number
}

const VISIBILITY_STORAGE_KEY = 'categories-table-columns'

const DEFAULT_VISIBILITY: VisibilityState = {}

const TOGGLEABLE_COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nome' },
  { id: 'description', label: 'Descrição' },
  { id: 'subCategories', label: 'Subcategorias' },
  { id: 'updatedAt', label: 'Última atualização' }
]

export function CategoryTable({ categories }: TableProps) {
  const { columnVisibility, setVisibility, toggleColumn, resetVisibility } = usePersistedColumnVisibility(
    VISIBILITY_STORAGE_KEY,
    DEFAULT_VISIBILITY
  )
  const { sorting, handleSortingChange } = useUrlSorting()

  const columns: ColumnDef<Category>[] = [
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
      accessorKey: 'subCategories',
      // No sorting here: sub-categories are a relation, so the backend has no column to order by —
      // an enabled header would look clickable and quietly do nothing.
      enableSorting: false,
      header: 'Subcategorias',
      cell: ({ row }) => {
        const { names, remainingCount } = getSubItemsCount(row.original.subCategories)

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
          <CategoryRowOptions category={row.original} />
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={categories}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setVisibility}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      emptyMessage='Nenhuma categoria encontrada com os filtros selecionados.'
    />
  )
}
