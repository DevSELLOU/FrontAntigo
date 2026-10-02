'use client'

import { insertProductStockAction } from '@/actions/product/insert-product-stock.action'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ProductStockType } from '@/enums/product-stock-type.enum'
import { CustomError } from '@/errors/custom-error.error'
import { useToast } from '@/hooks/use-toast'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Product, ProductStockMovement } from '@/interfaces/product.interface'
import { ProductStockSchema } from '@/schemas/product-stock.schema'
import { ProductStockDto } from '@/types/dto/product-stock-dto'
import { clientFetch } from '@/utils/client-fetch.util'
import { formatIntlDate } from '@/utils/format/format-intl-date.util'
import { getProductStockTypeText } from '@/utils/get-product-type-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { removeNonNumericChars } from '@/utils/remove-non-numeric-chars.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loading } from '../../loading'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { DataTable } from '../../ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Separator } from '../../ui/separator'

interface ModalProps {
  open: boolean
  onClose: () => void
  product: Product
}

export function InsertProductStockModal({ open, onClose, product }: ModalProps) {
  const { toast } = useToast()
  const [movements, setMovements] = useState<ProductStockMovement[]>([])
  const [isFetchingMovements, setIsFetchingMovements] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `/company/${product.companyId}/products/${product.id}/stock-movement`
        const response = await clientFetch<CommonResponse<ProductStockMovement[]>>(
          url,
          { method: 'GET' },
          {
            handleTokenExpired: signOut
          }
        )

        if (isApiErrorResponse(response)) {
          throw new Error(response.message)
        }

        setMovements(response?.data)
      } catch (error) {
        console.error('Failed to fetch stock movements:', error)
      } finally {
        setIsFetchingMovements(false)
      }
    }

    fetchData()
  }, [product])

  const form = useForm<ProductStockDto>({
    resolver: zodResolver(ProductStockSchema),
    defaultValues: {
      quantity: '',
      productId: product.id,
      type: ProductStockType.INPUT
    }
  })

  const stockMovementsColumn = useMemo<ColumnDef<ProductStockMovement>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ row }) => getProductStockTypeText(row.original.type)
      },
      {
        accessorKey: 'quantity',
        header: 'Quantidade',
        cell: ({ row }) => {
          const type = row.original.type
          const quantity = row.original.quantity?.toString().padStart(2, '0')
          const isInput = type === ProductStockType.INPUT

          return (
            <div className='flex items-center space-x-2'>
              {isInput ? (
                <ChevronUp className='w-4 h-4 text-green-800' />
              ) : (
                <ChevronDown className='w-4 h-4 text-red-800' />
              )}
              <span>{quantity}</span>
            </div>
          )
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Data',
        cell: ({ row }) => formatIntlDate(row.getValue('createdAt'))
      }
    ],
    [product]
  )

  const onSubmit = form.handleSubmit(async data => {
    try {
      const productStockDto = {
        ...data,
        quantity: Number(data.quantity)
      }

      const response = await insertProductStockAction(product.companyId, productStockDto)

      if (isApiErrorResponse(response)) {
        throw new CustomError(response.message)
      }

      toast({
        title: 'Estoque do produto atualizado com sucesso',
        status: 'success'
      })

      form.reset()
      onClose()
    } catch (error: any) {
      const title = error?.message ?? 'Erro ao atualizar o estoque.'

      toast({
        title,
        status: 'error'
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='xl:max-h-[95%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Movimentar Estoque</DialogTitle>
          <DialogDescription>
            Produto: <Badge variant='outline'>{product.name}</Badge>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-4 w-full'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione um tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ProductStockType).map(type => (
                        <SelectItem key={type} value={type}>
                          {getProductStockTypeText(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Quantidade'
                      {...field}
                      onChange={e => field.onChange(removeNonNumericChars(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 mt-4'>
              <Button type='button' variant='secondary' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit'>Salvar</Button>
            </div>
          </form>
        </Form>

        <Separator />

        <div className='flex flex-col gap-5'>
          <DialogHeader>
            <DialogTitle>Resumo de movimentações</DialogTitle>
          </DialogHeader>

          {isFetchingMovements ? (
            <div className='flex items-center justify-center h-[100px]'>
              <Loading className='text-text' />
            </div>
          ) : (
            <DataTable columns={stockMovementsColumn} data={movements} emptyMessage='Sem movimentações ainda' />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
