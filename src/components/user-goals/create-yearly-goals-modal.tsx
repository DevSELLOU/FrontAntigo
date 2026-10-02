'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { CommonResponse } from '@/interfaces/common-response.interface'
import type { UserGoal } from '@/interfaces/user-goal.interface'
import type { User } from '@/interfaces/user.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Plus, Trash2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface CreateYearlyGoalsModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  editUserId?: number
  editYear?: number
}

interface ProductGoal {
  productId: number
  totalToSell: number[]
}

interface YearlyGoalData {
  salesValue: number[]
  activeClients: number[]
  newClients: number[]
  productGoals: ProductGoal[]
}

const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' }
]

const getMonthFromDateStr = (dateStr: string | null | undefined): number => {
  if (!dateStr) return -1
  const [, month] = dateStr.split('-')
  return parseInt(month) - 1
}

const GOAL_TYPES = [
  { id: 'sales_value', label: 'Valor de Vendas (R$)', type: 'currency' },
  { id: 'active_clients', label: 'Clientes Ativos', type: 'number' },
  { id: 'new_clients', label: 'Novos Clientes', type: 'number' }
]

export function CreateYearlyGoalsModal({ open, onClose, companyId, editUserId, editYear }: CreateYearlyGoalsModalProps) {
  const { toast } = useToast()
  const [sellers, setSellers] = useState<User[]>([])
  const [products, setProducts] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const currentYear = new Date().getFullYear()

  const [formData, setFormData] = useState({
    userId: editUserId?.toString() || '',
    year: editYear?.toString() || currentYear.toString()
  })

  const isEditMode = !!editUserId

  const [goalData, setGoalData] = useState<YearlyGoalData>({
    salesValue: Array(12).fill(0),
    activeClients: Array(12).fill(0),
    newClients: Array(12).fill(0),
    productGoals: []
  })

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, companyId, editUserId, editYear])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      const promises: Promise<any>[] = [
        clientFetch<CommonResponse<User[]>>(
          `/company/${companyId}/users?limit=1000&filters=${encodeURIComponent(JSON.stringify({ role: { eq: 'SALES_REP' } }))}`,
          { method: 'GET' },
          { handleTokenExpired: signOut }
        ),
        clientFetch<CommonResponse<{ id: number; name: string }[]>>(
          `/company/${companyId}/products?limit=1000`,
          { method: 'GET' },
          { handleTokenExpired: signOut }
        )
      ]

      if (editUserId && editYear) {
        promises.push(
          clientFetch<CommonResponse<UserGoal[]>>(
            `/company/${companyId}/user-goals?filters=${encodeURIComponent(JSON.stringify({ 
              userId: { eq: editUserId },
              startDate: { gte: `${editYear}-01-01` },
              endDate: { lte: `${editYear}-12-31` }
            }))}`,
            { method: 'GET' },
            { handleTokenExpired: signOut }
          )
        )
      }

      const results = await Promise.all(promises)

      if (!isApiErrorResponse(results[0])) {
        setSellers(results[0].data)
      }
      if (!isApiErrorResponse(results[1])) {
        setProducts(results[1].data.map((p: any) => ({ id: p.id, name: p.name })))
      }

      if (editUserId && editYear && results[2] && !isApiErrorResponse(results[2])) {
        const existingGoals = results[2].data
        loadExistingGoals(existingGoals)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadExistingGoals = (goals: UserGoal[]) => {
    const salesValue = Array(12).fill(0)
    const activeClients = Array(12).fill(0)
    const newClients = Array(12).fill(0)
    const productGoalsMap: Record<number, number[]> = {}

    goals.forEach(goal => {
      const month = getMonthFromDateStr(goal.startDate)

      if (goal.type === 'sales_value') {
        salesValue[month] = goal.targetValue
      } else if (goal.type === 'active_clients') {
        activeClients[month] = goal.targetValue
      } else if (goal.type === 'new_clients') {
        newClients[month] = goal.targetValue
      } else if (goal.type === 'product_sales' && goal.userGoalProducts) {
        goal.userGoalProducts.forEach((productGoal) => {
          if (!productGoalsMap[productGoal.productId]) {
            productGoalsMap[productGoal.productId] = Array(12).fill(0)
          }
          productGoalsMap[productGoal.productId][month] = productGoal.totalToSell
        })
      }
    })

    const productGoals = Object.entries(productGoalsMap).map(([productId, totals]) => ({
      productId: parseInt(productId),
      totalToSell: totals
    }))

    setGoalData({
      salesValue,
      activeClients,
      newClients,
      productGoals
    })
  }

  const updateGoalValue = (goalType: string, monthIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    
    setGoalData(prev => {
      const newData = { ...prev }
      
      if (goalType === 'sales_value') {
        const newSalesValue = [...prev.salesValue]
        newSalesValue[monthIndex] = numValue
        newData.salesValue = newSalesValue
      } else if (goalType === 'active_clients') {
        const newActiveClients = [...prev.activeClients]
        newActiveClients[monthIndex] = numValue
        newData.activeClients = newActiveClients
      } else if (goalType === 'new_clients') {
        const newNewClients = [...prev.newClients]
        newNewClients[monthIndex] = numValue
        newData.newClients = newNewClients
      }
      
      return newData
    })
  }

  const addProductGoal = () => {
    setGoalData(prev => ({
      ...prev,
      productGoals: [...prev.productGoals, { productId: 0, totalToSell: Array(12).fill(0) }]
    }))
  }

  const removeProductGoal = (index: number) => {
    setGoalData(prev => ({
      ...prev,
      productGoals: prev.productGoals.filter((_, i) => i !== index)
    }))
  }

  const updateProductGoalField = (index: number, field: 'productId', value: number) => {
    setGoalData(prev => {
      const newProductGoals = [...prev.productGoals]
      newProductGoals[index] = { ...newProductGoals[index], [field]: value }
      return { ...prev, productGoals: newProductGoals }
    })
  }

  const updateProductGoalMonth = (productIndex: number, monthIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0
    
    setGoalData(prev => {
      const newProductGoals = [...prev.productGoals]
      const currentTotals = [...(newProductGoals[productIndex].totalToSell as number[])]
      currentTotals[monthIndex] = numValue
      newProductGoals[productIndex] = { 
        ...newProductGoals[productIndex], 
        totalToSell: currentTotals 
      }
      return { ...prev, productGoals: newProductGoals }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.userId) {
        toast({
          title: 'Selecione um vendedor',
          status: 'error'
        })
        setIsLoading(false)
        return
      }

      const year = parseInt(formData.year)
      const userIdNum = parseInt(formData.userId)
      const goals: any[] = []

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)
        
        const formatToDateString = (date: Date) => {
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          return `${y}-${m}-${d}`
        }

        if (goalData.salesValue[month] > 0) {
          goals.push({
            userId: userIdNum,
            type: 'sales_value',
            targetValue: goalData.salesValue[month],
            startDate: formatToDateString(startDate),
            endDate: formatToDateString(endDate)
          })
        }

        if (goalData.activeClients[month] > 0) {
          goals.push({
            userId: userIdNum,
            type: 'active_clients',
            targetValue: goalData.activeClients[month],
            startDate: formatToDateString(startDate),
            endDate: formatToDateString(endDate)
          })
        }

        if (goalData.newClients[month] > 0) {
          goals.push({
            userId: userIdNum,
            type: 'new_clients',
            targetValue: goalData.newClients[month],
            startDate: formatToDateString(startDate),
            endDate: formatToDateString(endDate)
          })
        }
      }

      if (goalData.productGoals.length > 0) {
        for (let month = 0; month < 12; month++) {
          const startDate = new Date(year, month, 1)
          const endDate = new Date(year, month + 1, 0)
          
          const formatToDateString = (date: Date) => {
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, '0')
            const d = String(date.getDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
          }

          const productGoalsForMonth = goalData.productGoals
            .filter(p => p.productId > 0 && (p.totalToSell as number[])[month] > 0)
            .map(p => ({
              productId: p.productId,
              totalToSell: (p.totalToSell as number[])[month]
            }))

          if (productGoalsForMonth.length > 0) {
            goals.push({
              userId: userIdNum,
              type: 'product_sales',
              targetValue: productGoalsForMonth.reduce((sum, p) => sum + p.totalToSell, 0),
              products: productGoalsForMonth,
              startDate: formatToDateString(startDate),
              endDate: formatToDateString(endDate)
            })
          }
        }
      }

      if (goals.length === 0) {
        toast({
          title: 'Preenha pelo menos uma meta para algum mês',
          status: 'error'
        })
        setIsLoading(false)
        return
      }

      if (isEditMode && editUserId && editYear) {
        const deleteResponse = await clientFetch<CommonResponse<void>>(
          `/company/${companyId}/user-goals?userId=${editUserId}&year=${editYear}`,
          { method: 'DELETE' },
          { handleTokenExpired: signOut }
        )
        
        if (isApiErrorResponse(deleteResponse)) {
          toast({
            title: 'Erro ao remover metas existentes',
            status: 'error'
          })
          setIsLoading(false)
          return
        }
      }

      for (const goal of goals) {
        const response = await clientFetch<CommonResponse<UserGoal>>(
          `/company/${companyId}/user-goals`,
          {
            method: 'POST',
            body: JSON.stringify(goal),
            headers: {
              'Content-Type': 'application/json'
            }
          },
          { handleTokenExpired: signOut }
        )

        if (isApiErrorResponse(response)) {
          toast({
            title: response.message || 'Erro ao criar meta',
            status: 'error'
          })
          setIsLoading(false)
          return
        }
      }

      toast({
        title: isEditMode ? 'Metas anuais atualizadas com sucesso' : 'Metas anuais criadas com sucesso',
        status: 'success'
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error creating goals:', error)
      toast({
        title: error instanceof Error ? error.message : 'Erro ao criar metas',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyValueToAllMonths = (goalType: string, value: number) => {
    if (goalType === 'sales_value') {
      setGoalData(prev => ({ ...prev, salesValue: Array(12).fill(value) }))
    } else if (goalType === 'active_clients') {
      setGoalData(prev => ({ ...prev, activeClients: Array(12).fill(value) }))
    } else if (goalType === 'new_clients') {
      setGoalData(prev => ({ ...prev, newClients: Array(12).fill(value) }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Metas Anuais' : 'Criar Metas Anuais'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? `Editando metas para ${sellers.find(s => s.id === editUserId)?.name || 'vendedor'} em ${editYear}`
              : 'Defina metas para cada mês do ano. Preencha os valores para cada tipo de meta.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex gap-4 items-end'>
              <div className='flex-1'>
                <Label htmlFor='userId'>Vendedor</Label>
                <Select
                  value={formData.userId}
                  onValueChange={value => setFormData({ ...formData, userId: value })}
                  required
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione um vendedor' />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map(seller => (
                      <SelectItem key={seller.id} value={seller.id.toString()}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-40'>
                <Label htmlFor='year'>Ano</Label>
                <Select
                  value={formData.year}
                  onValueChange={value => setFormData({ ...formData, year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                    <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50 border-b'>
                    <tr>
                      <th className='p-3 text-left font-medium text-gray-600 w-48 sticky left-0 bg-gray-50'>
                        Tipo de Meta
                      </th>
                      {MONTHS.map(month => (
                        <th key={month.value} className='p-3 text-center font-medium text-gray-600 w-24'>
                          {month.label}
                        </th>
                      ))}
                      <th className='p-3 text-center font-medium text-gray-600 w-20'>
                        Copiar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {GOAL_TYPES.map(goalType => (
                      <tr key={goalType.id} className='border-b'>
                        <td className='p-3 font-medium text-gray-700 sticky left-0 bg-white'>
                          {goalType.label}
                        </td>
                        {MONTHS.map((_, monthIndex) => (
                          <td key={monthIndex} className='p-2'>
                            <Input
                              type='number'
                              min='0'
                              step={goalType.type === 'currency' ? '0.01' : '1'}
                              className='h-9 text-center'
                              value={
                                goalType.id === 'sales_value'
                                  ? goalData.salesValue[monthIndex] || ''
                                  : goalType.id === 'active_clients'
                                  ? goalData.activeClients[monthIndex] || ''
                                  : goalData.newClients[monthIndex] || ''
                              }
                              onChange={e => updateGoalValue(goalType.id, monthIndex, e.target.value)}
                              placeholder='0'
                            />
                          </td>
                        ))}
                        <td className='p-2'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const firstValue = goalType.id === 'sales_value'
                                ? goalData.salesValue[0]
                                : goalType.id === 'active_clients'
                                ? goalData.activeClients[0]
                                : goalData.newClients[0]
                              copyValueToAllMonths(goalType.id, firstValue)
                            }}
                            title='Copiar primeiro valor para todos os meses'
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-medium'>Metas de Produtos</Label>
                <Button type='button' variant='outline' size='sm' onClick={addProductGoal}>
                  <Plus className='h-4 w-4 mr-1' />
                  Adicionar Produto
                </Button>
              </div>
              
              {goalData.productGoals.length > 0 && (
                <div className='border rounded-lg overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead className='bg-gray-50 border-b'>
                        <tr>
                          <th className='p-3 text-left font-medium text-gray-600 w-48 sticky left-0 bg-gray-50'>
                            Produto
                          </th>
                          {MONTHS.map(month => (
                            <th key={month.value} className='p-3 text-center font-medium text-gray-600 w-24'>
                              {month.label}
                            </th>
                          ))}
                          <th className='p-3 text-center font-medium text-gray-600 w-16'></th>
                        </tr>
                      </thead>
                      <tbody>
                        {goalData.productGoals.map((productGoal, productIndex) => (
                          <tr key={productIndex} className='border-b'>
                            <td className='p-2 sticky left-0 bg-white'>
                              <Select
                                value={productGoal.productId.toString()}
                                onValueChange={value => updateProductGoalField(productIndex, 'productId', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecione' />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            {MONTHS.map((_, monthIndex) => (
                              <td key={monthIndex} className='p-2'>
                                <Input
                                  type='number'
                                  min='0'
                                  className='h-9 text-center'
                                  value={(productGoal.totalToSell as number[])[monthIndex] || ''}
                                  onChange={e => updateProductGoalMonth(productIndex, monthIndex, e.target.value)}
                                  placeholder='0'
                                />
                              </td>
                            ))}
                            <td className='p-2'>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                onClick={() => removeProductGoal(productIndex)}
                              >
                                <Trash2 className='h-4 w-4 text-destructive' />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {goalData.productGoals.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  Nenhum produto adicionado. Clique em &quot;Adicionar Produto&quot; para definir metas de vendas por produto.
                </p>
              )}
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Criar Metas Anuais'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
