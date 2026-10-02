'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Loader2, type LucideIcon } from 'lucide-react'

/** The two brand greens (DESIGN §12) — the only literal colors this file is allowed to hold. */
const BRAND_VIVID = '#35DD48'
const BRAND_DEEP = '#008440'

interface ReportCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Controls rendered on the right of the header, e.g. the chart's metric switch. */
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/**
 * Section card for the Reports screens — chart blocks and detail tables. Same shell as the KPI
 * cards (`rounded-2xl`, `border-border`, `bg-surface`, and `Card`'s own `--shadow-card`) plus the
 * green icon chip the card visual language uses for block headers, so a report reads as one
 * surface family instead of the raw shadcn `<Card>` the four screens used to stack.
 */
export function ReportCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName
}: ReportCardProps) {
  return (
    <Card className={cn('overflow-hidden rounded-2xl border-border bg-surface', className)}>
      <CardHeader className='flex flex-col gap-3 space-y-0 p-5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          {Icon && (
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-icon-bg)] text-[#008440] dark:text-[#35DD48]'>
              <Icon className='h-5 w-5' />
            </span>
          )}

          {/* Deliberately not `CardTitle`/`CardDescription`: those run their classes through
              `twMerge`, which reads `text-h3` and `text-caption` as text *colors* and drops them
              next to `text-text`. Plain strings keep the typographic scale. */}
          <div className='min-w-0'>
            <h2 className='text-h3 text-text'>{title}</h2>
            {description && <p className='text-caption mt-0.5 text-text-muted'>{description}</p>}
          </div>
        </div>

        {actions && <div className='flex flex-wrap items-center gap-2'>{actions}</div>}
      </CardHeader>

      <CardContent className={cn('p-5 pt-0', bodyClassName)}>{children}</CardContent>
    </Card>
  )
}

interface ReportEmptyStateProps {
  title: string
  hint: string
  icon?: LucideIcon
}

/** DESIGN §4 "Estados de tela": what's missing, in one short line, plus how to get out of it. */
export function ReportEmptyState({ title, hint, icon: Icon }: ReportEmptyStateProps) {
  return (
    <Card className='rounded-2xl border-border bg-surface p-5'>
      <div className='flex flex-col items-center gap-3 py-10 text-center'>
        {Icon && (
          <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--glass-icon-bg)] text-[#008440] dark:text-[#35DD48]'>
            <Icon className='h-6 w-6' />
          </span>
        )}

        <div>
          <p className='text-body font-semibold text-text'>{title}</p>
          <p className='text-caption mt-1 text-text-muted'>{hint}</p>
        </div>
      </div>
    </Card>
  )
}

/**
 * Loading placeholder shaped like the pivot table it stands in for (DESIGN §4 "Estados de tela":
 * skeletons with the measurements of the final content, never a bare page spinner). Replaces the
 * `📊 Loading Sales Pivot Table...` string that shipped to production in English, with an emoji.
 */
export function ReportLoadingState({ label }: { label: string }) {
  return (
    <div role='status' aria-live='polite' className='flex flex-col gap-4'>
      <div className='flex items-center gap-2 text-text-muted'>
        <Loader2 aria-hidden='true' className='h-4 w-4 animate-spin' />
        <span className='text-caption'>{label}</span>
      </div>

      <div aria-hidden='true' className='animate-pulse space-y-3'>
        <div className='flex flex-wrap gap-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='h-8 w-32 rounded-md border border-border bg-surface-muted' />
          ))}
        </div>

        <div className='overflow-hidden rounded-xl border border-border'>
          <div className='h-10 border-b border-border bg-surface-muted' />
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='h-9 border-b border-border last:border-b-0 bg-surface' />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Whole-screen placeholder used by `reports/loading.tsx`. Shaped like what actually arrives —
 * header card, KPI band, chart card, table card — so the layout does not jump when the data
 * lands. Before this existed, clicking a report in the sidebar left the previous page on screen
 * for the whole round trip, with no sign the click had registered.
 */
export function ReportScreenSkeleton() {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-label='Carregando o relatório'
      className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'
    >
      <div className='h-[132px] animate-pulse rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)]' />

      <div className='grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='h-[148px] rounded-2xl border border-border bg-surface-muted' />
        ))}
      </div>

      <div className='h-[440px] animate-pulse rounded-2xl border border-border bg-surface' />
      <div className='h-[320px] animate-pulse rounded-2xl border border-border bg-surface' />
    </div>
  )
}

/**
 * Sequential green ramp for ordered series (the sales chart stacks one segment per period).
 * Periods are ordered data, so a single-hue ramp reads correctly where a categorical palette
 * would imply the periods are unrelated. Both ends are the brand greens; everything between is
 * derived, which is also what keeps the ramp legible in the dark theme.
 */
export function brandSeriesRamp(count: number): string[] {
  if (count <= 0) return []
  if (count === 1) return [BRAND_DEEP]

  const from = hexToRgb(BRAND_VIVID)
  const to = hexToRgb(BRAND_DEEP)

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1)
    const channels = from.map((channel, i) => Math.round(channel + (to[i] - channel) * ratio))
    return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`
  })
}

function hexToRgb(hex: string): number[] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16))
}

/**
 * Axis and legend labels. Customer, vendor and product names run long; past this they either
 * collide on a rotated axis or overflow the category gutter. The full name stays reachable in
 * the tooltip, which is why the charts carry a `fullName` alongside the truncated one.
 */
export function truncateLabel(label: string, max = 22): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

/** Grid + axis styling shared by every report chart (DESIGN §4 "Gráficos"). */
export const REPORT_CHART_GRID_CLASS =
  '[&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-cartesian-axis-tick_text]:fill-[var(--text-muted)]'

/**
 * Chart box sizes, named so the three heights read as three decisions rather than three guesses.
 * `aspect-auto` is required: `ChartContainer` ships `aspect-video` in its base classes, which
 * fights an explicit height.
 */
/** Vertical bars, up to ~10 categories, no legend. */
export const REPORT_CHART_BOX = 'aspect-auto h-[360px] w-full'
/** Same layout plus a legend row and angled category labels. */
export const REPORT_CHART_BOX_WITH_LEGEND = 'aspect-auto h-[420px] w-full'
/** Horizontal ranking: height scales with row count, and it draws up to 15 rows. */
export const REPORT_CHART_BOX_RANKING = 'aspect-auto h-[480px] w-full'
