export type DashboardTab = 'gestao' | 'dinamico' | 'cobertura' | 'faturamento' | 'pedidos' | 'clientes'

export interface DashboardFilters {
  ano?: string[]
  mes?: string[]
  statusCobertura?: string[]
  regiao?: string[]
  estado?: string[]
  cidade?: string[]
  gerente?: string[]
  representante?: string[]
  cliente?: string[]
}

export interface GestaoData {
  kpis: {
    revenue: number
    orders: number
    returns: number
    averageTicket: number
    activeCustomers: number
    inactiveCustomers: number
    activeUsers: number
  }
  tables: {
    revenueByRegion: { region: string; revenue: number }[]
    topRepresentatives: { name: string; revenue: number }[]
    topCollaborators: { name: string; revenue: number }[]
  }
}

export interface DinamicoData {
  kpis: {
    revenue: number
    returns: number
    invoices: number
    averageTicket: number
    totalCustomers: number
    activeCustomers: number
    inactiveCustomers: number
    citiesAttended: number
    totalOrders: number
  }
  tables: {
    resultsByRepresentative: any[]
    resultsByCollaborator: any[]
  }
}

export interface FaturamentoData {
  kpis: {
    revenue: number
    returns: number
    averageTicket: number
    totalCustomers: number
    averageMixItems: number
  }
  tables: {
    revenueByRegion: { region: string; revenue: number }[]
    revenueByMonth: { month: string; revenue: number }[]
    revenueByState: { state: string; revenue: number }[]
    topProducts: { name: string; revenue: number }[]
    rankingClientes: { name: string; revenue: number; orders: number }[]
  }
}

export interface PedidosData {
  kpis: {
    invoices: number
    approvedOrders: number
    inApprovalOrders: number
    blockedOrders: number
    canceledOrders: number
    onBudgetOrders: number
  }
  tables: {
    pedidosByRegion: { region: string; revenue: number }[]
    topProducts: { name: string; revenue: number }[]
    rankingClientes: { name: string; revenue: number; orders: number }[]
  }
}

export interface CoberturaData {
  kpis: {
    citiesWithSales: number
    citiesWithoutSales: number
    revenue: number
    coveragePct: number
  }
  tables: {
    byRegion: { region: string; comVenda: number; receita: number }[]
    byState: { state: string; comVenda: number; semVenda: number; revenue: number }[]
    bySeller: { seller: string; cities: number; revenue: number }[]
    byCollaborator: { seller: string; cities: number; revenue: number }[]
    citiesWithSalesList: { city: string; state: string; region: string; revenue: number }[]
    citiesWithoutSalesList: { city: string; state: string; region: string; status: string }[]
  }
}

export interface ClientesData {
  kpis: {
    totalCustomers: number
    inactiveCustomers: number
    activeCustomers: number
    citiesWithoutFaturamento: number
    purchaseCycle: number
    newCustomerCount: number
    newCustomerRevenue: number
    conversionRate: number
    reactivatedCount: number
    reactivatedRevenue: number
    reactivationRate: number
  }
  tables: {
    customersByChannel: { channel: string; count: number }[]
    customersByCity: { city: string; state: string; clients: number; revenue: number }[]
    inactive90Days: { name: string; document: string; city: string; lastPurchase: string; lastPurchaseValue: number }[]
    inactive90DaysByRep: { representative: string; count: number; lastPurchaseValue: number }[]
    inactive90DaysByColab: { representative: string; count: number; lastPurchaseValue: number }[]
    divisionBreakdown: { collaborator: string; clients: number; inactive90Days: number; orders: number; revenue: number }[]
    customersByChannelDetails: { name: string; city: string; revenue: number; orders: number }[]
  }
}

export interface GeoDataItem {
  city: string
  state: string
  revenue: number
  hasSale: boolean
  latitude?: string
  longitude?: string
}

export interface DashboardApiResponse<T> {
  message: string
  data: T
}
