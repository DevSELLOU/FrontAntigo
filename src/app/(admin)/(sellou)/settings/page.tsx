import { redirect } from 'next/navigation'

/**
 * This route used to be a "Preferências" screen whose entire content was the change-password card —
 * i.e. it was already a profile page wearing the wrong name. Now that `/profile` exists, keeping a
 * second copy would mean two screens to maintain for one form, so the old address just forwards.
 * Kept (rather than deleted) because it is a bookmarkable URL that shipped.
 */
export default function AdminSettingsPage() {
  redirect('/profile')
}
