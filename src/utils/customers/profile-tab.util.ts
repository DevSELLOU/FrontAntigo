export const PROFILE_TABS = [
  { value: 'dados', label: 'Dados' },
  { value: 'contatos', label: 'Contatos' },
  { value: 'atendimentos', label: 'Atendimentos' },
  { value: 'pedidos', label: 'Pedidos' },
  { value: 'usuarios', label: 'Usuários' }
] as const

export type ProfileTab = (typeof PROFILE_TABS)[number]['value']

export const DEFAULT_PROFILE_TAB: ProfileTab = 'dados'

/**
 * Normalizes the `tab` URL param into a known profile tab. Accepts the raw `searchParams` shape
 * (Next hands repeated params over as an array), and falls back to `dados` for anything unknown —
 * a hand-typed or stale URL must not render an empty profile.
 */
export function parseProfileTab(value: string | string[] | null | undefined): ProfileTab {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate) return DEFAULT_PROFILE_TAB

  const match = PROFILE_TABS.find(tab => tab.value === candidate)
  return match ? match.value : DEFAULT_PROFILE_TAB
}
