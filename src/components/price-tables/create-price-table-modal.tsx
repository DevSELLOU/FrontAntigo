'use client'

import { CustomError } from '@/errors/custom-error.error'
import { Customer } from '@/interfaces/customer.interface'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { createPriceTableAction } from '@/actions/price-table/create-price-table.action'
import { clientFetch } from '@/utils/client-fetch.util'
import { PriceTableSchema } from '@/schemas/price-table.schema'
import { PriceTableDto } from '@/types/dto/price-table-dto'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { PriceTableFormFields } from './price-table-form-fields'
import { PriceTableRulesEditor } from './price-table-rules-editor'
import { RuleFormData } from './price-table.types'
import { Form } from '../ui/form'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  onSuccess?: (priceTableId: number) => void
}

export function CreatePriceTableModal({ open, onClose, companyId, onSuccess }: ModalProps): JSX.Element {
  const { toast } = useToast()
  const [rules, setRules] = useState<RuleFormData[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [segments, setSegments] = useState<{ id: number; name: string }[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{ id: number; name: string }[]>([])
  const [paymentConditions, setPaymentConditions] = useState<{ id: number; name: string }[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (open && companyId) {
      setLoadingData(true)
      Promise.all([
        clientFetch<{ data: { id: number; name: string }[] }>(`/company/${companyId}/categories?limit=1000`, { method: 'GET' }),
        clientFetch<{ data: { id: number; name: string }[] }>(`/company/${companyId}/segments?limit=1000`, { method: 'GET' }),
        clientFetch<{ data: { id: number; name: string }[] }>(`/company/${companyId}/payment-method?limit=1000`, { method: 'GET' }),
        clientFetch<{ data: { id: number; name: string }[] }>(`/company/${companyId}/payment-condition?limit=1000`, { method: 'GET' }),
        clientFetch<{ data: Customer[] }>(`/company/${companyId}/customer?limit=1000`, { method: 'GET' })
      ])
        .then(([categoriesRes, segmentsRes, paymentMethodsRes, paymentConditionsRes, customersRes]) => {
          if (!isApiErrorResponse(categoriesRes) && categoriesRes.data) {
            setCategories(categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name)))
          }
          if (!isApiErrorResponse(segmentsRes) && segmentsRes.data) {
            setSegments(segmentsRes.data.sort((a, b) => a.name.localeCompare(b.name)))
          }
          if (!isApiErrorResponse(paymentMethodsRes) && paymentMethodsRes.data) {
            setPaymentMethods(paymentMethodsRes.data.sort((a, b) => a.name.localeCompare(b.name)))
          }
          if (!isApiErrorResponse(paymentConditionsRes) && paymentConditionsRes.data) {
            setPaymentConditions(paymentConditionsRes.data.sort((a, b) => a.name.localeCompare(b.name)))
          }
          if (!isApiErrorResponse(customersRes) && customersRes.data) {
            const sortedCustomers = customersRes.data
              .filter(c => c.corporateName)
              .sort((a, b) => a.corporateName.localeCompare(b.corporateName))
            setCustomers(sortedCustomers)
          }
        })
        .finally(() => setLoadingData(false))
    }
  }, [open, companyId])

  const form = useForm<PriceTableDto>({
    resolver: zodResolver(PriceTableSchema),
    defaultValues: {
      name: '',
      description: '',
      adjustmentType: undefined,
      adjustmentValue: '',
    }
  })

  const addRule = () => {
    setRules([...rules, {
      priority: rules.length + 1,
      field: 'segmentId',
      operator: 'EQUALS',
      value: '',
      values: [],
      minimumOrderValue: '',
    }])
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, field: keyof RuleFormData, value: string | string[] | number) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [field]: value }
    setRules(newRules)
  }

  const onSubmit = form.handleSubmit(async data => {
    try {
      const formattedRules = rules
        .map(r => {
          let conditions: { field: string; operator: 'IN' | 'EQUALS' | 'CONTAINS' | 'GREATER_THAN_OR_EQUALS'; value: string | string[] }[] = []

          if (r.field === 'state' && r.values && r.values.length > 0) {
            conditions = [{
              field: r.field,
              operator: 'IN',
              value: r.values
            }]
          } else if (r.field === 'segmentId' && r.values && r.values.length > 0) {
            conditions = [{
              field: r.field,
              operator: 'IN',
              value: r.values
            }]
          } else if (r.field === 'productCategoryId' && r.values && r.values.length > 0) {
            conditions = [{
              field: r.field,
              operator: 'IN',
              value: r.values
            }]
          } else if (r.field === 'paymentMethodId' && r.values && r.values.length > 0) {
            conditions = [{
              field: r.field,
              operator: 'IN',
              value: r.values
            }]
          } else if (r.field === 'paymentConditionId' && r.values && r.values.length > 0) {
            conditions = [{
              field: r.field,
              operator: 'IN',
              value: r.values
            }]
          } else if (r.field === 'customerId' && r.values && r.values.length > 0) {
            conditions = [{
              field: r.field,
              operator: 'IN',
              value: r.values
            }]
          } else if (r.field === 'minimumOrderValue' && r.minimumOrderValue) {
            conditions = [{
              field: r.field,
              operator: 'GREATER_THAN_OR_EQUALS',
              value: r.minimumOrderValue.replace(',', '.')
            }]
          } else if (r.value) {
            conditions = [{
              field: r.field,
              operator: r.operator as 'EQUALS' | 'CONTAINS' | 'IN',
              value: r.operator === 'IN' ? r.value.split(',').map(v => v.trim()) : r.value,
            }]
          }

          return {
            priority: r.priority,
            conditions
          }
        })

      const response = await createPriceTableAction(companyId, {
        ...data,
        rules: formattedRules,
        adjustmentValue: data.adjustmentValue 
          ? parseFloat(String(data.adjustmentValue).replace(',', '.')) 
          : undefined
      })

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Tabela criada com sucesso',
        status: 'success'
      })

      form.reset()
      setRules([])
      onClose()
      
      if (onSuccess && response.data?.id) {
        onSuccess(response.data.id)
      }
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido ao criar tabela'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  const handleClose = () => {
    form.reset()
    setRules([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='fixed inset-0 z-50 w-full h-full max-w-none xl:max-w-none rounded-none translate-x-0 translate-y-0 xl:h-full overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Criar tabela de preço</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar uma nova tabela de preço</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            <PriceTableFormFields form={form} />

            <PriceTableRulesEditor
              rules={rules}
              onAddRule={addRule}
              onRemoveRule={removeRule}
              onUpdateRule={updateRule}
              categories={loadingData ? [] : categories}
              segments={loadingData ? [] : segments}
              paymentMethods={loadingData ? [] : paymentMethods}
              paymentConditions={loadingData ? [] : paymentConditions}
              customers={loadingData ? [] : customers}
            />

            <div className='flex items-center justify-end gap-3'>
              <Button type='button' variant='secondary' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                Criar
                {form.formState.isSubmitting && <Loading />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}