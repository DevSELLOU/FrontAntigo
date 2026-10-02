'use client'

import { ProductStockType } from '@/enums/product-stock-type.enum'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Product, ProductStockMovement } from '@/interfaces/product.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { formatIntlDate } from '@/utils/format/format-intl-date.util'
import { getProductStockTypeText } from '@/utils/get-product-type-text.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { Loading } from '../../loading'
import { Badge } from '../../ui/badge'
import { DataTable } from '../../ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog'

interface ModalProps {
  open: boolean
  onClose: () => void
  product: Product
}

export function StockMovementsModal({ open, onClose, product }: ModalProps) {
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

  const columns = useMemo<ColumnDef<ProductStockMovement>[]>(
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='xl:max-h-[95%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Movimentações Estoque</DialogTitle>
          <DialogDescription>
            Produto: <Badge variant='outline'>{product.name}</Badge>
          </DialogDescription>
        </DialogHeader>

        {isFetchingMovements ? (
          <div className='flex items-center justify-center h-[200px]'>
            <Loading className='text-text' />
          </div>
        ) : (
          <DataTable columns={columns} data={movements} emptyMessage='Sem movimentações ainda' />
        )}
      </DialogContent>
    </Dialog>
  )
}
