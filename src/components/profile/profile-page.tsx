'use client'

import { ChangePasswordContent } from '@/components/settings/change-password-content'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isUserRole } from '@/enums/user-role.enum'
import { useAuth } from '@/hooks/use-auth'
import { getUserInitials } from '@/utils/users/get-user-initials.util'
import { getUserRoleText } from '@/utils/users/get-user-role-text.util'
import { UserRound } from 'lucide-react'

const EMPTY = '—'

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-0.5 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4'>
      <dt className='text-label text-text-muted sm:w-44 sm:shrink-0'>{label}</dt>
      <dd className='text-body text-text break-words min-w-0'>{value}</dd>
    </div>
  )
}

/**
 * "Meu perfil" — the account screen behind the avatar menu.
 *
 * It exists because changing your own password is a *user* matter, not a company setting: it used
 * to sit next to "Customização" in `/company/[companyId]/settings?tab=preferencias`, a tab whose
 * other card only administrators can see. Anything here must work for every signed-in role, so the
 * screen reads the session and never checks `isAdministrator`.
 *
 * Mounted at two routes (`/profile` for the platform shell, `/company/[companyId]/profile` for the
 * company shell) so the avatar menu has a destination in whichever shell the user is standing in.
 */
export function ProfilePage() {
  const { user, role, companies, activeCompanyId } = useAuth()

  const name = user?.name ?? EMPTY
  const email = user?.email ?? EMPTY
  const roleLabel = role && isUserRole(role) ? getUserRoleText(role) : EMPTY
  const activeCompany = companies.find(company => company.companyId === activeCompanyId)

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-6 bg-app px-4 py-4 xl:px-10 xl:py-8'>
      <ListingPageHeader
        card
        icon={<UserRound className='h-5 w-5' />}
        eyebrow='Conta'
        title='Meu perfil'
        description='Seus dados de acesso à Sellou e a senha da sua conta.'
        showViewSelector={false}
      />

      <div className='flex w-full min-w-0 max-w-2xl flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
            <CardDescription>
              Nome, e-mail e perfil de acesso são definidos por quem administra a sua empresa. Para corrigir algum
              deles, fale com o administrador.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className='mb-4 flex items-center gap-3'>
              <div
                aria-hidden='true'
                className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700'
              >
                {getUserInitials(user?.name)}
              </div>
              <p className='text-h3 text-text min-w-0 break-words'>{name}</p>
            </div>

            <dl className='min-w-0'>
              <IdentityRow label='E-mail' value={email} />
              <IdentityRow label='Perfil de acesso' value={roleLabel} />
              {activeCompany && <IdentityRow label='Empresa ativa' value={activeCompany.fantasyName} />}
            </dl>
          </CardContent>
        </Card>

        <ChangePasswordContent />
      </div>
    </div>
  )
}
