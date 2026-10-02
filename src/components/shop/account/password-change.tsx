'use client'

import { ChangePassswordForm } from '@/components/settings/change-password-form'
import { useShopAuth } from '@/hooks/use-shop-auth'

export function PasswordChange() {
  const { accessToken } = useShopAuth()

  return (
    <div className='space-y-6 max-w-md'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Alterar Senha</h2>
        <p className='text-muted-foreground'>Atualize sua senha para manter sua conta segura.</p>
      </div>

      <ChangePassswordForm shopAccessToken={accessToken} />
    </div>
  )
}
