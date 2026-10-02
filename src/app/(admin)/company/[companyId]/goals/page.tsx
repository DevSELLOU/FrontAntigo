'use client'

import { useEffect, useState } from 'react'
import { ListingPageHeader } from '@/components/shared/listing-page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoalsDashboardSummary } from '@/interfaces/user-goal.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { RemoveUserGoalModal } from '@/components/user-goals/remove-user-goal-modal'
import { Check, Plus, Target, X } from 'lucide-react'
import type { User } from '@/interfaces/user.interface'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { useToast } from '@/hooks/use-toast'
import { signOut } from 'next-auth/react'

interface PageProps {
  params: {
    companyId: number
  }
}

const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export default function UserGoalsPage({ params }: PageProps) {
  const { companyId } = params
  const [currentView, setCurrentView] = useState<'dashboard' | 'goals' | 'monthly'>('dashboard')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined)
  const [selectedUserName, setSelectedUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<GoalsDashboardSummary | null>(null)
  const [sellers, setSellers] = useState<User[]>([])
  const [products, setProducts] = useState<{id: number; name: string}[]>([])
  const [removeGoal, setRemoveGoal] = useState<any>(null)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const { toast } = useToast()

  const [editingCell, setEditingCell] = useState<{sellerId: number; goalType: string; month: number} | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [pendingGoalTypes, setPendingGoalTypes] = useState<{sellerId: number; goalType: string}[]>([])
  const [pendingProductGoals, setPendingProductGoals] = useState<{sellerId: number; productId: number; productName: string}[]>([])
  const [selectedAddSeller, setSelectedAddSeller] = useState<number | null>(null)
  const [selectedGoalType, setSelectedGoalType] = useState<string>('')

  const fetchDashboardData = async (year: number, userId?: number) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('year', year.toString())
      if (userId) queryParams.set('userId', userId.toString())

      const response = (await clientFetch<{ data: GoalsDashboardSummary }>(
        `/company/${companyId}/user-goals/dashboard/summary?${queryParams.toString()}`,
        { method: 'GET' }
      )) as { data: GoalsDashboardSummary }
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData(selectedYear, selectedUserId)
  }, [companyId, selectedYear, selectedUserId])

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await clientFetch<{ data: User[] }>(
          `/company/${companyId}/users?limit=1000&filters=${encodeURIComponent(JSON.stringify({ role: { eq: 'SALES_REP' } }))}`,
          { method: 'GET' }
        )
        if (!isApiErrorResponse(response)) {
          setSellers(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch sellers:', error)
      }
    }
    fetchSellers()

    const fetchProducts = async () => {
      try {
        const response = await clientFetch<{ data: { id: number; name: string }[] }>(
          `/company/${companyId}/products?limit=1000`,
          { method: 'GET' }
        )
        if (!isApiErrorResponse(response)) {
          setProducts(response.data.map(p => ({ id: p.id, name: p.name })))
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
    fetchProducts()
  }, [companyId])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return `R$ ${value.toLocaleString('pt-BR')}`
  }



  const getMonthFromDateStr = (dateStr: string | null | undefined): number => {
    if (!dateStr) return -1
    const [, month] = dateStr.split('-')
    return parseInt(month) - 1
  }


  const handleCellClick = (sellerId: number, goalType: string, month: number, currentValue: number) => {
    setEditingCell({ sellerId, goalType, month })
    setEditValue(currentValue > 0 ? currentValue.toString() : '')
  }

  const handleSaveGoal = async () => {
    if (!editingCell) return
    
    setIsSaving(true)
    try {
      const { sellerId, goalType, month } = editingCell
      const value = parseFloat(editValue) || 0
      
      const startDate = new Date(selectedYear, month, 1)
      const endDate = new Date(selectedYear, month + 1, 0)
      const formatToDateString = (date: Date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }

      const isProductGoal = goalType.startsWith('product_')
      const productId = isProductGoal ? parseInt(goalType.replace('product_', '')) : null

      if (isProductGoal && productId) {
        const existingGoalWithProduct = data?.goals.find(g => 
          g.userId === sellerId && 
          g.type === 'product_sales' && 
          g.startDate && 
          getMonthFromDateStr(g.startDate) === month &&
          g.userGoalProducts?.some(p => p.productId === productId)
        )

        const existingGoalForMonth = data?.goals.find(g => 
          g.userId === sellerId && 
          g.type === 'product_sales' && 
          g.startDate && 
          getMonthFromDateStr(g.startDate) === month
        )

        if (value === 0 && existingGoalWithProduct) {
          const remainingProducts = existingGoalWithProduct.userGoalProducts?.filter(p => p.productId !== productId) || []
          if (remainingProducts.length === 0) {
            await clientFetch(
              `/company/${companyId}/user-goals/${existingGoalWithProduct.id}`,
              { method: 'DELETE' },
              { handleTokenExpired: signOut }
            )
          } else {
            const newTargetValue = remainingProducts.reduce((sum, p) => sum + (Number(p.totalToSell) || 0), 0)
            await clientFetch(
              `/company/${companyId}/user-goals/${existingGoalWithProduct.id}`,
              {
                method: 'PATCH',
                body: JSON.stringify({ 
                  targetValue: newTargetValue,
                  products: remainingProducts
                }),
                headers: { 'Content-Type': 'application/json' }
              },
              { handleTokenExpired: signOut }
            )
          }
        } else if (existingGoalWithProduct) {
          const updatedProducts = existingGoalWithProduct.userGoalProducts?.map(p => 
            p.productId === productId ? { productId: p.productId, totalToSell: value } : { productId: p.productId, totalToSell: Number(p.totalToSell) || 0 }
          ) || []
          const newTargetValue = updatedProducts.reduce((sum, p) => sum + p.totalToSell, 0)
          await clientFetch(
            `/company/${companyId}/user-goals/${existingGoalWithProduct.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ 
                targetValue: newTargetValue,
                products: updatedProducts
              }),
              headers: { 'Content-Type': 'application/json' }
            },
            { handleTokenExpired: signOut }
          )
        } else if (value > 0 && existingGoalForMonth) {
          const newProducts = [
            ...(existingGoalForMonth.userGoalProducts?.map(p => ({ productId: p.productId, totalToSell: Number(p.totalToSell) || 0 })) || []),
            { productId, totalToSell: value }
          ]
          const newTargetValue = newProducts.reduce((sum, p) => sum + p.totalToSell, 0)
          await clientFetch(
            `/company/${companyId}/user-goals/${existingGoalForMonth.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ 
                targetValue: newTargetValue,
                products: newProducts
              }),
              headers: { 'Content-Type': 'application/json' }
            },
            { handleTokenExpired: signOut }
          )
        } else if (value > 0) {
          await clientFetch(
            `/company/${companyId}/user-goals`,
            {
              method: 'POST',
              body: JSON.stringify({
                userId: sellerId,
                type: 'product_sales',
                targetValue: value,
                products: [{ productId, totalToSell: value }],
                startDate: formatToDateString(startDate),
                endDate: formatToDateString(endDate)
              }),
              headers: { 'Content-Type': 'application/json' }
            },
            { handleTokenExpired: signOut }
          )
        }
      } else {
        const existingGoal = data?.goals.find(g => 
          g.userId === sellerId && 
          g.type === goalType && 
          g.startDate && 
          getMonthFromDateStr(g.startDate) === month
        )

        if (existingGoal && value === 0) {
          await clientFetch(
            `/company/${companyId}/user-goals/${existingGoal.id}`,
            { method: 'DELETE' },
            { handleTokenExpired: signOut }
          )
        } else if (existingGoal) {
          await clientFetch(
            `/company/${companyId}/user-goals/${existingGoal.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ targetValue: value }),
              headers: { 'Content-Type': 'application/json' }
            },
            { handleTokenExpired: signOut }
          )
        } else if (value > 0) {
          await clientFetch(
            `/company/${companyId}/user-goals`,
            {
              method: 'POST',
              body: JSON.stringify({
                userId: sellerId,
                type: goalType,
                targetValue: value,
                startDate: formatToDateString(startDate),
                endDate: formatToDateString(endDate)
              }),
              headers: { 'Content-Type': 'application/json' }
            },
            { handleTokenExpired: signOut }
          )
        }
      }

      toast({ title: 'Meta salva com sucesso', status: 'success' })
      setEditingCell(null)
      setPendingGoalTypes([])
      setPendingProductGoals([])
      fetchDashboardData(selectedYear, selectedUserId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar meta'
      console.error('[handleSaveGoal] Error saving goal:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        editingCell,
        editValue
      })
      toast({ title: errorMessage, status: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
    setPendingGoalTypes([])
    setPendingProductGoals([])
  }

  const handleAddGoalType = (sellerId: number, goalType: string) => {
    setPendingGoalTypes([...pendingGoalTypes, { sellerId, goalType }])
    setEditingCell({ sellerId, goalType, month: 0 })
    setEditValue('')
  }

  if (isLoading) {
    return (
      <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
        <ListingPageHeader
          card
          icon={<Target className='h-5 w-5' />}
          eyebrow='Gerenciamento'
          title='Metas'
          description='Acompanhe o desempenho da equipe e edite as metas de cada vendedor.'
          showViewSelector={false}
        />
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </div>
    )
  }

  const valuePercentage = data?.metaValue ? Math.round((data.totalValue / data.metaValue) * 100) : 0
  const clientsPercentage = data?.metaClients ? Math.round((data.totalClients / data.metaClients) * 100) : 0
  const productMixPercentage = data?.metaProductMix ? Math.round((data.productMix / data.metaProductMix) * 100) : 0
  const lineItemsPercentage = data?.metaLineItems ? Math.round((data.lineItems / data.metaLineItems) * 100) : 0
  const clientsWithOrdersPercentage = data?.metaClientsWithOrders ? Math.round((data.clientsWithOrders / data.metaClientsWithOrders) * 100) : 0
  const activeClients = data?.activeClientsPercent || 0
  const currentMonth = new Date().getMonth() + 1

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <ListingPageHeader
        card
        icon={<Target className='h-5 w-5' />}
        eyebrow='Gerenciamento'
        title='Metas'
        description='Acompanhe o desempenho da equipe e edite as metas de cada vendedor.'
        showViewSelector={false}
        secondaryActions={
          <>
            <label className='sr-only' htmlFor='goals-seller'>
              Vendedor
            </label>
            <select
              id='goals-seller'
              className='h-11 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-body'
              value={selectedUserId || ''}
              onChange={(e) => {
                const userId = e.target.value ? Number(e.target.value) : undefined
                setSelectedUserId(userId)
                const selectedUser = data?.byUser.find(u => u.userId === userId)
                setSelectedUserName(selectedUser?.userName || '')
              }}
            >
              <option value=''>Todos os vendedores</option>
              {data?.byUser.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.userName}
                </option>
              ))}
            </select>

            <label className='sr-only' htmlFor='goals-year'>
              Ano
            </label>
            <select
              id='goals-year'
              className='h-11 rounded-md border border-border bg-surface px-3 text-sm text-text-body'
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              <option value={2027}>2027</option>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </>
        }
      />

      {/* Same capsule as the Dashboard tabs. Driven by local state rather than
          `shared/segmented-tab-nav.tsx` because this screen fetches on the client — an `<a href>`
          would hard-reload and refetch the whole year of goals on every switch. */}
      <nav aria-label='Visões de metas' className='flex min-h-[52px] gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1'>
        {([
          { id: 'dashboard', label: 'Geral' },
          { id: 'monthly', label: 'Metas mensais' }
        ] as const).map(view => (
          <button
            key={view.id}
            type='button'
            onClick={() => setCurrentView(view.id)}
            aria-current={currentView === view.id ? 'page' : undefined}
            className={`min-h-[44px] flex items-center rounded-xl px-4 py-2.5 text-label whitespace-nowrap transition-colors ${
              currentView === view.id
                ? 'bg-[var(--glass-icon-bg)] text-[#008440] font-semibold'
                : 'text-text-muted hover:bg-surface-muted hover:text-text-body'
            }`}
          >
            {view.label}
          </button>
        ))}
      </nav>

      {currentView === 'dashboard' && data && (
        <div className='space-y-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-bold text-text'>
                Performance {selectedUserName ? `de ${selectedUserName}` : `Anual de ${selectedYear}`}
              </h2>
              <p className='text-text-muted text-sm'>
                {selectedUserName 
                  ? `${selectedYear} - ${selectedUserName}`
                  : `Consolidado de todos os vendedores em ${selectedYear}`}
              </p>
            </div>
            <div className='text-right'>
              <span className='text-xs font-medium text-text-muted uppercase'>Atingimento Global</span>
              <div className='text-3xl font-bold text-[#008440]'>{data.globalAttainment.toFixed(1)}%</div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
            <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md'>
              <p className='text-xs font-medium text-text-muted uppercase mb-2'>Valor Total</p>
              <div className='text-2xl font-bold text-text'>{formatCurrency(data.totalValue)}</div>
              <p className='text-xs text-text-muted mt-1'>Meta: {formatCurrency(data.metaValue)}</p>
              <div className='w-full bg-surface-muted h-2 rounded-full mt-4'>
                <div
                  className='bg-primary h-2 rounded-full transition-all'
                  style={{ width: `${Math.min(valuePercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md'>
              <p className='text-xs font-medium text-text-muted uppercase mb-2'>Total Clientes</p>
              <div className='text-2xl font-bold text-text'>{data.totalClients}</div>
              <p className='text-xs text-text-muted mt-1'>Meta: {data.metaClients}</p>
              <div className='w-full bg-surface-muted h-2 rounded-full mt-4'>
                <div
                  className='bg-[#35DD48] h-2 rounded-full transition-all'
                  style={{ width: `${Math.min(clientsPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md'>
              <p className='text-xs font-medium text-text-muted uppercase mb-2'>Clientes Ativos</p>
              <div className='text-2xl font-bold text-text'>{activeClients}%</div>
              <p className='text-xs text-text-muted mt-1'>Média do Período</p>
              <div className='w-full bg-surface-muted h-2 rounded-full mt-4'>
                <div
                  className='bg-primary h-2 rounded-full transition-all'
                  style={{ width: `${activeClients}%` }}
                ></div>
              </div>
            </div>

            <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md'>
              <p className='text-xs font-medium text-text-muted uppercase mb-2'>Mix de Produtos</p>
              <div className='text-2xl font-bold text-text'>
                {data.productMix.toLocaleString('pt-BR')} <span className='text-sm font-normal text-text-muted'>un</span>
              </div>
              <p className='text-xs text-text-muted mt-1'>Meta: {data.metaProductMix.toLocaleString('pt-BR')}</p>
              <div className='w-full bg-surface-muted h-2 rounded-full mt-4'>
                <div
                  className='bg-orange-500 h-2 rounded-full transition-all'
                  style={{ width: `${Math.min(productMixPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md'>
              <p className='text-xs font-medium text-text-muted uppercase mb-2'>Itens por Pedido</p>
              <div className='text-2xl font-bold text-text'>
                {data.lineItems.toLocaleString('pt-BR')} <span className='text-sm font-normal text-text-muted'>un</span>
              </div>
              <p className='text-xs text-text-muted mt-1'>Meta: {data.metaLineItems.toLocaleString('pt-BR')}</p>
              <div className='w-full bg-surface-muted h-2 rounded-full mt-4'>
                <div
                  className='bg-purple-500 h-2 rounded-full transition-all'
                  style={{ width: `${Math.min(lineItemsPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md'>
              <p className='text-xs font-medium text-text-muted uppercase mb-2'>Positivação</p>
              <div className='text-2xl font-bold text-text'>
                {data.clientsWithOrders.toLocaleString('pt-BR')} <span className='text-sm font-normal text-text-muted'>positivados</span>
              </div>
              <p className='text-xs text-text-muted mt-1'>Meta: {data.metaClientsWithOrders.toLocaleString('pt-BR')}</p>
              <div className='w-full bg-surface-muted h-2 rounded-full mt-4'>
                <div
                  className='bg-amber-500 h-2 rounded-full transition-all'
                  style={{ width: `${Math.min(clientsWithOrdersPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm'>
            <h3 className='font-semibold mb-6 flex items-center gap-2'>
              <span className='w-1 h-5 bg-primary rounded-full'></span>
              Evolução por Mês (Jan - Dez)
            </h3>
            <div className='flex items-end justify-between h-64 gap-2 border-b pb-2'>
              {data.byMonth
                .map((month) => {
                  const percentage = month.goal > 0 ? (month.actual / month.goal) * 100 : 0
                  const isInProgress = month.month === currentMonth && selectedYear === new Date().getFullYear()
                  const isPast = month.month < currentMonth

                  return (
                    <div key={month.month} className='flex-1 flex flex-col items-center gap-2'>
                      <div
                        className={`w-full rounded-t-md relative group ${
                          isInProgress
                            ? 'border-2 border-dashed border-border h-[60%] flex items-center justify-center'
                            : 'bg-surface-muted h-[70%]'
                        }`}
                      >
                        {isInProgress ? (
                          <span className='text-[10px] text-gray-300 font-medium rotate-90'>EM CURSO</span>
                        ) : (
                          <div
                            className={`absolute inset-x-0 bottom-0 rounded-t-md group-hover:opacity-90 transition-all ${
                              percentage > 100 ? 'bg-[#35DD48]' : 'bg-primary'
                            }`}
                            style={{ height: isPast ? `${Math.min(percentage, 100)}%` : '0%' }}
                          ></div>
                        )}
                      </div>
                      <span className='text-xs font-medium text-text-muted'>{monthNames[month.month - 1]}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {currentView === 'monthly' && data && (
        <div className='overflow-hidden rounded-2xl border border-border bg-surface shadow-sm'>
          <div className='p-4 border-b'>
            <h3 className='font-semibold'>
              Metas Mensais - {selectedYear}
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-surface-muted text-text-muted font-medium'>
                <tr>
                  <th className='p-3 w-48 sticky left-0 bg-surface-muted'>Vendedor</th>
                  <th className='p-3 w-32'>Meta</th>
                  {monthNames.map((name, idx) => (
                    <th key={idx} className='p-3 text-center w-24'>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y'>
                {sellers.map((seller) => {
                  const sellerGoals = data.goals.filter(g => g.userId === seller.id && g.startDate?.startsWith(selectedYear.toString()))
                  
                  const goalTypes = ['sales_value', 'active_clients', 'new_clients', 'line_items', 'clients_with_orders']
                  const sellerPendingTypes = pendingGoalTypes.filter(p => p.sellerId === seller.id).map(p => p.goalType)
                  const existingGoalTypes = goalTypes.filter(type => 
                    sellerGoals.some(g => g.type === type) || sellerPendingTypes.includes(type)
                  )
                  const availableGoalTypes = goalTypes.filter(type => !existingGoalTypes.includes(type))

                  const sellerProductGoals = sellerGoals.filter(g => g.type === 'product_sales' && g.userGoalProducts)
                  const uniqueProductGoals = sellerProductGoals.filter((goal, index, self) => 
                    index === self.findIndex(g => 
                      g.userGoalProducts?.[0]?.productId === goal.userGoalProducts?.[0]?.productId
                    )
                  )
                  const existingProductIds = uniqueProductGoals.flatMap(g => g.userGoalProducts?.map(p => p.productId) || [])
                  const sellerPendingProducts = pendingProductGoals.filter(p => p.sellerId === seller.id)
                  const pendingProductIds = sellerPendingProducts.map(p => p.productId)
                  const allProductIds = [...existingProductIds, ...pendingProductIds]
                  const availableProducts = products.filter(p => !allProductIds.includes(p.id))

                  const goalTypeLabels: Record<string, string> = {
                    sales_value: 'Valor de Vendas',
                    active_clients: 'Clientes Ativos',
                    new_clients: 'Novos Clientes',
                    product_sales: 'Vendas de Produtos',
                    line_items: 'Itens por Pedido',
                    clients_with_orders: 'Positivação'
                  }

                  const isCurrency = (type: string) => type === 'sales_value'
                  const formatValue = (val: number, type: string) => {
                    if (val === 0) return '-'
                    if (isCurrency(type)) return formatCurrency(val)
                    return val.toLocaleString('pt-BR')
                  }

                  const hasAnyGoals = existingGoalTypes.length > 0 || sellerProductGoals.length > 0 || sellerPendingProducts.length > 0 || availableGoalTypes.length > 0 || availableProducts.length > 0

                  const rows: JSX.Element[] = []

                  if (!hasAnyGoals) return rows

                  existingGoalTypes.forEach((goalType) => {
                    const monthGoals = monthNames.map((_, monthIdx) => 
                      sellerGoals.find(g => g.type === goalType && g.startDate && getMonthFromDateStr(g.startDate) === monthIdx)
                    )

                    rows.push(
                      <tr key={`${seller.id}-${goalType}-meta`} className='hover:bg-surface-muted transition-colors bg-surface-muted/50'>
                        <td className='p-2 font-medium sticky left-0 bg-surface-muted' rowSpan={2}>{seller.name}</td>
                        <td className='p-2 text-text-body font-medium'>{goalTypeLabels[goalType]}</td>
                        {monthGoals.map((monthGoal, monthIdx) => {
                          const isEditing = editingCell?.sellerId === seller.id && editingCell?.goalType === goalType && editingCell?.month === monthIdx
                          
                          return (
                            <td key={monthIdx} className='p-1 text-center'>
                              {isEditing ? (
                                <div className='flex items-center gap-1 justify-center'>
                                  <Input
                                    type='number'
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className='h-8 w-20 text-center text-sm'
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveGoal()
                                      if (e.key === 'Escape') handleCancelEdit()
                                    }}
                                  />
                                  <Button size='icon' h-8 w-8 variant='ghost' onClick={handleSaveGoal} disabled={isSaving}>
                                    <Check className='h-4 w-4 text-[#008440]' />
                                  </Button>
                                  <Button size='icon' h-8 w-8 variant='ghost' onClick={handleCancelEdit}>
                                    <X className='h-4 w-4 text-danger-foreground' />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCellClick(seller.id, goalType, monthIdx, monthGoal?.targetValue || 0)}
                                  className='w-full h-8 flex items-center justify-center hover:bg-surface-muted rounded text-[#008440] font-medium'
                                  title='Clique para editar'
                                >
                                  {formatValue(monthGoal?.targetValue || 0, goalType)}
                                </button>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )

                    rows.push(
                      <tr key={`${seller.id}-${goalType}-atual`} className='hover:bg-surface-muted transition-colors'>
                        <td className='p-2 text-text-muted'>Atual: {goalTypeLabels[goalType]}</td>
                        {monthGoals.map((monthGoal, monthIdx) => {
                          const goalValue = monthGoal?.targetValue || 0
                          const currentValue = monthGoal?.currentValue || 0
                          return (
                            <td key={monthIdx} className='p-2 text-center border-l bg-gray-25'>
                              <span className={currentValue >= goalValue && goalValue > 0 ? 'text-[#008440] font-medium' : 'text-text-body'}>
                                {formatValue(currentValue, goalType)}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })

                  uniqueProductGoals.forEach((goal) => {
                    const productId = goal.userGoalProducts?.[0]?.productId
                    const product = products.find(p => p.id === productId)
                    if (!product) return

                    const monthGoals = monthNames.map((_, monthIdx) => 
                      sellerGoals.find(g => 
                        g.type === 'product_sales' && 
                        g.startDate && 
                        getMonthFromDateStr(g.startDate) === monthIdx &&
                        g.userGoalProducts?.some(p => p.productId === productId)
                      )
                    )

                    rows.push(
                      <tr key={`${seller.id}-product-${productId}-meta`} className='hover:bg-surface-muted transition-colors bg-surface-muted/50'>
                        <td className='p-2 font-medium sticky left-0 bg-surface-muted' rowSpan={2}>{seller.name}</td>
                        <td className='p-2 text-text-body font-medium'>{product.name}</td>
                        {monthGoals.map((monthGoal, monthIdx) => {
                          const productGoal = monthGoal?.userGoalProducts?.find(p => p.productId === productId)
                          const isEditing = editingCell?.sellerId === seller.id && editingCell?.goalType === `product_${productId}` && editingCell?.month === monthIdx

                          return (
                            <td key={monthIdx} className='p-1 text-center'>
                              {isEditing ? (
                                <div className='flex items-center gap-1 justify-center'>
                                  <Input
                                    type='number'
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className='h-8 w-20 text-center text-sm'
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveGoal()
                                      if (e.key === 'Escape') handleCancelEdit()
                                    }}
                                  />
                                  <Button size='icon' h-8 w-8 variant='ghost' onClick={handleSaveGoal} disabled={isSaving}>
                                    <Check className='h-4 w-4 text-[#008440]' />
                                  </Button>
                                  <Button size='icon' h-8 w-8 variant='ghost' onClick={handleCancelEdit}>
                                    <X className='h-4 w-4 text-danger-foreground' />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCellClick(seller.id, `product_${productId}`, monthIdx, productGoal?.totalToSell || 0)}
                                  className='w-full h-8 flex items-center justify-center hover:bg-surface-muted rounded text-[#008440] font-medium'
                                  title='Clique para editar'
                                >
                                  {productGoal?.totalToSell ? productGoal.totalToSell.toLocaleString('pt-BR') : '-'}
                                </button>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )

                    rows.push(
                      <tr key={`${seller.id}-product-${productId}-atual`} className='hover:bg-surface-muted transition-colors'>
                        <td className='p-2 text-text-muted'>Atual: {product.name}</td>
                        {monthGoals.map((monthGoal, monthIdx) => {
                          const productGoal = monthGoal?.userGoalProducts?.find(p => p.productId === productId)
                          const targetValue = productGoal?.totalToSell || 0
                          const currentValue = 0
                          return (
                            <td key={monthIdx} className='p-2 text-center border-l bg-gray-25'>
                              <span className={currentValue >= targetValue && targetValue > 0 ? 'text-[#008440] font-medium' : 'text-text-body'}>
                                -
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })

                  sellerPendingProducts.forEach((pendingProduct) => {
                    const productId = pendingProduct.productId
                    const product = products.find(p => p.id === productId)
                    if (!product) return

                    const monthGoals = monthNames.map(() => null)

                    rows.push(
                      <tr key={`${seller.id}-product-${productId}-meta`} className='hover:bg-surface-muted transition-colors bg-surface-muted/50'>
                        <td className='p-2 font-medium sticky left-0 bg-surface-muted' rowSpan={2}>{seller.name}</td>
                        <td className='p-2 text-text-body font-medium'>{product.name}</td>
                        {monthGoals.map((_, monthIdx) => {
                          const isEditing = editingCell?.sellerId === seller.id && editingCell?.goalType === `product_${productId}` && editingCell?.month === monthIdx

                          return (
                            <td key={monthIdx} className='p-1 text-center'>
                              {isEditing ? (
                                <div className='flex items-center gap-1 justify-center'>
                                  <Input
                                    type='number'
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className='h-8 w-20 text-center text-sm'
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveGoal()
                                      if (e.key === 'Escape') handleCancelEdit()
                                    }}
                                  />
                                  <Button size='icon' h-8 w-8 variant='ghost' onClick={handleSaveGoal} disabled={isSaving}>
                                    <Check className='h-4 w-4 text-[#008440]' />
                                  </Button>
                                  <Button size='icon' h-8 w-8 variant='ghost' onClick={handleCancelEdit}>
                                    <X className='h-4 w-4 text-danger-foreground' />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCellClick(seller.id, `product_${productId}`, monthIdx, 0)}
                                  className='w-full h-8 flex items-center justify-center hover:bg-surface-muted rounded text-[#008440] font-medium'
                                  title='Clique para editar'
                                >
                                  -
                                </button>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )

                    rows.push(
                      <tr key={`${seller.id}-product-${productId}-atual`} className='hover:bg-surface-muted transition-colors'>
                        <td className='p-2 text-text-muted'>Atual: {product.name}</td>
                        {monthGoals.map((_, monthIdx) => (
                          <td key={monthIdx} className='p-2 text-center border-l bg-gray-25'>
                            <span className='text-text-body'>-</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })

                  return rows
                })}
                <tr className='bg-yellow-50 hover:bg-yellow-100'>
                  <td className='p-2 sticky left-0 bg-yellow-50' colSpan={2}>
                    <div className='flex gap-2 items-center flex-wrap'>
                      <select
                        className='border rounded px-2 py-1 text-sm flex-1'
                        value={selectedAddSeller || ''}
                        onChange={(e) => { setSelectedAddSeller(e.target.value ? parseInt(e.target.value) : null); setSelectedGoalType('') }}
                      >
                        <option value=''>+ Adicionar meta para...</option>
                        {sellers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      {selectedAddSeller && (
                        <>
                          {(() => {
                            const sellerId = selectedAddSeller
                            const sellerGoals = data?.goals.filter(g => g.userId === sellerId && g.startDate?.startsWith(selectedYear.toString())) || []
                            const existingTypes = sellerGoals.map(g => g.type)
                            const pendingTypes = pendingGoalTypes.filter(p => p.sellerId === sellerId).map(p => p.goalType)
                            const existingProductIds = sellerGoals.filter(g => g.type === 'product_sales').flatMap(g => g.userGoalProducts?.map(p => p.productId) || [])
                            const pendingProductIds = pendingProductGoals.filter(p => p.sellerId === sellerId).map(p => p.productId)
                            const availableTypes = []
                            if (!existingTypes.includes('sales_value') && !pendingTypes.includes('sales_value')) availableTypes.push('sales_value')
                            if (!existingTypes.includes('active_clients') && !pendingTypes.includes('active_clients')) availableTypes.push('active_clients')
                            if (!existingTypes.includes('new_clients') && !pendingTypes.includes('new_clients')) availableTypes.push('new_clients')
                            if (!existingTypes.includes('line_items') && !pendingTypes.includes('line_items')) availableTypes.push('line_items')
                            if (!existingTypes.includes('clients_with_orders') && !pendingTypes.includes('clients_with_orders')) availableTypes.push('clients_with_orders')
                            const availableProductsList = products.filter(p => !existingProductIds.includes(p.id) && !pendingProductIds.includes(p.id))
                            
                            if (availableTypes.length === 0 && availableProductsList.length === 0) return <span className='text-sm text-text-muted'>Todas as metas já foram adicionadas</span>
                            
                            const isProductSelected = selectedGoalType === 'product'
                            
                            return (
                              <>
                                <select
                                  className='border rounded px-2 py-1 text-sm flex-1'
                                  value={selectedGoalType}
                                  onChange={(e) => {
                                    setSelectedGoalType(e.target.value)
                                    if (e.target.value === 'product') {
                                      
                                    }
                                  }}
                                >
                                  <option value=''>Selecione o tipo...</option>
                                  {availableTypes.includes('sales_value') && <option value='sales_value'>Valor de Vendas</option>}
                                  {availableTypes.includes('active_clients') && <option value='active_clients'>Clientes Ativos</option>}
                                  {availableTypes.includes('new_clients') && <option value='new_clients'>Novos Clientes</option>}
                                  {availableTypes.includes('line_items') && <option value='line_items'>Itens por Pedido</option>}
                                  {availableTypes.includes('clients_with_orders') && <option value='clients_with_orders'>Positivação</option>}
                                  {availableProductsList.length > 0 && <option value='product'>Produto</option>}
                                </select>
                                {isProductSelected && (
                                  <>
                                    <input
                                      id='product-search-input'
                                      list='product-search-list'
                                      className='border rounded px-2 py-1 text-sm flex-1'
                                      placeholder='Buscar produto...'
                                      autoFocus
                                    />
                                    <datalist id='product-search-list'>
                                      {products.map(p => (
                                        <option key={p.id} value={p.name} />
                                      ))}
                                    </datalist>
                                  </>
                                )}
                              </>
                            )
                          })()}
                          <Button
                            size='sm'
                            onClick={() => {
                              if (selectedGoalType === 'product') {
                                const productName = (document.getElementById('product-search-input') as HTMLInputElement)?.value
                                const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase())
                                if (product) {
                                  setPendingProductGoals([...pendingProductGoals, { sellerId: selectedAddSeller, productId: product.id, productName: product.name }])
                                  setEditingCell({ sellerId: selectedAddSeller, goalType: `product_${product.id}`, month: 0 })
                                  setEditValue('')
                                  setSelectedGoalType('')
                                }
                              } else if (selectedGoalType) {
                                handleAddGoalType(selectedAddSeller, selectedGoalType)
                                setSelectedGoalType('')
                              }
                            }}
                          >
                            <Plus size={14} />
                          </Button>
                          <button onClick={() => { setSelectedAddSeller(null); setSelectedGoalType('') }} className='text-text-muted hover:text-text-body'>
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>

                {sellers.length === 0 && (
                  <tr>
                    <td colSpan={15} className='p-8 text-center text-text-muted'>
                      Nenhum vendedor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {removeGoal && (
        <RemoveUserGoalModal
          goal={removeGoal}
          open={isRemoveModalOpen}
          onClose={() => {
            setIsRemoveModalOpen(false)
            setRemoveGoal(null)
          }}
          companyId={companyId}
        />
      )}
    </div>
  )
}
