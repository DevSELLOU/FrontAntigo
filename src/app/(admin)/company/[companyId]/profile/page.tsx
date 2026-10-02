import { ProfilePage } from '@/components/profile/profile-page'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Meu perfil'
}

/**
 * Account screen inside the company shell — reachable from "Meu perfil" in the avatar menu and
 * from the sidebar. It inherits `company/[companyId]/layout.tsx`, which only requires a signed-in
 * role; there is deliberately no administrator check, since every user must be able to change
 * their own password.
 */
export default function CompanyProfilePage() {
  return <ProfilePage />
}
