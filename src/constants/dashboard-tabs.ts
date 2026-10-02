import type { DashboardTab } from '@/interfaces/dashboard/dashboard-v2.types'

export const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: 'gestao', label: 'Gestão' },
  { id: 'dinamico', label: 'Painel Dinâmico' },
  { id: 'cobertura', label: 'Mapa de Cobertura' },
  { id: 'faturamento', label: 'Faturamento' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'clientes', label: 'Base de Clientes' }
]

export const DASHBOARD_TAB_LABELS: Record<DashboardTab, string> = DASHBOARD_TABS.reduce(
  (labels, tab) => ({ ...labels, [tab.id]: tab.label }),
  {} as Record<DashboardTab, string>
)
