export interface UserGoalProduct {
  id: number
  productId: number
  totalToSell: number
}

export interface UserGoal {
  id: number
  targetValue: number
  currentValue: number | null
  type: 'sales_value' | 'active_clients' | 'new_clients' | 'product_sales' | 'line_items' | 'clients_with_orders'
  startDate: string | null
  endDate: string | null
  userId: number
  companyId: number
  user?: {
    id: number
    name: string
    email: string
  }
  userGoalProducts?: UserGoalProduct[]
  createdAt: string
  updatedAt: string
}

export interface GoalsDashboardSummary {
  globalAttainment: number
  totalValue: number
  metaValue: number
  totalClients: number
  metaClients: number
  activeClientsPercent: number
  productMix: number
  metaProductMix: number
  lineItems: number
  metaLineItems: number
  clientsWithOrders: number
  metaClientsWithOrders: number
  byMonth: { month: number; actual: number; goal: number }[]
  byUser: {
    userId: number
    userName: string
    accumulated: number
    meta: number
    attainment: number
    status: string
  }[]
  goals: UserGoal[]
}