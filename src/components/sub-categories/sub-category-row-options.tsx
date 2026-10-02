'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SubCategory } from '@/interfaces/sub-category-interface'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RemoveSubCategoryModal } from './remove-sub-category-modal'
import { UpdateSubCategoryModal } from './update-sub-category-modal'

interface RowOptionsProps {
  companyId: number
  subCategory: SubCategory
}

export function SubCategoryRowOptions({ companyId, subCategory }: RowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton label={`Editar subcategoria ${subCategory.name}`} onClick={() => setUpdateModalIsOpen(true)}>
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label={`Remover subcategoria ${subCategory.name}`} onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdateSubCategoryModal
          open={updateModalIsOpen}
          onClose={() => setUpdateModalIsOpen(false)}
          companyId={companyId}
          subCategory={subCategory}
        />
      )}
      {removeModalIsOpen && (
        <RemoveSubCategoryModal
          open={removeModalIsOpen}
          onClose={() => setRemoveModalIsOpen(false)}
          companyId={companyId}
          subCategory={subCategory}
        />
      )}
    </TooltipProvider>
  )
}
