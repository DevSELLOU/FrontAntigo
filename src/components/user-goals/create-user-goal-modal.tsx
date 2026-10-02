'use client'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
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

interface CreateUserGoalModalProps {
  open: boolean
  onClose: () => void
  companyId: number
}

interface ProductGoal {
  productId: number
  totalToSell: number
}

function getNextMonthDateRange() {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12, 0, 0)
  const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0, 12, 0, 0)

  return {
    startDate: nextMonth,
    endDate: lastDayOfNextMonth
  }
}

const DEFAULT_DATE_RANGE = getNextMonthDateRange()

export function CreateUserGoalModal({ open, onClose, companyId }: CreateUserGoalModalProps) {
  const { toast } = useToast()
  const [sellers, setSellers] = useState<User[]>([])
  const [products, setProducts] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    userId: '',
    startDate: new Date(DEFAULT_DATE_RANGE.startDate),
    endDate: new Date(DEFAULT_DATE_RANGE.endDate),
    salesValue: '',
    activeClients: '',
    newClients: ''
  })

  const [productGoals, setProductGoals] = useState<ProductGoal[]>([])

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, companyId])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      const [sellersResponse, productsResponse] = await Promise.all([
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
      ])

      if (!isApiErrorResponse(sellersResponse)) {
        setSellers(sellersResponse.data)
      }
      if (!isApiErrorResponse(productsResponse)) {
        setProducts(productsResponse.data.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoadingData(false)
    }
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

      const goals: any[] = []

      if (formData.salesValue) {
        goals.push({
          type: 'sales_value',
          targetValue: parseFloat(formData.salesValue)
        })
      }

      if (formData.activeClients) {
        goals.push({
          type: 'active_clients',
          targetValue: parseInt(formData.activeClients)
        })
      }

      if (formData.newClients) {
        goals.push({
          type: 'new_clients',
          targetValue: parseInt(formData.newClients)
        })
      }

      if (productGoals.length > 0) {
        goals.push({
          type: 'product_sales',
          targetValue: productGoals.reduce((sum, p) => sum + p.totalToSell, 0),
          products: productGoals
        })
      }

      if (goals.length === 0) {
        toast({
          title: 'Preencha pelo menos um tipo de meta',
          status: 'error'
        })
        setIsLoading(false)
        return
      }

      for (const goal of goals) {
        const formatToDateString = (date: any) => {
          if (!(date instanceof Date) || isNaN(date.getTime())) {
            return ''
          }
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        const startDateStr = formatToDateString(formData.startDate)
        const endDateStr = formatToDateString(formData.endDate)

        if (!startDateStr || !endDateStr) {
          toast({
            title: 'Selecione as datas de início e fim',
            status: 'error'
          })
          setIsLoading(false)
          return
        }

        const userIdNum = parseInt(formData.userId)

        const payload: any = {
          userId: userIdNum,
          type: goal.type,
          targetValue: goal.targetValue,
          startDate: startDateStr,
          endDate: endDateStr
        }

        if (goal.products) {
          payload.products = goal.products
        }

        if (isNaN(payload.userId)) {
          toast({
            title: 'Selecione um vendedor válido',
            status: 'error'
          })
          setIsLoading(false)
          return
        }

        const response = await clientFetch<CommonResponse<UserGoal>>(
          `/company/${companyId}/user-goals`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
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
        title: 'Metas criadas com sucesso',
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

  const addProduct = () => {
    setProductGoals([...productGoals, { productId: 0, totalToSell: 0 }])
  }

  const removeProduct = (index: number) => {
    setProductGoals(productGoals.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: keyof ProductGoal, value: number) => {
    const updated = [...productGoals]
    updated[index] = { ...updated[index], [field]: value }
    setProductGoals(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Criar Meta</DialogTitle>
          <DialogDescription>Crie metas para um vendedor. Preencha os campos desejados.</DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='userId'>Vendedor</Label>
              <Select
                value={formData.userId}
                onValueChange={value => setFormData({ ...formData, userId: value })}
                required
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

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Data Início</Label>
                <DatePicker
                  value={formData.startDate}
                  onChange={date => date && setFormData({ ...formData, startDate: date })}
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <DatePicker
                  value={formData.endDate}
                  onChange={date => date && setFormData({ ...formData, endDate: date })}
                />
              </div>
            </div>

            <div className='border-t pt-4 space-y-4'>
              <Label className='text-base font-medium'>Metas</Label>

              <div>
                <Label htmlFor='salesValue' className='text-muted-foreground'>
                  Valor de Vendas (R$)
                </Label>
                <Input
                  id='salesValue'
                  type='number'
                  step='0.01'
                  min='0'
                  placeholder='Ex: 10000.00'
                  value={formData.salesValue}
                  onChange={e => setFormData({ ...formData, salesValue: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor='activeClients' className='text-muted-foreground'>
                  Clientes Ativos
                </Label>
                <Input
                  id='activeClients'
                  type='number'
                  min='0'
                  placeholder='Ex: 50'
                  value={formData.activeClients}
                  onChange={e => setFormData({ ...formData, activeClients: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor='newClients' className='text-muted-foreground'>
                  Novos Clientes
                </Label>
                <Input
                  id='newClients'
                  type='number'
                  min='0'
                  placeholder='Ex: 10'
                  value={formData.newClients}
                  onChange={e => setFormData({ ...formData, newClients: e.target.value })}
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='text-muted-foreground'>Vendas de Produtos</Label>
                  <Button type='button' variant='outline' size='sm' onClick={addProduct}>
                    <Plus className='h-4 w-4 mr-1' />
                    Adicionar
                  </Button>
                </div>
                {productGoals.map((product, index) => (
                  <div key={index} className='flex gap-2 items-start'>
                    <div className='flex-1'>
                      <Select
                        value={product.productId.toString()}
                        onValueChange={value => updateProduct(index, 'productId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione um produto' />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='w-24'>
                      <Input
                        type='number'
                        placeholder='Qtd'
                        value={product.totalToSell}
                        onChange={e => updateProduct(index, 'totalToSell', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button type='button' variant='ghost' size='icon' onClick={() => removeProduct(index)}>
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Metas'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
