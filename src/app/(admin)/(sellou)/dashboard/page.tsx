import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { DashboardHeader } from '@/components/shared/dashboard/dashboard-header'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'
import { ChartBar } from 'lucide-react'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Dashboard'
}

export default function DashboardPage() {
  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col overflow-y-auto'>
      <DashboardHeader card icon={<ChartBar className='h-5 w-5' />} eyebrow='Visão geral' />
      <DashboardGrid />
    </div>
  )
}
