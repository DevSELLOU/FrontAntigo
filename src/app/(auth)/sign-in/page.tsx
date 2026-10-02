import AuthTemplate from '@/components/auth/auth-template'
import { SignInForm } from '@/components/auth/sign-in-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Entrar'
}

export default function SignInPage() {
  return (
    <AuthTemplate>
      <SignInForm />
    </AuthTemplate>
  )
}
