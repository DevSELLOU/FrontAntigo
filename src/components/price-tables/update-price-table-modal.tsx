'use client'

import { CustomError } from '@/errors/custom-error.error'
import { Customer } from '@/interfaces/customer.interface'
import { useToast } from '@/hooks/use-toast'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

import { removePriceTableAction } from '@/actions/price-table/remove-price-table.action'
import { updatePriceTableStatusAction } from '@/actions/price-table/update-price-table-status.action'
import { updatePriceTableAction } from '@/actions/price-table/update-price-table.action'
import { GenericStatus } from '@/enums/generic-status.enum'
import { PriceTable } from '@/interfaces/price-table.interface'
import { PriceTableSchema } from '@/schemas/price-table.schema'
import { PriceTableDto } from '@/types/dto/price-table-dto'
import { clientFetch } from '@/utils/client-fetch.util'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loading } from '../loading'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { PriceTableFormFields } from './price-table-form-fields'
import { PriceTableRulesEditor } from './price-table-rules-editor'
import { RuleFormData } from './price-table.types'

interface ModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  priceTable: PriceTable
  companyColor?: string | null
  onSuccess?: () => void
}

export function UpdatePriceTableModal({ open, onClose, companyId, priceTable, onSuccess }: ModalProps): JSX.Element {
  const { toast } = useToast()
  const router = useRouter()
  const [currentPriceTable, setCurrentPriceTable] = useState<PriceTable>(priceTable)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [segments, setSegments] = useState<{ id: number; name: string }[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{ id: number; name: string }[]>([])
  const [paymentConditions, setPaymentConditions] = useState<{ id: number; name: string }[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!open) return

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

    clientFetch<{ data: PriceTable }>(`/company/${companyId}/price-tables/${priceTable.id}`, { method: 'GET' })
      .then(res => {
        if (!isApiErrorResponse(res)) {
          setCurrentPriceTable(res.data)
        }
      })
      .catch((err) => {
        console.error('Error fetching price table:', err)
      })
  }, [open, companyId, priceTable.id])

  const [rules, setRules] = useState<RuleFormData[]>([])

  useEffect(() => {
    const convertRulesToFormData = (): RuleFormData[] => {
      return (currentPriceTable.rules || []).map(rule => {
        const field = rule.conditions?.[0]?.field || 'segmentId'
        const operator = rule.conditions?.[0]?.operator || 'EQUALS'
        const rawValue = rule.conditions?.[0]?.value

        if (field === 'state' || field === 'productCategoryId' || field === 'segmentId' || field === 'paymentMethodId' || field === 'paymentConditionId' || field === 'customerId') {
          return {
            id: rule.id,
            priority: rule.priority || 1,
            field,
            operator,
            value: '',
            values: Array.isArray(rawValue) ? rawValue : [],
            minimumOrderValue: ''
          }
        }

        if (field === 'minimumOrderValue') {
          return {
            id: rule.id,
            priority: rule.priority || 1,
            field,
            operator,
            value: '',
            values: [],
            minimumOrderValue: String(rawValue || '').replace('.', ',')
          }
        }

        return {
          id: rule.id,
          priority: rule.priority || 1,
          field,
          operator,
          value: Array.isArray(rawValue) ? (rawValue as string[]).join(', ') : String(rawValue || ''),
          values: [],
          minimumOrderValue: ''
        }
      })
    }

    setRules(convertRulesToFormData())
  }, [currentPriceTable.rules])

  const form = useForm<PriceTableDto>({
    resolver: zodResolver(PriceTableSchema),
    defaultValues: {
      name: currentPriceTable.name,
      description: currentPriceTable.description || '',
      adjustmentType: currentPriceTable.adjustmentType,
      adjustmentValue: currentPriceTable.adjustmentValue 
        ? String(currentPriceTable.adjustmentValue).replace('.', ',')
        : '',
    }
  })

  const [currentStatus, setCurrentStatus] = useState(currentPriceTable.status || GenericStatus.Draft)
  const [importing, setImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta tabela de preço? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await removePriceTableAction(companyId, priceTable.id)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Tabela excluída com sucesso',
        status: 'success'
      })

      onClose()
      router.refresh()
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido ao excluir tabela'

      toast({
        title: message,
        status: 'error'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: GenericStatus) => {
    try {
      const response = await updatePriceTableStatusAction(companyId, priceTable.id, newStatus)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      setCurrentStatus(newStatus)
      toast({
        title: 'Status atualizado com sucesso',
        status: 'success'
      })

      router.refresh()
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido ao atualizar status'

      toast({
        title: message,
        status: 'error'
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'Selecione um arquivo CSV',
        status: 'error'
      })
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await clientFetch(`/company/${companyId}/price-tables/${priceTable.id}/items/import`, {
        method: 'POST',
        body: formData
      })

      if (isApiErrorResponse(response)) {
        throw new Error(response.message)
      }

      toast({
        title: 'Preços importados com sucesso',
        status: 'success'
      })

      router.refresh()
    } catch (error: any) {
      const message = error?.message || 'Erro ao importar preços'

      toast({
        title: message,
        status: 'error'
      })
    } finally {
      setImporting(false)
    }
  }

  const addRule = () => {
    setRules([
      ...rules,
      {
        priority: rules.length + 1,
        field: 'segmentId',
        operator: 'EQUALS',
        value: '',
        values: [],
        minimumOrderValue: ''
      }
    ])
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
            id: r.id,
            priority: r.priority,
            conditions
          }
        })

      const response = await updatePriceTableAction(companyId, priceTable.id, {
        ...data,
        rules: formattedRules,
        adjustmentValue: data.adjustmentValue 
          ? parseFloat(String(data.adjustmentValue).replace(',', '.')) 
          : undefined
      })

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      router.refresh()
      
      toast({
        title: 'Tabela atualizada com sucesso',
        status: 'success'
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
      router.refresh()
    } catch (error: any) {
      const message = error?.message || 'Erro desconhecido ao atualizar tabela'

      toast({
        title: message,
        status: 'error'
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='fixed inset-0 z-50 w-full h-full max-w-none xl:max-w-none rounded-none translate-x-0 translate-y-0 xl:h-full overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Atualizar tabela de preço</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para atualizar a tabela de preço</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            <div className='space-y-2'>
              <Label>Arquivo CSV com preços</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full mt-4'
                onClick={async () => {
                  try {
                    const [productsResponse, itemsResponse] = await Promise.all([
                      clientFetch<{ data: { id: number; name: string; brand: string | null }[] }>(
                        `/company/${companyId}/products?limit=1000`,
                        { method: 'GET' }
                      ),
                      clientFetch<{ data: { productId: number; manualPrice: number | null }[] }>(
                        `/company/${companyId}/price-tables/${priceTable.id}/items`,
                        { method: 'GET' }
                      )
                    ])

                    if (isApiErrorResponse(productsResponse) || isApiErrorResponse(itemsResponse)) {
                      throw new Error('Erro ao buscar dados')
                    }

                    const items = itemsResponse.data || []
                    const products = productsResponse.data || []
                    const productsMap = new Map(products.map(p => [p.id, p]))

                    const headers = ['productId', 'productName', 'price']
                    const rows = items.map(item => {
                      const product = productsMap.get(item.productId)
                      return [item.productId, product?.name || '', item.manualPrice ?? '']
                    })

                    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
                    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent)
                    const link = document.createElement('a')
                    link.setAttribute('href', encodedUri)
                    link.setAttribute('download', `precos_${priceTable.name.replace(/\s+/g, '_').toLowerCase()}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    toast({
                      title: 'Preços exportados com sucesso',
                      status: 'success'
                    })
                  } catch (error: any) {
                    console.error('Failed to export prices:', error)
                    toast({
                      title: 'Erro ao exportar preços',
                      status: 'error'
                    })
                  }
                }}
              >
                Exportar Preços
              </Button>
              <Label htmlFor='csv-prices-file' className='flex items-center gap-2 cursor-pointer'>
                <Input id='csv-prices-file' type='file' accept='.csv' onChange={handleFileChange} className='hidden' />
                <Button variant='outline' size='sm' type='button' asChild>
                  <span className='cursor-pointer'>Procurar</span>
                </Button>
                <span className='text-sm text-muted-foreground truncate max-w-[200px]'>
                  {selectedFile?.name || 'Nenhum arquivo selecionado'}
                </span>
              </Label>
              <Button
                type='button'
                size='sm'
                className='w-full'
                onClick={handleImport}
                disabled={importing || !selectedFile}
              >
                {importing ? 'Importando...' : 'Importar Preços'}
              </Button>
            </div>

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

            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Status:</span>
                <Select value={currentStatus} onValueChange={value => handleStatusChange(value as GenericStatus)}>
                  <SelectTrigger className='w-[120px] h-8'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GenericStatus.Active}>Ativo</SelectItem>
                    <SelectItem value={GenericStatus.Inactive}>Inativo</SelectItem>
                    <SelectItem value={GenericStatus.Draft}>Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-2'>
                <Button type='button' variant='destructive' size='sm' onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className='h-4 w-4 mr-1' />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
                <Button type='button' variant='secondary' size='sm' onClick={onClose}>
                  Cancelar
                </Button>
                <Button type='submit' size='sm' disabled={form.formState.isSubmitting}>
                  Atualizar
                  {form.formState.isSubmitting && <Loading className='h-3 w-3' />}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}