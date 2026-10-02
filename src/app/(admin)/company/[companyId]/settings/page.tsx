import { CategoriesTab } from '@/components/management/categories-tab'
import { CompanyUsersTab } from '@/components/management/company-users-tab'
import { OrderSetupTab } from '@/components/management/order-setup-tab'
import { PaymentConditionsTab } from '@/components/management/payment-conditions-tab'
import { PaymentMethodsTab } from '@/components/management/payment-methods-tab'
import { PreferencesTab } from '@/components/management/preferences-tab'
import { SegmentsTab } from '@/components/management/segments-tab'
import { authOptions } from '@/config/auth-options'
import { METADATA_TITLE_PREFIX } from '@/constants'
import { defaultExcludeFields } from '@/constants/advanced-filter'
import {
  MANAGEMENT_TAB_LABELS,
  resolveManagementTab,
  type ManagementTabId
} from '@/constants/management-tabs'
import { Category } from '@/interfaces/category.interface'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { DefaultSearchParams } from '@/interfaces/default-search-params.interface'
import { OrderSetup } from '@/interfaces/order-setup.interface'
import { PaginatedResponse } from '@/interfaces/paginated-response.interface'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import type { User } from '@/interfaces/user.interface'
import { usersCompanyFieldMapping, usersExcludeFields } from '@/helpers/users-company-field-mapping'
import { apiToFilterFields } from '@/utils/advanced-filter/filter-fields'
import { getPageParams } from '@/utils/get-page-params.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { serverFetch } from '@/utils/server-fetch.util'
import { isAdministratorRole } from '@/utils/users/is-administrator-role.util'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: DefaultSearchParams & { tab?: string }
  params: {
    companyId: number
  }
}

// Every tab here is an authenticated, per-company listing, and the CRUD actions never actually
// invalidate anything (they call `revalidateTag` with a path-shaped string, but `serverFetch`
// registers no tags). Rendering fresh on every request is both the correct semantics for this data
// and what keeps a newly created record from being invisible until a hard reload.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const label = MANAGEMENT_TAB_LABELS[searchParams.tab as ManagementTabId] ?? 'Configurações'

  return { title: METADATA_TITLE_PREFIX + label }
}

/**
 * Management hub — one route with tabs, replacing the separate pages that used to sit under the
 * "Gerenciamento" sidebar group. The tab is resolved against the caller's role *before* any fetch
 * happens, so a non-administrator never triggers an admin-only request (see `resolveManagementTab`).
 */
export default async function CompanyManagementPage({ searchParams, params }: PageProps) {
  const { companyId } = params
  const session = await getServerSession(authOptions)
  const isAdministrator = isAdministratorRole(session?.user?.role)
  const tab = resolveManagementTab(searchParams.tab, isAdministrator)

  // Nothing in this hub belongs to a non-administrator any more — the one card that did (changing
  // your own password) now lives on the profile screen, which is where they are sent instead of to
  // an empty page or to `/forbidden`.
  if (!tab) {
    redirect(`/company/${companyId}/profile`)
  }

  switch (tab) {
    case 'categorias': {
      const pageParams = getPageParams({ searchParams, includeDateFilters: false })
      const response = await serverFetch<PaginatedResponse<Category>>(
        `/company/${companyId}/categories?${pageParams.toString()}`,
        { method: 'GET' }
      )

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      const { data: categories, metadata } = response

      const filterFields = apiToFilterFields({
        data: categories?.[0],
        excludeFields: [...defaultExcludeFields, 'companyId', 'subCategories'],
        fieldMappings: {
          name: { type: 'text', label: 'Nome' },
          description: { type: 'text', label: 'Descrição' }
        }
      })

      return (
        <CategoriesTab
          categories={categories}
          metadata={metadata}
          filterFields={filterFields}
          companyId={companyId}
          isAdministrator={isAdministrator}
        />
      )
    }

    case 'segmentos': {
      const pageParams = getPageParams({ searchParams, includeDateFilters: false })
      const response = await serverFetch<PaginatedResponse<Segment>>(
        `/company/${companyId}/segments?${pageParams.toString()}`,
        { method: 'GET' }
      )

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      const { data: segments, metadata } = response

      const filterFields = apiToFilterFields({
        data: segments?.[0],
        excludeFields: [...defaultExcludeFields, 'companyId', 'subSegments'],
        fieldMappings: {
          name: { type: 'text', label: 'Nome' },
          description: { type: 'text', label: 'Descrição' }
        }
      })

      return (
        <SegmentsTab
          segments={segments}
          metadata={metadata}
          filterFields={filterFields}
          companyId={companyId}
          isAdministrator={isAdministrator}
        />
      )
    }

    case 'condicoes-pagamento': {
      const pageParams = getPageParams({ searchParams, includeDateFilters: false })
      const response = await serverFetch<PaginatedResponse<PaymentCondition>>(
        `/company/${companyId}/payment-condition?${pageParams.toString()}`,
        { method: 'GET' }
      )

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      const { data: paymentConditions, metadata } = response

      const filterFields = apiToFilterFields({
        data: paymentConditions?.[0],
        excludeFields: [...defaultExcludeFields, 'companyId'],
        fieldMappings: {
          name: { type: 'text', label: 'Nome' },
          description: { type: 'text', label: 'Descrição' }
        }
      })

      return (
        <PaymentConditionsTab
          paymentConditions={paymentConditions}
          metadata={metadata}
          filterFields={filterFields}
          companyId={companyId}
          isAdministrator={isAdministrator}
        />
      )
    }

    case 'metodos-pagamento': {
      const pageParams = getPageParams({ searchParams, includeDateFilters: false })
      const response = await serverFetch<PaginatedResponse<PaymentMethod>>(
        `/company/${companyId}/payment-method?${pageParams.toString()}`,
        { method: 'GET' }
      )

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      const { data: paymentMethods, metadata } = response

      const filterFields = apiToFilterFields({
        data: paymentMethods?.[0],
        excludeFields: [...defaultExcludeFields, 'companyId'],
        fieldMappings: {
          name: { type: 'text', label: 'Nome' },
          description: { type: 'text', label: 'Descrição' }
        }
      })

      return (
        <PaymentMethodsTab
          paymentMethods={paymentMethods}
          metadata={metadata}
          filterFields={filterFields}
          companyId={companyId}
          isAdministrator={isAdministrator}
        />
      )
    }

    case 'usuarios': {
      const pageParams = getPageParams({ searchParams, includeDateFilters: false })
      const response = await serverFetch<PaginatedResponse<User>>(
        `/company/${companyId}/users?${pageParams.toString()}`,
        { method: 'GET' }
      )

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      const { data: users, metadata } = response

      const filterFields = apiToFilterFields({
        data: users?.[0],
        enumReference: 'users',
        excludeFields: usersExcludeFields,
        fieldMappings: usersCompanyFieldMapping
      })

      return (
        <CompanyUsersTab
          users={users}
          metadata={metadata}
          filterFields={filterFields}
          companyId={companyId}
          isAdministrator={isAdministrator}
        />
      )
    }

    case 'pedidos': {
      // A company that never saved this setup has no record to read; the endpoint answering with
      // an error is the normal "not configured yet" case, not a failure worth an error screen.
      const orderSetup = await serverFetch<PaginatedResponse<OrderSetup>>(
        `/company/${companyId}/order-setup`,
        { method: 'GET' }
      )
        .then(response => (isApiErrorResponse(response) ? null : (response.data?.[0] ?? null)))
        .catch(() => null)

      return <OrderSetupTab orderSetup={orderSetup} companyId={companyId} isAdministrator={isAdministrator} />
    }

    case 'preferencias':
    default: {
      // Only administrators get the company customisation card, so only they need the company.
      const response = isAdministrator
        ? await serverFetch<CommonResponse<Company>>(`/company/${companyId}`, { method: 'GET' })
        : null

      const company = response && !isApiErrorResponse(response) ? response.data : null

      return <PreferencesTab company={company} companyId={companyId} isAdministrator={isAdministrator} />
    }
  }
}
