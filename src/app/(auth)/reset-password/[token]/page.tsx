import AuthTemplate from '@/components/auth/auth-template'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Alterar senha'
}

export default function ResetPasswordPage() {
  return (
    <AuthTemplate>
      <ResetPasswordForm />
    </AuthTemplate>
  )
}
