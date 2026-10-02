import { SegmentedTabNav } from '@/components/shared/segmented-tab-nav'
import { getVisibleManagementTabs, type ManagementTabId } from '@/constants/management-tabs'
import { ReactNode } from 'react'

interface ManagementShellProps {
  tab: ManagementTabId
  isAdministrator: boolean
  companyId: number | string
  /** Page header (card visual language) — built by each tab, since the toolbar differs. */
  header: ReactNode
  children: ReactNode
}

/**
 * Frame of the management hub: header, capsule tab bar, content. Every tab of
 * `/company/[companyId]/settings` renders through here so the page keeps a single spine no matter
 * which tab is open.
 *
 * With a single visible tab (a sales rep, who only gets Preferências) the tab bar is dropped
 * entirely — a one-item nav is noise, and the screen stays the Preferências page it has always been.
 */
export function ManagementShell({ tab, isAdministrator, companyId, header, children }: ManagementShellProps) {
  const tabs = getVisibleManagementTabs(isAdministrator)

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      {header}

      {tabs.length > 1 && (
        <SegmentedTabNav
          tabs={tabs}
          currentTab={tab}
          baseHref={`/company/${companyId}/settings`}
          ariaLabel='Seções de gerenciamento'
        />
      )}

      <div className='flex flex-col gap-4 min-w-0'>{children}</div>
    </div>
  )
}
