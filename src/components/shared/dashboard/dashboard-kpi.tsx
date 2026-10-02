import { cn } from '@/lib/utils'
import { splitCurrencyParts } from '@/utils/format/split-currency-parts.util'
import type { ReactNode } from 'react'

export interface DashboardKpiDelta {
  value: string
  positive?: boolean
  label?: string
}

export interface DashboardKpiProps {
  title: string
  value: string | number
  icon: ReactNode
  featured?: boolean
  isCurrency?: boolean
  delta?: DashboardKpiDelta
  className?: string
}

export function DashboardKpi({ title, value, icon, featured, isCurrency, delta, className }: DashboardKpiProps) {
  const currencyParts = isCurrency && typeof value === 'number' ? splitCurrencyParts(value) : null

  return (
    <div
      className={cn(
        // min-w-0: grid/flex items default to min-width: auto, which floors their width at the
        // content's natural size — a long value (Superadmin aggregates every company, so this is
        // the first place an 8-digit total shows up) then overflows into the next card instead
        // of wrapping. break-words on the value below is the other half of the same fix.
        'min-w-0 rounded-lg border p-5 shadow-card',
        featured ? 'bg-brand-050 border-brand-100' : 'bg-surface border-border',
        className
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <span className='text-eyebrow text-text-muted'>{title}</span>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-sm',
            featured ? 'bg-brand-100 text-brand-700' : 'bg-surface-muted text-text-muted'
          )}
        >
          {icon}
        </span>
      </div>

      <div className='mt-3.5 break-words text-metric text-text tracking-tight tabular-nums'>
        {currencyParts ? (
          <>
            <span className='text-body font-semibold text-text-muted mr-1'>{currencyParts.pre}</span>
            {currencyParts.main}
            <span className='text-metric-frac'>{currencyParts.frac}</span>
          </>
        ) : (
          value
        )}
      </div>

      {delta && (
        <div className='mt-2 flex items-center gap-1.5 text-caption text-text-muted'>
          <span aria-hidden='true'>{delta.positive === false ? '↘' : '↗'}</span>
          <b className={cn('font-bold', delta.positive === false ? 'text-danger-foreground' : 'text-success-foreground')}>
            {delta.value}
          </b>
          {delta.label}
        </div>
      )}
    </div>
  )
}
