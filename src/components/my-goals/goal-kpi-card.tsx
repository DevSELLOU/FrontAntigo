import { ReactNode } from 'react'
import { ProgressBar } from '@/components/shared/progress-bar'

interface GoalKpiCardProps {
  label: string
  value: ReactNode
  meta: string
  percentage: number
  icon: ReactNode
}

export function GoalKpiCard({ label, value, meta, percentage, icon }: GoalKpiCardProps) {
  return (
    <article className='group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:border-[var(--glass-hover-border)] hover:shadow-md'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#35DD48]/5 blur-2xl'
      />

      <div className='relative flex flex-col gap-4'>
        <div className='flex items-start justify-between gap-3'>
          <p className='min-w-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted'>{label}</p>

          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-icon-bg)] text-[#008440]'>
            {icon}
          </div>
        </div>

        <div className='min-w-0'>
          <p className='truncate text-2xl font-bold tracking-tight text-text tabular-nums sm:text-[28px]'>{value}</p>
          <p className='mt-1 truncate text-caption text-text-muted'>{meta}</p>
        </div>

        <div className='space-y-1.5'>
          <div className='flex items-center justify-between gap-2 text-caption'>
            <span className='text-text-muted'>Progresso</span>
            <span className='font-semibold tabular-nums text-text'>{percentage}%</span>
          </div>
          <ProgressBar percentage={percentage} label={`${label}: ${percentage}% da meta`} />
        </div>
      </div>
    </article>
  )
}
