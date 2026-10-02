'use client'

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  /**
   * Controlled sorting. Pass this on server-paginated tables so ordering spans the
   * whole result set — uncontrolled sorting only reorders the rows currently loaded.
   */
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  maxHeightClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage,
  onRowClick,
  columnVisibility,
  onColumnVisibilityChange,
  sorting,
  onSortingChange,
  maxHeightClassName = 'max-h-[65vh]'
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])

  const isSortingControlled = sorting !== undefined
  const activeSorting = isSortingControlled ? sorting : internalSorting

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(isSortingControlled ? { manualSorting: true } : { getSortedRowModel: getSortedRowModel() }),
    onSortingChange: updater => {
      const next = typeof updater === 'function' ? updater(activeSorting) : updater
      if (isSortingControlled) {
        onSortingChange?.(next)
      } else {
        setInternalSorting(next)
      }
    },
    state: {
      sorting: activeSorting,
      ...(columnVisibility ? { columnVisibility } : {})
    },
    onColumnVisibilityChange: onColumnVisibilityChange
      ? updater => {
          const next = typeof updater === 'function' ? updater(columnVisibility ?? {}) : updater
          onColumnVisibilityChange(next)
        }
      : undefined
  })

  const visibleColumnCount = table.getVisibleFlatColumns().length

  const handleRowActivate = (row: TData) => {
    // Ignore the click that ends a text selection inside the row.
    if (window.getSelection()?.toString()) return
    onRowClick?.(row)
  }

  return (
    <div className={cn('rounded-md border overflow-auto', maxHeightClassName)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const sorted = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                    className={header.column.getCanSort() ? 'p-0' : undefined}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => handleRowActivate(row.original) : undefined}
                onKeyDown={
                  onRowClick
                    ? event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleRowActivate(row.original)
                        }
                      }
                    : undefined
                }
                className={cn(
                  onRowClick && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary'
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumnCount} className='h-24 text-center'>
                {emptyMessage ?? 'Nenhum resultado encontrado.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
