'use client'

import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'
import { DASHBOARD_TAB_LABELS } from '@/constants/dashboard-tabs'
import { buildCompanyDashboardFilterQuery } from '@/constants/company-dashboard-filter-params'
import type { DashboardTab } from '@/interfaces/dashboard/dashboard-v2.types'

const REPORTS = [
  { value: 'Gestao::resumo', label: 'Resumo de Gestão' },
  { value: 'Gestao::regiao', label: 'Faturamento por Região' },
  { value: 'Gestao::representantes', label: 'Top Representantes' },
  { value: 'Gestao::colaboradores', label: 'Top Colaboradores' },
]

const FIELD_LABELS: Record<string, string> = {
  revenue: 'Faturamento',
  orders: 'Pedidos',
  returns: 'Devoluções',
  averageTicket: 'Ticket Médio',
  activeCustomers: 'Clientes Ativos',
  inactiveCustomers: 'Clientes Inativos',
  activeUsers: 'Usuários Ativos',
  invoices: 'Faturamento',
  approvedOrders: 'Pedidos Aprovados',
  inApprovalOrders: 'Pedidos em Aprovação',
  blockedOrders: 'Pedidos Bloqueados',
  canceledOrders: 'Pedidos Cancelados',
  onBudgetOrders: 'Pedidos em Orçamento',
  totalCustomers: 'Total de Clientes',
  citiesAttended: 'Cidades Atendidas',
  totalOrders: 'Quantidade de Pedidos',
  averageMixItems: 'Mix Médio de Itens',
  citiesWithSales: 'Cidades com Venda',
  citiesWithoutSales: 'Cidades sem Venda',
  coveragePct: '% Cobertura',
  citiesWithoutFaturamento: 'Cidades sem Faturamento',
  purchaseCycle: 'Ciclo de Compras (dias)',
  newCustomerCount: 'Qtd Clientes Novos',
  newCustomerRevenue: 'Fat. Clientes Novos',
  conversionRate: 'Taxa de Conversão',
  reactivatedCount: 'Clientes Reativados',
  reactivatedRevenue: 'Fat. Clientes Reativados',
  reactivationRate: 'Taxa de Reativação',
  totalCustomersKpi: 'Clientes Cadastrados',
  inactiveCustomersKpi: 'Clientes Sem Compras +90d',
}

const TABLE_LABELS: Record<string, string> = {
  revenueByRegion: 'Faturamento por Região',
  topRepresentatives: 'Top Representantes',
  topCollaborators: 'Top Colaboradores',
  resultsByRepresentative: 'Resultado por Representante',
  resultsByCollaborator: 'Resultado por Colaborador',
  revenueByMonth: 'Faturamento por Mês',
  revenueByState: 'Faturamento por Estado',
  topProducts: 'Top Produtos',
  rankingClientes: 'Ranking de Clientes',
  pedidosByRegion: 'Pedidos por Região',
  byRegion: 'Cobertura por Região',
  byState: 'Cobertura por Estado',
  bySeller: 'Cobertura por Vendedor',
  byCollaborator: 'Cobertura por Colaborador',
  citiesWithSalesList: 'Cidades com Venda',
  citiesWithoutSalesList: 'Cidades sem Venda',
  customersByChannel: 'Clientes por Canal',
  customersByCity: 'Clientes por Cidade',
  inactive90Days: 'Clientes Inativos há +90 dias',
  inactive90DaysByRep: 'Inativos +90d por Representante',
  inactive90DaysByColab: 'Inativos +90d por Colaborador',
  divisionBreakdown: 'Detalhamento por Divisão',
  customersByChannelDetails: 'Clientes do Canal Selecionado',
}

const COLUMN_LABELS: Record<string, string> = {
  region: 'Região',
  revenue: 'Faturamento',
  name: 'Nome',
  month: 'Mês',
  state: 'UF',
  city: 'Cidade',
  orders: 'Pedidos',
  seller: 'Vendedor',
  cities: 'Cidades',
  comVenda: 'Cidades com Venda',
  receita: 'Receita',
  semVenda: 'Cidades sem Venda',
  status: 'Status',
  channel: 'Canal',
  count: 'Clientes',
  clients: 'Clientes',
  document: 'CNPJ / ID',
  lastPurchase: 'Última Compra',
  lastPurchaseValue: 'Valor Última Compra',
  representative: 'Representante',
  collaborator: 'Colaborador',
  inactive90Days: 'Clientes +90d',
  customerId: 'Cliente',
  totalValue: 'Valor Total',
  fat: 'Faturamento',
  dev: 'Devolução',
  pedidosR$: 'Pedidos R$',
  ticket: 'Ticket Médio',
  posit: 'Positivação',
  ativos: 'Ativos',
  inativos: 'Inativos',
  cidades: 'Cidades',
  qtdPed: 'Qtd Pedidos',
}

type ValueType = 'currency' | 'number' | 'percent' | 'date' | 'text'

const FIELD_TYPES: Record<string, ValueType> = {
  revenue: 'currency',
  returns: 'currency',
  averageTicket: 'currency',
  newCustomerRevenue: 'currency',
  reactivatedRevenue: 'currency',
  lastPurchaseValue: 'currency',
  fat: 'currency',
  dev: 'currency',
  pedidosR$: 'currency',
  receita: 'currency',
  totalValue: 'currency',
  conversionRate: 'percent',
  reactivationRate: 'percent',
  coveragePct: 'percent',
  purchaseCycle: 'number',
  orders: 'number',
  activeCustomers: 'number',
  inactiveCustomers: 'number',
  activeUsers: 'number',
  invoices: 'number',
  approvedOrders: 'number',
  inApprovalOrders: 'number',
  blockedOrders: 'number',
  canceledOrders: 'number',
  onBudgetOrders: 'number',
  totalCustomers: 'number',
  citiesAttended: 'number',
  totalOrders: 'number',
  averageMixItems: 'number',
  citiesWithSales: 'number',
  citiesWithoutSales: 'number',
  citiesWithoutFaturamento: 'number',
  newCustomerCount: 'number',
  reactivatedCount: 'number',
  count: 'number',
  clients: 'number',
  inactive90Days: 'number',
  cities: 'number',
  comVenda: 'number',
  semVenda: 'number',
  customers: 'number',
  ticket: 'currency',
  posit: 'number',
  ativos: 'number',
  inativos: 'number',
  cidades: 'number',
  qtdPed: 'number',
}

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function fmtNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function fmtPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(value) + '%'
}

function fmtDate(value: string): string {
  if (!value || value === 'Nunca') return value
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-BR')
}

function formatValue(value: unknown, type?: ValueType): string {
  if (value === null || value === undefined) return ''
  if (type === 'currency' && typeof value === 'number') return fmtCurrency(value)
  if (type === 'number' && typeof value === 'number') return fmtNumber(value)
  if (type === 'percent' && typeof value === 'number') return fmtPercent(value)
  if (type === 'date') return fmtDate(String(value))
  return String(value)
}

function columnType(key: string): ValueType {
  return FIELD_TYPES[key] || 'text'
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function writeRow(cells: string[]): string {
  return cells.map(escapeCsv).join(',')
}

function buildCsv(data: Record<string, unknown>): string {
  const lines: string[] = []
  const kpis = data.kpis as Record<string, unknown> | undefined
  const tables = data.tables as Record<string, unknown> | undefined
  const hasData = (arr: unknown): arr is unknown[] => Array.isArray(arr) && arr.length > 0

  if (kpis) {
    lines.push('INDICADORES')
    lines.push(writeRow(['Indicador', 'Valor']))
    for (const [key, value] of Object.entries(kpis)) {
      const label = FIELD_LABELS[key] || key
      const formatted = formatValue(value, FIELD_TYPES[key] || 'text')
      lines.push(writeRow([label, formatted]))
    }
    lines.push('')
  }

  if (tables) {
    for (const [tableKey, tableData] of Object.entries(tables)) {
      const tableLabel = TABLE_LABELS[tableKey] || tableKey
      if (!hasData(tableData)) continue

      const first = tableData[0] as Record<string, unknown>
      const rawHeaders = Object.keys(first)
      const headers = rawHeaders.map((h) => COLUMN_LABELS[h] || h)
      const types = rawHeaders.map(columnType)

      lines.push(tableLabel)
      lines.push(writeRow(headers))
      for (const row of tableData as Record<string, unknown>[]) {
        const cells = rawHeaders.map((h, i) => formatValue(row[h], types[i]))
        lines.push(writeRow(cells))
      }
      lines.push('')
    }
  }

  if (!kpis && !tables) {
    if (hasData(data as unknown as unknown[])) {
      const arr = data as unknown as Record<string, unknown>[]
      const first = arr[0]
      const rawHeaders = Object.keys(first)
      const headers = rawHeaders.map((h) => COLUMN_LABELS[h] || h)
      const types = rawHeaders.map(columnType)

      lines.push(writeRow(headers))
      for (const row of arr) {
        const cells = rawHeaders.map((h, i) => formatValue(row[h], types[i]))
        lines.push(writeRow(cells))
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        const label = FIELD_LABELS[key] || COLUMN_LABELS[key] || key
        const formatted = formatValue(value, FIELD_TYPES[key] || 'text')
        lines.push(writeRow([label, formatted]))
      }
    }
  }

  return lines.join('\n')
}

interface ExportDockProps {
  companyId: number
}

export function ExportDock({ companyId }: ExportDockProps) {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const tab = (searchParams.get('tab') as DashboardTab) || 'gestao'

  const handleExport = async (mode: 'full' | 'active' | 'report', report?: string) => {
    setLoading(true)
    try {
      // Mirrors whatever filter is currently applied to the visible data \u2014 before this, the
      // export always came back unfiltered, silently diverging from what the person was
      // looking at. The backend already accepts these same 8 params on every GET endpoint.
      const filterQuery = buildCompanyDashboardFilterQuery(searchParams)
      const url = filterQuery.toString() ? `/api/dashboard/export?${filterQuery}` : '/api/dashboard/export'

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode === 'active' ? tab : mode,
          report,
          tab,
          companyId
        })
      })
      if (!res.ok) {
        toast({ title: 'N\u00E3o foi poss\u00EDvel exportar os dados.', status: 'error' })
        return
      }
      const json = await res.json()
      const csvContent = buildCsv(json.data ?? json)
      const bom = '\uFEFF'
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `dashboard-${tab}-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast({ title: 'Não foi possível exportar os dados.', status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          disabled={loading}
          className='h-11 gap-2 rounded-xl border-border bg-surface shadow-sm transition-all hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)] hover:text-[#007538]'
        >
          {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
          {loading ? 'Exportando…' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => handleExport('full')}>Painel completo</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('active')}>
          Somente a aba {DASHBOARD_TAB_LABELS[tab]}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Relatórios de Gestão</DropdownMenuLabel>
        <DropdownMenuGroup>
          {REPORTS.map(r => (
            <DropdownMenuItem key={r.value} onClick={() => handleExport('report', r.value)}>
              {r.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
