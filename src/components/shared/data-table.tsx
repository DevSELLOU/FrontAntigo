import { Card } from '@/components/ui/card'
import {
  BarChart3,
  Inbox
} from 'lucide-react'

interface Column {
  key: string
  label: string
  format?:
    | 'currency'
    | 'number'
    | 'percent'
    | 'text'
}

interface DataTableProps {
  title: string
  columns: Column[]
  data: Record<string, any>[]
}

function formatValue(
  value: any,
  format?: string
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '-'
  }

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL'
        }
      ).format(Number(value))

    case 'number':
      return new Intl.NumberFormat(
        'pt-BR'
      ).format(Number(value))

    case 'percent':
      return `${Number(value).toFixed(
        2
      )}%`

    default:
      return String(value)
  }
}

export function DataTable({
  title,
  columns,
  data
}: DataTableProps) {
  return (
    <Card className='min-w-0 overflow-hidden rounded-2xl border-border bg-surface shadow-sm'>
      <header className='flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-icon-bg)] text-[#008440]'>
          <BarChart3 className='h-4 w-4' />
        </div>

        <div className='min-w-0'>
          <h3 className='truncate text-sm font-bold text-text'>
            {title}
          </h3>

          <p className='mt-0.5 text-xs text-text-muted'>
            {data.length}{' '}
            {data.length === 1
              ? 'registro'
              : 'registros'}
          </p>
        </div>
      </header>

      <div className='w-full min-w-0 overflow-x-auto overscroll-x-contain'>
        <table className='w-full min-w-[520px] border-collapse text-sm'>
          <thead>
            <tr className='border-b border-border bg-surface-muted/80'>
              {columns.map(col => (
                <th
                  key={col.key}
                  className='whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted'
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length
                  }
                  className='px-4 py-10'
                >
                  <div className='flex flex-col items-center justify-center text-center'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-text-muted'>
                      <Inbox className='h-4 w-4' />
                    </div>

                    <p className='mt-3 text-sm font-medium text-text-muted'>
                      Nenhum dado disponível
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className='border-b border-border transition-colors last:border-b-0 hover:bg-surface-muted/70'
                >
                  {columns.map(
                    (
                      col,
                      columnIndex
                    ) => (
                      <td
                        key={col.key}
                        className={
                          columnIndex ===
                          0
                            ? 'whitespace-nowrap px-4 py-3.5 font-medium text-text'
                            : 'whitespace-nowrap px-4 py-3.5 text-text-body'
                        }
                      >
                        {formatValue(
                          row[col.key],
                          col.format
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
