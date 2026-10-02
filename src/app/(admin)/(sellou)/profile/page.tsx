import { ProfilePage } from '@/components/profile/profile-page'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Meu perfil'
}

/**
 * Account screen inside the platform (Sellou) shell. Same component as the company route — the two
 * exist only because the avatar menu lives in two different shells, and a user standing in one of
 * them should not be thrown into the other to change a password.
 */
export default function SellouProfilePage() {
  return <ProfilePage />
}
