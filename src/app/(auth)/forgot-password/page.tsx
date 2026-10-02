import AuthTemplate from '@/components/auth/auth-template'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Recuperar senha'
}

export default function ForgotPasswordPage() {
  return (
    <AuthTemplate>
      <ForgotPasswordForm />
    </AuthTemplate>
  )
}
