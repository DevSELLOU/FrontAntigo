import { Clock, PackageCheck, TrendingDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CustomerProductHistoryItem } from '@/interfaces/customer-product-history.interface'

interface ProductPurchaseHistoryProps {
  history?: CustomerProductHistoryItem
  windowDays: number
  /** Quantidade já adicionada ao pedido em edição. */
  quantityInOrder?: number
  className?: string
}

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

function monthsSince(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const then = new Date(year, month - 1, day)
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000)
  return { days, months: Math.floor(days / 30) }
}

/**
 * Resumo do que este cliente já comprou deste produto, para orientar a reposição.
 *
 * Três leituras possíveis: nunca comprou, compra recorrente, ou comprava e parou —
 * esta última é a que vira oportunidade de venda, então recebe destaque próprio.
 */
export function ProductPurchaseHistory({
  history,
  windowDays,
  quantityInOrder = 0,
  className
}: ProductPurchaseHistoryProps) {
  const inOrderBadge = quantityInOrder > 0 && (
    <span className='inline-flex items-center gap-1 text-primary font-semibold'>
      <PackageCheck className='h-3.5 w-3.5' />
      {quantityInOrder} no pedido
    </span>
  )

  if (!history) {
    return (
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-muted', className)}>
        <span>Nunca comprou</span>
        {inOrderBadge}
      </div>
    )
  }

  const { days } = monthsSince(history.lastPurchaseAt)
  const stoppedBuying = history.quantityInWindow === 0

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-caption', className)}>
      <span className='inline-flex items-center gap-1 text-text-muted'>
        <Clock className='h-3.5 w-3.5' />
        Última: {formatDate(history.lastPurchaseAt)}
        <span className='text-text-muted/80'>({history.lastPurchaseQuantity} un)</span>
      </span>

      {stoppedBuying ? (
        <span className='inline-flex items-center gap-1 font-semibold text-warning-foreground'>
          <TrendingDown className='h-3.5 w-3.5' />
          Sem comprar há {days} dias
        </span>
      ) : (
        <span className='text-text-body'>
          <span className='font-semibold'>{history.quantityInWindow} un</span> em {windowDays} dias
        </span>
      )}

      {inOrderBadge}
    </div>
  )
}
