import type { DashboardTab, GestaoData, DinamicoData, FaturamentoData, PedidosData, CoberturaData, ClientesData, DashboardApiResponse } from '@/interfaces/dashboard/dashboard-v2.types'
import { GestaoPanel } from './panels/gestao-panel'
import { DinamicoPanel } from './panels/dinamico-panel'
import { FaturamentoPanel } from './panels/faturamento-panel'
import { PedidosPanel } from './panels/pedidos-panel'
import { CoberturaPanel } from './panels/cobertura-panel'
import { ClientesPanel } from './panels/clientes-panel'
import { fetchData } from '@/utils/fetch-data'

interface DashboardContentProps {
  companyId: number
  tab: DashboardTab
  filters: Record<string, string>
}

export async function DashboardContent({ companyId, tab, filters }: DashboardContentProps) {
  const params = new URLSearchParams(filters).toString()
  const basePath = `/companies/${companyId}/dashboard`
  const qs = params ? `?${params}` : ''

  async function fetchPanel<T>(endpoint: string): Promise<T | null> {
    try {
      const res = await fetchData<DashboardApiResponse<T>>(
        `${basePath}/${endpoint}${qs}`,
        `Falha ao buscar dados: ${endpoint}`,
      )
      return res?.data ?? null
    } catch {
      return null
    }
  }

  switch (tab) {
    case 'gestao': {
      const data = await fetchPanel<GestaoData>('gestao')
      if (!data) return <EmptyState />
      return <GestaoPanel data={data} />
    }
    case 'dinamico': {
      const data = await fetchPanel<DinamicoData>('dinamico')
      if (!data) return <EmptyState />
      return <DinamicoPanel data={data} />
    }
    case 'faturamento': {
      const data = await fetchPanel<FaturamentoData>('faturamento')
      if (!data) return <EmptyState />
      return <FaturamentoPanel data={data} />
    }
    case 'pedidos': {
      const data = await fetchPanel<PedidosData>('pedidos')
      if (!data) return <EmptyState />
      return <PedidosPanel data={data} />
    }
    case 'cobertura': {
      const data = await fetchPanel<CoberturaData>('cobertura')
      if (!data) return <EmptyState />
      return <CoberturaPanel data={data} />
    }
    case 'clientes': {
      const data = await fetchPanel<ClientesData>('clientes')
      if (!data) return <EmptyState />
      return <ClientesPanel data={data} />
    }
    default:
      return <EmptyState />
  }
}

function EmptyState() {
  return (
    <div className='flex items-center justify-center h-64 text-text-muted text-body'>
      Nenhum dado disponível para os filtros selecionados.
    </div>
  )
}
