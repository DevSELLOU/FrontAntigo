/**
 * Tabs of the company management hub (`/company/[companyId]/settings?tab=…`), which replaced six
 * separate routes (categories, segments, payment-conditions, payment-methods, users, orders-setup)
 * plus the pre-existing preferences screen. Single source of truth for ids, labels and visibility.
 */
export type ManagementTabId =
  | 'categorias'
  | 'segmentos'
  | 'condicoes-pagamento'
  | 'metodos-pagamento'
  | 'usuarios'
  | 'pedidos'
  | 'preferencias'

export interface ManagementTab {
  id: ManagementTabId
  label: string
  /**
   * Every tab of this hub is administrator-only. Preferências was the exception until the
   * change-password card moved out of it to `/profile`: what is left in it (company customisation
   * and storefront appearance) was already admin-only, so a sales rep landing here would have got
   * an empty screen.
   */
  adminOnly: boolean
}

export const MANAGEMENT_TABS: ManagementTab[] = [
  { id: 'categorias', label: 'Categorias', adminOnly: true },
  { id: 'segmentos', label: 'Segmentos', adminOnly: true },
  { id: 'condicoes-pagamento', label: 'Condições de pagamento', adminOnly: true },
  { id: 'metodos-pagamento', label: 'Métodos de pagamento', adminOnly: true },
  { id: 'usuarios', label: 'Usuários', adminOnly: true },
  // Labelled "Prazos de pedido", not "Pedidos": the sidebar item it replaces was one word away
  // from the Orders screen itself, which is a different feature entirely.
  { id: 'pedidos', label: 'Prazos de pedido', adminOnly: true },
  { id: 'preferencias', label: 'Preferências', adminOnly: true }
]

export const MANAGEMENT_TAB_LABELS: Record<ManagementTabId, string> = MANAGEMENT_TABS.reduce(
  (labels, tab) => ({ ...labels, [tab.id]: tab.label }),
  {} as Record<ManagementTabId, string>
)

export function getVisibleManagementTabs(isAdministrator: boolean): ManagementTab[] {
  return MANAGEMENT_TABS.filter(tab => isAdministrator || !tab.adminOnly)
}

/**
 * Normalises the `tab` query param into a tab the current role is actually allowed to open.
 * Called on the server *before* any data fetch, so a non-administrator hand-typing
 * `?tab=usuarios` never fires an admin-only request (which would bounce through `/forbidden`).
 *
 * The default is the first visible tab for that role — administrators start at Categorias.
 *
 * Returns `null` when the role has no tab at all here, which is now the case for everyone below
 * administrator: the hub is entirely company configuration. The caller is expected to send them
 * somewhere that is theirs (`/company/[companyId]/profile`) rather than render an empty hub.
 */
export function resolveManagementTab(
  requested: string | undefined,
  isAdministrator: boolean
): ManagementTabId | null {
  const visibleTabs = getVisibleManagementTabs(isAdministrator)

  if (visibleTabs.length === 0) return null

  const match = visibleTabs.find(tab => tab.id === requested)

  return match?.id ?? visibleTabs[0].id
}
