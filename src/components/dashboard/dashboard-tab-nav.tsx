import { SegmentedTabNav } from '@/components/shared/segmented-tab-nav'
import { DASHBOARD_TABS } from '@/constants/dashboard-tabs'
import type { DashboardTab } from '@/interfaces/dashboard/dashboard-v2.types'

interface DashboardTabNavProps {
  currentTab: DashboardTab
  baseHref?: string
}

/** Dashboard's tabs on the shared capsule nav — see `shared/segmented-tab-nav.tsx`. */
export function DashboardTabNav({ currentTab, baseHref = '' }: DashboardTabNavProps) {
  return (
    <SegmentedTabNav
      tabs={DASHBOARD_TABS}
      currentTab={currentTab}
      baseHref={baseHref}
      ariaLabel='Seções do painel'
    />
  )
}
