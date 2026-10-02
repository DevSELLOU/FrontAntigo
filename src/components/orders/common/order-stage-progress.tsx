import { Ban, RotateCcw, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { OrderStatus } from '@/enums/order-status.enum'
import { getOrderStageState } from '@/utils/get-order-stage-state.util'
import { getOrderStatusBadgeStyle } from '@/utils/get-order-status-badge-style.util'
import { getOrderStatusText } from '@/utils/get-order-status-text.util'

interface OrderStageProgressProps {
  status: OrderStatus
  className?: string
}

export function OrderStageProgress({ status, className }: OrderStageProgressProps) {
  const state = getOrderStageState(status)

  if (state.kind === 'canceled') {
    return (
      <div className={cn('flex items-center gap-1.5 text-caption font-semibold text-danger-foreground', className)}>
        <XCircle className='h-4 w-4' />
        Cancelado
      </div>
    )
  }

  if (state.kind === 'returned') {
    return (
      <div className={cn('flex items-center gap-1.5 text-caption font-semibold text-warning-foreground', className)}>
        <RotateCcw className='h-4 w-4' />
        Devolvido
      </div>
    )
  }

  if (state.kind === 'blocked') {
    return (
      <div className={cn('flex items-center gap-1.5 text-caption font-semibold text-text-muted', className)}>
        <Ban className='h-4 w-4' />
        Bloqueado
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='flex flex-1 gap-1' role='progressbar' aria-valuenow={state.index + 1} aria-valuemin={1} aria-valuemax={state.total}>
        {Array.from({ length: state.total }).map((_, i) => (
          <span
            key={i}
            className={cn('h-1.5 flex-1 rounded-full', i <= state.index ? 'bg-brand-600' : 'bg-border')}
          />
        ))}
      </div>
      <Badge className='shrink-0 rounded-full font-semibold shadow-none' style={getOrderStatusBadgeStyle(status)}>
        {getOrderStatusText(status)}
      </Badge>
    </div>
  )
}
