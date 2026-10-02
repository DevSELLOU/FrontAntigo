'use client'

import { Customer } from '@/interfaces/customer.interface'
import { CustomerUser } from '@/interfaces/customer-user.interface'
import { PaginatedResponseMetadata } from '@/interfaces/paginated-response-metadata'
import { PaymentCondition } from '@/interfaces/payment-condition.interface'
import { PaymentMethod } from '@/interfaces/payment-method.interface'
import { Segment } from '@/interfaces/segment.interface'
import { PROFILE_TABS, type ProfileTab } from '@/utils/customers/profile-tab.util'
import { CustomerSegmentedTabs } from '../common/customer-segmented-tabs'
import { AtendimentosTab } from './atendimentos-tab'
import { ContatosTab } from './contatos-tab'
import { DadosTab } from './dados-tab'
import { PedidosTab } from './pedidos-tab'
import { useProfileTab } from './use-profile-tab'
import { UsuariosTab } from './usuarios-tab'

interface CustomerProfileTabsProps {
  customer: Customer
  companyId: number
  daysSinceLastOrder?: string
  customerUsers?: CustomerUser[]
  customerUsersMetadata?: PaginatedResponseMetadata
  segments?: Segment[]
  paymentConditions?: PaymentCondition[]
  paymentMethods?: PaymentMethod[]
  /** Controlled mode. Omit both and the component keeps its own state. */
  value?: ProfileTab
  onValueChange?: (tab: ProfileTab) => void
  /** Seeds the uncontrolled state — the `tab` URL param on the full profile page. */
  initialTab?: string | string[] | null
  /** Only the full profile page writes `?tab=` back; the sheet must not touch the listing's URL. */
  syncUrl?: boolean
  /** Tabs to leave out entirely, e.g. Usuários inside the sheet, which has no user data to show. */
  hiddenTabs?: ProfileTab[]
}

export function CustomerProfileTabs({
  customer,
  companyId,
  daysSinceLastOrder,
  customerUsers = [],
  customerUsersMetadata,
  segments = [],
  paymentConditions = [],
  paymentMethods = [],
  value,
  onValueChange,
  initialTab,
  syncUrl = false,
  hiddenTabs = []
}: CustomerProfileTabsProps) {
  const [internalTab, setInternalTab] = useProfileTab(initialTab, syncUrl)

  const activeTab = value ?? internalTab
  const changeTab = onValueChange ?? setInternalTab

  const visibleTabs = PROFILE_TABS.filter(tab => !hiddenTabs.includes(tab.value))
  // A hidden tab must never stay selected — falling back to the first visible one keeps the panel
  // from rendering blank when `?tab=usuarios` is opened inside the sheet.
  const currentTab = visibleTabs.some(tab => tab.value === activeTab) ? activeTab : visibleTabs[0]?.value

  const renderTab = () => {
    switch (currentTab) {
      case 'dados':
        return (
          <DadosTab
            customer={customer}
            companyId={companyId}
            daysSinceLastOrder={daysSinceLastOrder}
            segments={segments}
            paymentConditions={paymentConditions}
            paymentMethods={paymentMethods}
          />
        )
      case 'contatos':
        return <ContatosTab customer={customer} companyId={companyId} />
      case 'atendimentos':
        return <AtendimentosTab companyId={companyId} customerId={customer.id} />
      case 'pedidos':
        return <PedidosTab companyId={companyId} customerId={customer.id} orders={customer.orders} />
      case 'usuarios':
        return (
          <UsuariosTab
            customer={customer}
            customerUsers={customerUsers}
            customerUsersMetadata={customerUsersMetadata!}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      <CustomerSegmentedTabs
        items={visibleTabs.map(tab => ({ value: tab.value, label: tab.label }))}
        value={currentTab}
        onChange={changeTab}
        ariaLabel='Seções do perfil do cliente'
      />

      {renderTab()}
    </div>
  )
}
