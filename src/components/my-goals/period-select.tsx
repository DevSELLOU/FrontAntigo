'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface PeriodOption {
  value: string
  label: string
}

interface PeriodSelectProps {
  /** Accessible name of the control — it has no visible label in the toolbar. */
  label: string
  options: PeriodOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Searchable single-choice selector used by the representative's period toolbar.
 * Built on Popover + Command (the pattern already used by the Company Dashboard
 * filters) because it renders in a portal — a plain absolute dropdown would be
 * clipped by the `overflow-hidden` of the glass header card.
 */
export function PeriodSelect({ label, options, value, onChange, className }: PeriodSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find(option => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-label={label}
          className={cn(
            'h-11 w-full justify-between gap-2 rounded-xl border-border bg-surface px-3.5 text-sm font-medium text-text shadow-sm transition-all hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)] hover:text-[#007538]',
            className
          )}
        >
          <span className='truncate'>{selected?.label ?? label}</span>
          <ChevronsUpDown className='h-4 w-4 shrink-0 text-text-muted' />
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0'>
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value || 'all'}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className='min-h-[44px] cursor-pointer'
                >
                  <Check className={cn('h-4 w-4 text-[#008440]', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
