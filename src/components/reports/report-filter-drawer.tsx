'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { FilterDrawer, FilterField } from '@/components/shared/filter-drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { normalizeString } from '@/utils/format/normalize-string.util'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface AdditionalFilterOption {
  id: string | number
  label: string
}

export interface AdditionalFilterConfig {
  /** Field label, already plural — e.g. `Vendedor(es)`. */
  label: string
  /** Query-string key the selection is written to. */
  paramName: string
  options: AdditionalFilterOption[]
}

interface Option {
  value: string
  label: string
}

export const MONTH_NAMES: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro'
}

/** Accent-insensitive matching for `cmdk`, per DESIGN §4 ("busca ignora acentos"). */
function commandFilter(value: string, search: string): number {
  return normalizeString(value).includes(normalizeString(search)) ? 1 : 0
}

interface MultiSelectFieldProps {
  label: string
  placeholder: string
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  /** Adds a search box inside the popover — worth it for the long lists (vendors, products). */
  searchable?: boolean
  emptyMessage?: string
}

function MultiSelectField({
  label,
  placeholder,
  options,
  selected,
  onChange,
  searchable = false,
  emptyMessage = 'Nenhuma opção disponível para o período selecionado.'
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false)

  const labelFor = (value: string) => options.find(option => option.value === value)?.label ?? value

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value])

  return (
    <FilterField label={label}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            // `FilterField`'s label is not tied to this trigger by `htmlFor`, so without this a
            // screen reader announces "3 selecionados" with no clue what was selected.
            aria-label={label}
            className='h-11 w-full justify-between border-border bg-surface font-normal'
          >
            <span className={cn('flex-1 truncate text-left', selected.length === 0 && 'text-text-muted')}>
              {selected.length === 0
                ? placeholder
                : selected.length === 1
                  ? labelFor(selected[0])
                  : `${selected.length} selecionados`}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start' collisionPadding={16}>
          <Command filter={searchable ? commandFilter : undefined}>
            {searchable && <CommandInput placeholder='Buscar…' />}

            {/* DESIGN §4 requires "Selecionar todos"/"Limpar" in every selector. Without them,
                picking January to June cost six separate clicks. */}
            {options.length > 0 && (
              <div className='flex items-center justify-between gap-2 border-b border-border px-2 py-1.5'>
                <button
                  type='button'
                  onClick={() => onChange(options.map(option => option.value))}
                  className='rounded-sm text-caption font-semibold text-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
                >
                  Selecionar todos
                </button>
                <button
                  type='button'
                  onClick={() => onChange([])}
                  disabled={selected.length === 0}
                  className='rounded-sm text-caption font-semibold text-text-muted transition-colors hover:text-text disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
                >
                  Limpar
                </button>
              </div>
            )}

            <CommandList>
              {options.length === 0 ? (
                <div className='p-3 text-caption text-text-muted'>{emptyMessage}</div>
              ) : (
                <>
                  {searchable && <CommandEmpty>Nada encontrado.</CommandEmpty>}
                  <CommandGroup>
                    {options.map(option => (
                      <CommandItem
                        key={option.value}
                        value={searchable ? option.label : option.value}
                        onSelect={() => toggle(option.value)}
                        className='cursor-pointer'
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className='flex flex-wrap gap-1 pt-1'>
          {selected.map(value => (
            <Badge key={value} variant='secondary' className='h-auto py-0.5 pl-2 pr-1.5 text-xs'>
              {labelFor(value)}
              <button
                type='button'
                aria-label={`Remover ${labelFor(value)}`}
                className='ml-1 rounded-full p-0.5 transition-colors hover:bg-text-muted/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
                onClick={() => onChange(selected.filter(item => item !== value))}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </FilterField>
  )
}

interface ReportFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allYears: string[]
  allMonths: string[]
  /** Applied selection, straight from the server page — the URL is the source of truth. */
  selectedYears: string[]
  selectedMonths: string[]
  additionalFilter?: AdditionalFilterConfig
  selectedThird?: string[]
}

/**
 * Period (and optional third dimension) filter for the Reports screens, in the shared
 * `FilterDrawer` shell. Replaces the inline `filter-controls.tsx` toolbar: same query-string
 * contract (`years`, `months`, plus the configured `paramName`), moved off the page body.
 *
 * The pending selection lives in local state and is only written to the URL on "Aplicar
 * filtros" — the same two-step the inline version had, minus its habit of showing the pending
 * selection as if it were already applied.
 */
export function ReportFilterDrawer({
  open,
  onOpenChange,
  allYears,
  allMonths,
  selectedYears,
  selectedMonths,
  additionalFilter,
  selectedThird = []
}: ReportFilterDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [years, setYears] = useState(selectedYears)
  const [months, setMonths] = useState(selectedMonths)
  const [third, setThird] = useState(selectedThird)

  const appliedYears = selectedYears.join(',')
  const appliedMonths = selectedMonths.join(',')
  const appliedThird = selectedThird.join(',')

  // Re-sync whenever the applied filter changes (Aplicar, Limpar, or the browser Back button),
  // so reopening the drawer never shows a selection the page isn't actually rendering.
  useEffect(() => {
    setYears(appliedYears ? appliedYears.split(',') : [])
    setMonths(appliedMonths ? appliedMonths.split(',') : [])
    setThird(appliedThird ? appliedThird.split(',') : [])
  }, [appliedYears, appliedMonths, appliedThird])

  const yearOptions: Option[] = allYears.map(year => ({ value: year, label: year }))
  const monthOptions: Option[] = allMonths.map(month => ({
    value: month,
    label: MONTH_NAMES[month] ?? month
  }))
  const thirdOptions: Option[] = (additionalFilter?.options ?? []).map(option => ({
    value: String(option.id),
    label: option.label
  }))

  const handleApply = () => {
    const params = new URLSearchParams(searchParams)

    params.delete('years')
    params.delete('months')
    if (additionalFilter) params.delete(additionalFilter.paramName)

    years.forEach(year => params.append('years', year))
    months.forEach(month => params.append('months', month))
    if (additionalFilter) third.forEach(value => params.append(additionalFilter.paramName, value))

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    onOpenChange(false)
  }

  const handleClear = () => {
    setYears([])
    setMonths([])
    setThird([])

    const params = new URLSearchParams(searchParams)
    params.delete('years')
    params.delete('months')
    if (additionalFilter) params.delete(additionalFilter.paramName)

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    onOpenChange(false)
  }

  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Filtrar relatório'
      subtitle='O filtro vale para todo o relatório.'
      onApply={handleApply}
      onClear={handleClear}
    >
      <MultiSelectField
        label='Ano(s)'
        // Not "Todos os anos": with no year in the URL the server falls back to the current one,
        // so an empty selection means "ano atual", never "todos".
        placeholder='Ano atual'
        options={yearOptions}
        selected={years}
        onChange={setYears}
      />

      <MultiSelectField
        label='Mês(es)'
        placeholder='Todos os meses'
        options={monthOptions}
        selected={months}
        onChange={setMonths}
      />

      {additionalFilter && (
        <MultiSelectField
          searchable
          label={additionalFilter.label}
          placeholder={`Todos — ${additionalFilter.label}`}
          options={thirdOptions}
          selected={third}
          onChange={setThird}
        />
      )}
    </FilterDrawer>
  )
}
