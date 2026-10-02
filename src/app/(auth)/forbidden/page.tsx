import { NonAuthorizedPage } from '@/components/admin/non-authorized-page'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Sem permissão'
}

export default function ForbiddenPage() {
  return <NonAuthorizedPage />
}
