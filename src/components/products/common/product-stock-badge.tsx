import { cn } from '@/lib/utils'
import { Product } from '@/interfaces/product.interface'
import { CircleOff, Package } from 'lucide-react'

interface ProductStockBadgeProps {
  product: Pick<Product, 'active' | 'stock'>
  className?: string
  /** Skip the "Inativo" state — use when status is already shown in its own column/badge nearby. */
  hideInactiveState?: boolean
}

export function ProductStockBadge({ product, className, hideInactiveState }: ProductStockBadgeProps) {
  if (product.active === false && !hideInactiveState) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-muted',
          className
        )}
      >
        <CircleOff className='h-3.5 w-3.5' />
        Inativo
      </span>
    )
  }

  const stock = Number(product.stock ?? 0)

  const visual =
    stock <= 0
      ? 'border-danger-border bg-danger text-danger-foreground'
      : stock <= 5
        ? 'border-warning-border bg-warning text-warning-foreground'
        : 'border-success-border bg-success text-success-foreground'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold',
        visual,
        className
      )}
    >
      <Package className='h-3.5 w-3.5' />
      {stock <= 0 ? 'Sem estoque' : stock}
    </span>
  )
}
