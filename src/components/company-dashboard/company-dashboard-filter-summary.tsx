'use client'

import { Badge } from '@/components/ui/badge'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { summarizeCompanyDashboardFilters } from '@/utils/dashboard/summarize-company-dashboard-filters'

/**
 * Thin strip shown only while a filter is active, replacing the old always-visible "Filtros"
 * panel header. Driven by the URL — the applied filter, not whatever's pending inside the
 * drawer — which is more honest than the old badges (they counted the selection before
 * "Aplicar Filtros" was even clicked).
 */
export function CompanyDashboardFilterSummary() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const items = summarizeCompanyDashboardFilters(searchParams)
  if (items.length === 0) return null

  const handleClear = () => {
    const params = new URLSearchParams()
    const currentTab = searchParams.get('tab')
    if (currentTab) params.set('tab', currentTab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] px-4 py-2.5 backdrop-blur-sm">
      <span className="text-caption font-semibold text-text-muted">Filtros ativos:</span>
      {items.map(item => (
        <Badge key={item.key} variant="outline" className="bg-surface">
          {item.label}
        </Badge>
      ))}
      <button
        type="button"
        onClick={handleClear}
        className="ml-auto text-caption font-semibold text-primary hover:opacity-80 transition-opacity"
      >
        Limpar
      </button>
    </div>
  )
}
