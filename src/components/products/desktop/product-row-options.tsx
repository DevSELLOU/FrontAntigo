'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Category } from '@/interfaces/category.interface'
import { Product } from '@/interfaces/product.interface'
import { Edit, Package, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { InsertProductStockModal } from '../common/insert-product-stock-modal'
import { RemoveProductModal } from '../common/remove-product-modal'

interface RowOptionsProps {
  product: Product
  categories: Category[]
}

export function ProductRowOptions({ product }: RowOptionsProps) {
  const router = useRouter()
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center gap-1'>
        <RowActionButton label='Estoque' onClick={() => setIsStockModalOpen(true)}>
          <Package className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton
          label='Editar'
          onClick={() => router.push(`/company/${product.companyId}/products/edit/${product.id}`)}
        >
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label='Remover' onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {isStockModalOpen ? (
        <InsertProductStockModal open={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} product={product} />
      ) : null}

      {removeModalIsOpen && (
        <RemoveProductModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} product={product} />
      )}
    </TooltipProvider>
  )
}
