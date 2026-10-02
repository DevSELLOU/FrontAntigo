import { cn } from '@/lib/utils'

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusBadgeProps {
  variant: StatusBadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  success: 'bg-success text-success-foreground border border-success-border',
  warning: 'bg-warning text-warning-foreground border border-warning-border',
  danger: 'bg-danger text-danger-foreground border border-danger-border',
  info: 'bg-info text-info-foreground border border-info-border',
  neutral: 'bg-surface-muted text-text-body border border-border'
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
