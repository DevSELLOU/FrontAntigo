'use client'

import { ManagementShell } from '@/components/management/management-shell'
import { CompanyPreferencesContent } from '@/components/settings/company-preferences-content'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Company } from '@/interfaces/company.interface'
import { SlidersHorizontal } from 'lucide-react'

interface PreferencesTabProps {
  company: Company | null
  companyId: number
  isAdministrator: boolean
}

/**
 * Company customisation and storefront appearance — the two things in this tab that are settings of
 * the *company*.
 *
 * The "Segurança" card that used to sit beside them moved to `/company/[companyId]/profile`: a user
 * changing their own password is not configuring the company, and pairing the two here meant the
 * only card a sales rep could see lived behind a tab whose other half was administrator-only.
 * With it gone the tab is a single column — a lone card stretched across a two-column grid left a
 * hole where the second card used to be.
 */
export function PreferencesTab({ company, companyId, isAdministrator }: PreferencesTabProps) {
  return (
    <ManagementShell
      tab='preferencias'
      isAdministrator={isAdministrator}
      companyId={companyId}
      header={
        <ListingPageHeader
          card
          icon={<SlidersHorizontal className='h-5 w-5' />}
          eyebrow='Gerenciamento'
          title='Preferências'
          description='Personalize a identidade da empresa e a aparência da loja para os seus clientes.'
          showViewSelector={false}
        />
      }
    >
      <div className='w-full min-w-0 max-w-3xl'>
        {company ? (
          <CompanyPreferencesContent company={company} className='w-full' />
        ) : (
          // Not an empty state: at this point the caller is an administrator of an existing
          // company, so "no company" can only mean the request for it failed. Saying so beats
          // showing a blank panel that reads as "you have nothing to configure".
          <Card>
            <CardHeader>
              <CardTitle>Não foi possível carregar a empresa</CardTitle>
              <CardDescription>
                Os dados de personalização não vieram do servidor. Recarregue a página; se continuar assim, avise o
                suporte.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        )}
      </div>
    </ManagementShell>
  )
}
