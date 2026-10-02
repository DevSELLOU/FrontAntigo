import { CompanyRoutes } from '@/components/routes'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

interface PageProps {
  params: {
    companyId: number
  }
}

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Rotas'
}

export default function RoutesPage({ params }: PageProps) {
  return <CompanyRoutes companyId={params.companyId} />
}
