'use client'

import { ReactNode, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/shared/dashboard/dashboard-header'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AdditionalFilterConfig,
  MONTH_NAMES,
  ReportFilterDrawer
} from '@/components/reports/report-filter-drawer'

/** Chips shown in the applied-filter strip before it folds into a "+N" link. */
const CHIP_LIMIT = 8

interface ReportToolbarProps {
  title: string
  description: string
  eyebrow: string
  icon: ReactNode
  allYears: string[]
  allMonths: string[]
  selectedYears: string[]
  selectedMonths: string[]
  additionalFilter?: AdditionalFilterConfig
  selectedThird?: string[]
}

/**
 * Header + applied-filter strip + filter drawer for the four Reports screens — the piece that
 * used to be a bare `<h1 className='text-3xl font-bold'>` and an always-open row of comboboxes
 * inside each `page.tsx`. Owns only the drawer's open state; the applied filter itself comes
 * from the server page, which reads it off the URL.
 */
export function ReportToolbar({
  title,
  description,
  eyebrow,
  icon,
  allYears,
  allMonths,
  selectedYears,
  selectedMonths,
  additionalFilter,
  selectedThird = []
}: ReportToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const thirdLabel = (value: string) =>
    // `#4821` rather than a bare `4821`: an unresolvable option should still read as an id, not
    // as a value someone might mistake for a quantity.
    additionalFilter?.options.find(option => String(option.id) === value)?.label ?? `#${value}`

  const chips = [
    ...selectedYears.map(year => ({ key: `year-${year}`, label: year })),
    ...selectedMonths.map(month => ({ key: `month-${month}`, label: MONTH_NAMES[month] ?? month })),
    ...selectedThird.map(value => ({ key: `third-${value}`, label: thirdLabel(value) }))
  ]

  // The third dimension can hold every product or vendor in the company; past a handful the
  // strip stops summarising and becomes a wall. The drawer is where the full list belongs.
  const visibleChips = chips.slice(0, CHIP_LIMIT)
  const hiddenChipCount = chips.length - visibleChips.length

  // The server falls back to the current year when `years` is absent, so a report is *always*
  // showing a period and the strip is always populated. Counting that into `filterCount` would
  // light the header's filter dot permanently, which is the same as it meaning nothing — the dot
  // has to say "you are seeing less than everything". Read the URL, not the resolved values.
  const hasExplicitFilter =
    searchParams.has('years') ||
    searchParams.has('months') ||
    Boolean(additionalFilter && searchParams.has(additionalFilter.paramName))

  const handleClear = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('years')
    params.delete('months')
    if (additionalFilter) params.delete(additionalFilter.paramName)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className='flex flex-col gap-3'>
      <DashboardHeader
        card
        showRefresh
        title={title}
        description={description}
        icon={icon}
        eyebrow={eyebrow}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={hasExplicitFilter ? chips.length : 0}
      />

      {chips.length > 0 && (
        <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] px-4 py-2.5 backdrop-blur-sm'>
          <span className='text-caption font-semibold text-text-muted'>Filtros ativos:</span>
          {visibleChips.map(chip => (
            <Badge key={chip.key} variant='outline' className='bg-surface'>
              {chip.label}
            </Badge>
          ))}

          {hiddenChipCount > 0 && (
            <button
              type='button'
              onClick={() => setIsFilterOpen(true)}
              className='rounded-sm text-caption font-semibold text-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
            >
              +{hiddenChipCount} — ver no filtro
            </button>
          )}

          {/* Hidden on the default period: "Limpar" would delete params that are already absent
              and the strip would come back identical, which reads as a broken button. */}
          {hasExplicitFilter && (
            <button
              type='button'
              onClick={handleClear}
              className='ml-auto rounded-sm text-caption font-semibold text-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
            >
              Limpar
            </button>
          )}
        </div>
      )}

      <ReportFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        allYears={allYears}
        allMonths={allMonths}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
        additionalFilter={additionalFilter}
        selectedThird={selectedThird}
      />
    </div>
  )
}
