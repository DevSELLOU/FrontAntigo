'use client'

import { ShopProvider } from '@/contexts/shop-context'
import { AccountManagement } from '@/components/shop/account/account-management'
import { clientFetch } from '@/utils/client-fetch.util'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useEffect, useState } from 'react'
import { ScreenLoading } from '@/components/ui/screen-loading'
import { notFound } from 'next/navigation'

export default function AccountManagementPage({ params }: { params: { fantasyName: string } }) {
  const { fantasyName } = params
  const [company, setCompany] = useState<Company | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const url = `/company/by-fantasy-name/${encodeURIComponent(fantasyName)}/public`
        const response = await clientFetch<CommonResponse<Company>>(url, { method: 'GET' })

        if (isApiErrorResponse(response)) {
          throw new Error(response.message)
        }

        setCompany(response.data)
      } catch (error) {
        console.error('Failed to fetch company:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompany()
  }, [fantasyName])

  if (isLoading) return <ScreenLoading />
  if (!company) { notFound(); return null }

  return (
    <ShopProvider company={company}>
      <AccountManagement />
    </ShopProvider>
  )
}
