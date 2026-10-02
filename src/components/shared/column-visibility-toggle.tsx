'use client'

import { RotateCcw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface ColumnOption {
  id: string
  label: string
}

interface ColumnVisibilityToggleProps {
  columns: ColumnOption[]
  visibility: Record<string, boolean>
  onToggle: (id: string, visible: boolean) => void
  /** Column ids considered optional/extra — rendered below a divider. */
  extraColumnIds?: string[]
  /** Called when the user wants to go back to the default visibility set. */
  onReset?: () => void
}

function ColumnRow({
  column,
  checked,
  onToggle
}: {
  column: ColumnOption
  checked: boolean
  onToggle: (id: string, visible: boolean) => void
}) {
  return (
    <label className='flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-surface-muted cursor-pointer text-body text-text transition-colors'>
      <Checkbox checked={checked} onCheckedChange={value => onToggle(column.id, value === true)} />
      {column.label}
    </label>
  )
}

export function ColumnVisibilityToggle({
  columns,
  visibility,
  onToggle,
  extraColumnIds = [],
  onReset
}: ColumnVisibilityToggleProps) {
  const mainColumns = columns.filter(col => !extraColumnIds.includes(col.id))
  const extraColumns = columns.filter(col => extraColumnIds.includes(col.id))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' aria-label='Configurar colunas da tabela'>
          <Settings2 className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-64 p-3'>
        <p className='text-h3 text-text px-1 pb-2'>Colunas visíveis</p>

        <div className='flex flex-col gap-0.5'>
          {mainColumns.map(col => (
            <ColumnRow key={col.id} column={col} checked={visibility[col.id] !== false} onToggle={onToggle} />
          ))}
        </div>

        {extraColumns.length > 0 && (
          <>
            <div className='flex items-center gap-2 px-1 pt-3 pb-1.5'>
              <span className='text-eyebrow text-text-muted'>Opcionais</span>
              <div className='h-px flex-1 bg-border' />
            </div>
            <div className='flex flex-col gap-0.5'>
              {extraColumns.map(col => (
                <ColumnRow key={col.id} column={col} checked={visibility[col.id] !== false} onToggle={onToggle} />
              ))}
            </div>
          </>
        )}

        {onReset && (
          <>
            <div className='h-px bg-border mt-3 mb-2' />
            <button
              type='button'
              onClick={onReset}
              className='flex w-full items-center gap-2 px-1 py-1.5 text-caption font-semibold text-primary hover:opacity-80 transition-opacity'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Restaurar padrão
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
