import {
  Coins,
  DollarSign,
  MapPin,
  ShoppingCart,
  TrendingDown,
  Users,
  type LucideIcon
} from 'lucide-react'

interface KpiItem {
  label: string
  value: string | number
  /** Optional second line under the value — the qualifier a metric needs to be readable on its
   * own ("Período: Jan–Mar", "12 unidades"). Omitted, the card renders exactly as before. */
  hint?: string
  type?:
    | 'money'
    | 'order'
    | 'danger'
    | 'warning'
    | 'people'
    | 'percent'
  icon?: LucideIcon
}

const ICON_MAP: Record<string, LucideIcon> = {
  money: DollarSign,
  order: ShoppingCart,
  danger: TrendingDown,
  warning: Coins,
  people: Users,
  default: MapPin
}

function formatValue(item: KpiItem) {
  if (item.type === 'money' && typeof item.value === 'number') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(item.value)
  }

  if (item.type === 'percent' && typeof item.value === 'number') {
    return `${item.value.toFixed(1)}%`
  }

  if (typeof item.value === 'number') {
    return new Intl.NumberFormat('pt-BR').format(item.value)
  }

  return item.value
}

function getVisualClasses(type?: KpiItem['type']) {
  switch (type) {
    case 'money':
      return {
        icon: 'bg-[var(--glass-icon-bg)] text-[#008440]',
        detail: 'from-[#008440] to-[#35DD48]'
      }

    case 'danger':
      return {
        icon: 'bg-danger text-danger-foreground',
        detail: 'from-danger-foreground to-danger-foreground'
      }

    case 'warning':
      return {
        icon: 'bg-warning text-warning-foreground',
        detail: 'from-warning-foreground to-warning-foreground'
      }

    case 'people':
      return {
        icon: 'bg-info text-info-foreground',
        detail: 'from-info-foreground to-info-foreground'
      }

    case 'order':
      return {
        icon: 'bg-surface-muted text-text-body',
        detail: 'from-text-muted to-text-body'
      }

    default:
      return {
        icon: 'bg-surface-muted text-text-muted',
        detail: 'from-text-muted to-text-body'
      }
  }
}

export function KpiGrid({
  items
}: {
  items: KpiItem[]
}) {
  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
      {items.map((item, index) => {
        const Icon =
          item.icon ||
          ICON_MAP[item.type || 'default'] ||
          MapPin

        const visual = getVisualClasses(item.type)
        const formattedValue = formatValue(item)

        return (
          <article
            key={`${item.label}-${index}`}
            className='group relative min-h-[148px] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--glass-hover-border)] hover:shadow-md'
          >
            <div
              aria-hidden='true'
              className='pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#35DD48]/5 blur-2xl'
            />

            <div className='relative flex flex-col gap-4'>
              <div className='flex items-start justify-between gap-3'>
                <p className='min-w-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted'>
                  {item.label}
                </p>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.icon}`}
                >
                  <Icon className='h-5 w-5' />
                </div>
              </div>

              <div className='min-w-0'>
                <p className='truncate text-2xl font-bold tracking-tight text-text sm:text-[28px]'>
                  {formattedValue}
                </p>

                {item.hint && (
                  <p className='mt-1 truncate text-caption text-text-muted'>{item.hint}</p>
                )}
              </div>
            </div>

            <div
              className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${visual.detail} opacity-0 transition-opacity group-hover:opacity-100`}
            />
          </article>
        )
      })}
    </section>
  )
}
