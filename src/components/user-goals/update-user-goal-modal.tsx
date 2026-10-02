'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientFetch } from '@/utils/client-fetch.util'
import { CommonResponse } from '@/interfaces/common-response.interface'
import type { UserGoal } from '@/interfaces/user-goal.interface'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

interface UpdateUserGoalModalProps {
  goal: UserGoal
  open: boolean
  onClose: () => void
  companyId: number
}

interface ProductGoal {
  productId: number
  totalToSell: number
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  sales_value: 'Valor de Vendas',
  active_clients: 'Clientes Ativos',
  new_clients: 'Novos Clientes',
  product_sales: 'Vendas de Produtos',
}

export function UpdateUserGoalModal({ goal, open, onClose, companyId }: UpdateUserGoalModalProps) {
  const [products, setProducts] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  const [formData, setFormData] = useState({
    targetValue: goal.targetValue.toString(),
  })

  const [productGoals, setProductGoals] = useState<ProductGoal[]>(
    goal.userGoalProducts?.map(p => ({ productId: p.productId, totalToSell: p.totalToSell })) || []
  )

  useEffect(() => {
    if (open && goal.type === 'product_sales') {
      fetchProducts()
    }
  }, [open, goal])

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await clientFetch<CommonResponse<{ id: number; name: string }[]>>(
        `/company/${companyId}/products?limit=1000`,
        { method: 'GET' },
        { handleTokenExpired: signOut }
      )
      if (!isApiErrorResponse(response)) {
        setProducts(response.data.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: any = {
        targetValue: parseFloat(formData.targetValue),
      }

      if (goal.type === 'product_sales') {
        payload.products = productGoals.filter(p => p.productId > 0 && p.totalToSell > 0)
      }

      const response = await clientFetch<CommonResponse<UserGoal>>(
        `/company/${companyId}/user-goals/${goal.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        },
        { handleTokenExpired: signOut }
      )

      if (isApiErrorResponse(response)) {
        alert(response.message || 'Erro ao atualizar meta')
        return
      }

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error updating goal:', error)
      alert('Erro ao atualizar meta')
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
          <DialogTitle>Editar Meta</DialogTitle>
          <DialogDescription>
            Editar {GOAL_TYPE_LABELS[goal.type] || 'meta'} de {goal.user?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='targetValue'>Meta ({goal.type === 'sales_value' ? 'R$' : 'Qtd'})</Label>
            <Input
              id='targetValue'
              type='number'
              step={goal.type === 'sales_value' ? '0.01' : '1'}
              min='0'
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              required
            />
          </div>

          <div className='bg-gray-100 p-3 rounded-md'>
            <Label className='text-muted-foreground'>Valor Atual (calculado automaticamente)</Label>
            <div className='text-lg font-medium'>
              {goal.type === 'sales_value' 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentValue || 0)
                : (goal.currentValue || 0).toString()
              }
            </div>
          </div>

          {goal.type === 'product_sales' && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label>Produtos</Label>
                <Button type='button' variant='outline' size='sm' onClick={addProduct}>
                  <Plus className='h-4 w-4 mr-1' />
                  Adicionar Produto
                </Button>
              </div>
              {isLoadingProducts ? (
                <div className='flex items-center justify-center py-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900'></div>
                </div>
              ) : (
                productGoals.map((product, index) => (
                  <div key={index} className='flex gap-2 items-start'>
                    <div className='flex-1'>
                      <Select
                        value={product.productId.toString()}
                        onValueChange={(value) => updateProduct(index, 'productId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione um produto' />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
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
                        onChange={(e) => updateProduct(index, 'totalToSell', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button type='button' variant='ghost' size='icon' onClick={() => removeProduct(index)}>
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}