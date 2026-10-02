import { Column } from '@tanstack/react-table'

interface SortableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  label: string
}

export function SortableColumnHeader<TData, TValue>({ column, label }: SortableColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted()

  return (
    <button
      type='button'
      onClick={column.getToggleSortingHandler()}
      className='flex w-full min-h-11 items-center justify-between gap-2 px-5 py-2.5 text-left hover:bg-border/45 hover:text-text-body transition-colors'
    >
      <span>{label}</span>
      <span aria-hidden='true' className='relative h-[15px] w-[15px] shrink-0 text-text-muted'>
        <svg
          viewBox='0 0 16 16'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.7'
          className='absolute inset-0 h-full w-full transition-opacity'
          style={{ opacity: sorted === 'asc' ? 1 : sorted === 'desc' ? 0.18 : 1, color: sorted === 'asc' ? 'var(--custom-color, var(--action))' : undefined }}
        >
          <path d='m4 9 4-4 4 4' />
        </svg>
        <svg
          viewBox='0 0 16 16'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.7'
          className='absolute inset-0 h-full w-full transition-opacity'
          style={{ opacity: sorted === 'desc' ? 1 : sorted === 'asc' ? 0.18 : 0.28, color: sorted === 'desc' ? 'var(--custom-color, var(--action))' : undefined }}
        >
          <path d='m4 7 4 4 4-4' />
        </svg>
      </span>
    </button>
  )
}
