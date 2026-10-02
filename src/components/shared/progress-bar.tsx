import { cn } from '@/lib/utils'

interface ProgressBarProps {
  /** Progress in percent. Values above 100 keep their meaning but the bar caps at 100%. */
  percentage: number
  /** Accessible name — the bar carries no visible label of its own. */
  label: string
  className?: string
}

/** Slim brand-green progress track. Built here instead of on `ui/progress.tsx`,
 *  which still paints itself with hardcoded gray/green/red. */
export function ProgressBar({ percentage, label, className }: ProgressBarProps) {
  const width = Math.max(0, Math.min(percentage, 100))
  const complete = percentage >= 100

  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-muted', className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r transition-[width] duration-500 motion-reduce:transition-none',
          complete ? 'from-[#008440] to-[#35DD48]' : 'from-[#006631] to-[#008440]'
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
