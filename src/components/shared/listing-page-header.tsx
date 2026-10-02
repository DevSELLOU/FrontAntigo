'use client'

import { Columns3, LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type ListingViewMode = 'list' | 'grid' | 'kanban'

interface ViewOption {
  value: ListingViewMode
  label: string
  icon: typeof List
}

const VIEW_OPTIONS: ViewOption[] = [
  { value: 'list', label: 'Visualização em lista', icon: List },
  { value: 'grid', label: 'Visualização em grade', icon: LayoutGrid },
  { value: 'kanban', label: 'Visualização em kanban', icon: Columns3 }
]

interface ListingPageHeaderProps {
  title: string
  description: string
  /** Enables the search input. Omit to hide search entirely (e.g. dashboards with no list to search). */
  onSearch?: (query: string) => void
  searchValue?: string
  onFilterClick?: () => void
  filterCount?: number
  onViewChange?: (view: ListingViewMode) => void
  currentView?: ListingViewMode
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryActions?: ReactNode
  showViewSelector?: boolean
  enableKanban?: boolean
  /** Icon shown in a rounded chip to the left of the title. Only used when `card` is true. */
  icon?: ReactNode
  /** Small uppercase label above the title. Only used when `card` is true. */
  eyebrow?: string
  /** Wraps the header in the glassmorphism card shell used by the green-visual-direction screens. */
  card?: boolean
}

export function ListingPageHeader({
  title,
  description,
  onSearch,
  searchValue,
  onFilterClick,
  filterCount = 0,
  onViewChange,
  currentView = 'list',
  primaryAction,
  secondaryActions,
  showViewSelector = true,
  enableKanban = false,
  icon,
  eyebrow,
  card = false
}: ListingPageHeaderProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = searchValue ?? internalQuery

  const views = enableKanban ? VIEW_OPTIONS : VIEW_OPTIONS.filter(v => v.value !== 'kanban')
  const hasSearchGroup = Boolean(onSearch || onFilterClick)
  const hasToolbar = Boolean(hasSearchGroup || showViewSelector || secondaryActions || primaryAction)

  const content = (
    <div className='flex flex-col gap-[18px] min-w-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6'>
      {/* Title and description */}
      <div className={cn('flex-none min-w-0 lg:min-w-[280px]', card && 'flex items-start gap-4')}>
        {card && icon && (
          <div className='hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#008440] text-white shadow-sm sm:flex'>
            {icon}
          </div>
        )}

        <div className='min-w-0'>
          {card ? (
            <>
              {eyebrow && (
                <p className='mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#008440]'>{eyebrow}</p>
              )}
              <h1 className='text-2xl font-bold tracking-tight text-text sm:text-3xl'>{title}</h1>
              <p className='mt-1 max-w-2xl text-sm leading-6 text-text-muted sm:text-base'>{description}</p>
            </>
          ) : (
            <>
              <h1 className='text-h1 text-text'>{title}</h1>
              <p className='text-body text-text-muted mt-1'>{description}</p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      {hasToolbar && (
      <div className='flex flex-col gap-3 min-w-0 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:flex-1'>
        {/* Search + filter */}
        {hasSearchGroup && (
        <div className='flex items-center gap-2 w-full min-w-0 lg:w-auto'>
          {onSearch && (
          <Input
            type='search'
            placeholder='Buscar...'
            value={query}
            onChange={e => {
              setInternalQuery(e.target.value)
              onSearch?.(e.target.value)
            }}
            startContent={<Search className='h-[19px] w-[19px] text-text-muted' />}
            className='h-11 w-full min-w-0 lg:w-[220px] xl:w-[280px] 2xl:w-[340px] bg-surface'
          />
          )}

          {onFilterClick && (
            <button
              type='button'
              onClick={onFilterClick}
              aria-label='Abrir filtros avançados'
              className='relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-body hover:bg-surface-muted transition-colors'
            >
              <SlidersHorizontal className='h-[19px] w-[19px]' />
              {filterCount > 0 && (
                <span className='absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600' />
              )}
            </button>
          )}
        </div>
        )}

        <div className='flex flex-wrap items-center justify-end gap-2.5'>
          {showViewSelector && (
            <div
              role='group'
              aria-label='Modo de visualização'
              className='flex items-center gap-0.5 p-[3px] bg-brand-050 border border-brand-100 rounded-md'
            >
              {views.map(view => {
                const Icon = view.icon
                const isActive = currentView === view.value
                return (
                  <button
                    key={view.value}
                    type='button'
                    onClick={() => onViewChange?.(view.value)}
                    aria-label={view.label}
                    aria-pressed={isActive}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[9px] text-text-body transition-colors',
                      isActive ? 'bg-surface text-primary shadow-card' : 'hover:bg-surface'
                    )}
                  >
                    <Icon className='h-[18px] w-[18px]' />
                  </button>
                )
              })}
            </div>
          )}

          {secondaryActions}

          {primaryAction && (
            <Button onClick={primaryAction.onClick} className='gap-2 whitespace-nowrap'>
              + {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
      )}
    </div>
  )

  if (!card) return content

  return (
    <header className='relative shrink-0 overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] px-5 py-5 shadow-sm backdrop-blur-sm sm:px-6 lg:px-7'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#35DD48]/15 blur-3xl'
      />

      <div
        aria-hidden='true'
        className='pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#008440]/5 blur-3xl'
      />

      <div className='relative'>{content}</div>
    </header>
  )
}
