import { Suspense } from 'react'
import { DashboardTabNav } from '@/components/dashboard/dashboard-tab-nav'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { CompanyDashboardToolbar } from '@/components/company-dashboard/company-dashboard-toolbar'
import { METADATA_TITLE_PREFIX } from '@/constants'
import type { DashboardTab } from '@/interfaces/dashboard/dashboard-v2.types'
import { Metadata } from 'next'

interface PageProps {
  params: { companyId: number }
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Dashboard'
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ params, searchParams }: PageProps) {
  const { companyId } = params
  const tab = ((searchParams.tab as string) || 'gestao') as DashboardTab

  const filterParams: Record<string, string> = {}
  for (const [key, value] of Object.entries(searchParams)) {
    if (key !== 'tab' && value !== undefined) {
      filterParams[key] = Array.isArray(value) ? value.join(',') : value
    }
  }

  const baseHref = `/company/${companyId}/dashboard`

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col overflow-y-auto'>
      <CompanyDashboardToolbar companyId={companyId} />
      <DashboardTabNav currentTab={tab} baseHref={baseHref} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent companyId={companyId} tab={tab} filters={filterParams} />
      </Suspense>
    </div>
  )
}
