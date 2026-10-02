import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: METADATA_TITLE_PREFIX + 'Recuperar senha'
}

export default function ForgotPasswordPage({ params }: { params: { fantasyName: string } }) {
  return (
    <div className='flex items-center justify-center w-fit h-fit mx-auto'>
      {/* `params.fantasyName` is already the encoded path segment — re-encoding it here produced a
          link nobody could follow, the same way it did on the product page. */}
      <ForgotPasswordForm
        pathname={`/shop/${params.fantasyName}/sign-in`}
        hideLogo
        className='border border-border p-6 rounded-xl text-sm'
      />
    </div>
  )
}
