'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Category } from '@/interfaces/category.interface'
import { Edit, Layers, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RemoveCategoryModal } from './remove-category-modal'
import { UpdateCategoryModal } from './update-category-modal'

interface RowOptionsProps {
  category: Category
}

export function CategoryRowOptions({ category }: RowOptionsProps) {
  const router = useRouter()
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        {/* Goes straight to the sub-categories screen. It used to open a dialog asking to confirm
            the navigation, which cost a click and told the user nothing they couldn't undo. */}
        <RowActionButton
          label={`Subcategorias de ${category.name}`}
          onClick={() => router.push(`/company/${category.companyId}/sub-categories/${category.id}`)}
        >
          <Layers className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label={`Editar categoria ${category.name}`} onClick={() => setUpdateModalIsOpen(true)}>
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label={`Remover categoria ${category.name}`} onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdateCategoryModal open={updateModalIsOpen} onClose={() => setUpdateModalIsOpen(false)} category={category} />
      )}
      {removeModalIsOpen && (
        <RemoveCategoryModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} category={category} />
      )}
    </TooltipProvider>
  )
}
