'use client'

import { ChartBar } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/shared/dashboard/dashboard-header'
import { ExportDock } from '@/components/dashboard/export-dock'
import { DashboardFilters } from './company-dashboard-filters'
import { CompanyDashboardFilterSummary } from './company-dashboard-filter-summary'
import { summarizeCompanyDashboardFilters } from '@/utils/dashboard/summarize-company-dashboard-filters'

/**
 * Owns the drawer's open state and the header/summary/drawer composition for the Company
 * Dashboard's top section — the piece the header, export menu and filter drawer used to be
 * three independent, unstyled fragments directly in `page.tsx`. Named deliberately unlike
 * `company-dashboard-header.tsx` (a dead file from earlier this same session, already removed)
 * so the two aren't confused reading `git log`.
 */
export function CompanyDashboardToolbar({ companyId }: { companyId: number }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const searchParams = useSearchParams()

  const filterCount = useMemo(() => summarizeCompanyDashboardFilters(searchParams).length, [searchParams])

  return (
    <div className="flex flex-col gap-3">
      <DashboardHeader
        card
        icon={<ChartBar className="h-5 w-5" />}
        eyebrow="Desempenho comercial"
        showRefresh
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
        secondaryActions={<ExportDock companyId={companyId} />}
      />
      <CompanyDashboardFilterSummary />
      <DashboardFilters companyId={companyId} open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </div>
  )
}
