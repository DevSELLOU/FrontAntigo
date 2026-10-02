import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PackageSearch, PlugZap } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  showReset?: boolean
  onReset?: () => void
  /**
   * `error` troca o ícone e a cor. A distinção importa: com a API fora do ar a loja mostrava o
   * mesmo "Nenhum produto disponível" de uma loja realmente vazia, e o comprador ia embora
   * achando que não havia estoque — em vez de tentar de novo.
   */
  variant?: 'empty' | 'error'
  /** Quando presente, rende "Tentar de novo". */
  onRetry?: () => void
  className?: string
}

export function EmptyState({
  title = 'Nenhum produto encontrado',
  description = 'Tente ajustar os filtros para encontrar o que você procura.',
  showReset = false,
  onReset,
  variant = 'empty',
  onRetry,
  className
}: EmptyStateProps) {
  const isError = variant === 'error'
  const Icon = isError ? PlugZap : PackageSearch
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className='relative mb-6 h-52 w-52'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <Icon className={cn('h-20 w-20', isError ? 'text-danger-foreground' : 'text-muted-foreground')} />
        </div>
        <div className='absolute inset-0'>
          <svg
            className='h-full w-full'
            viewBox='0 0 100 100'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='50'
              cy='50'
              r='45'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeDasharray='4 8'
              className='text-muted/20'
            />
          </svg>
        </div>
      </div>
      <h3 className='mb-2 text-2xl font-semibold'>{title}</h3>
      <p className='mb-6 text-muted-foreground max-w-sm'>{description}</p>
      <div className='flex flex-wrap items-center justify-center gap-3'>
        {onRetry && <Button onClick={onRetry}>Tentar de novo</Button>}
        {showReset && onReset && (
          <Button onClick={onReset} variant='outline'>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
