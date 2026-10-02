'use client'

import { ReactNode } from 'react'
import { GenericHeaderTitle } from '@/components/admin/generic-header-title'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

const DEFAULT_TITLE = 'Dashboard'
const DEFAULT_DESCRIPTION = 'Acompanhe os principais indicadores da operação.'

interface DashboardHeaderProps {
  showRefresh?: boolean
  /** Overrides the "Dashboard" wording — used by the Reports screens, which share this exact
   * header (card + refresh + filter trigger) but are not the Dashboard. */
  title?: string
  description?: string
  /** Renders the card-visual-language header instead of the sober `GenericHeaderTitle`. */
  card?: boolean
  icon?: ReactNode
  eyebrow?: string
  /** Opens a filter drawer. Only meaningful when `card` is true — the sober branch has never
   * had a filter trigger and doesn't grow one now. */
  onFilterClick?: () => void
  filterCount?: number
  /** Extra actions rendered before the "Atualizar" button (card mode only), e.g. an export menu. */
  secondaryActions?: ReactNode
}

export function DashboardHeader({
  showRefresh = false,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  card = false,
  icon,
  eyebrow,
  onFilterClick,
  filterCount,
  secondaryActions
}: DashboardHeaderProps) {
  const router = useRouter()

  const refreshButton = showRefresh ? (
    <Button
      type='button'
      variant='outline'
      onClick={() => router.refresh()}
      className='h-11 gap-2 rounded-xl border-border bg-surface shadow-sm transition-all hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)] hover:text-[#007538]'
    >
      <RefreshCw className='h-4 w-4' />
      Atualizar
    </Button>
  ) : undefined

  if (card) {
    return (
      <ListingPageHeader
        card
        icon={icon}
        eyebrow={eyebrow}
        title={title}
        description={description}
        showViewSelector={false}
        onFilterClick={onFilterClick}
        filterCount={filterCount}
        secondaryActions={
          secondaryActions || refreshButton ? (
            <>
              {secondaryActions}
              {refreshButton}
            </>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className='flex items-center justify-between gap-4'>
      <GenericHeaderTitle title={title} description={description} />
      {showRefresh && (
        <Button variant='outline' onClick={() => router.refresh()}>
          Atualizar
        </Button>
      )}
    </div>
  )
}
