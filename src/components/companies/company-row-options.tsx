'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Company } from '@/interfaces/company.interface'
import { Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RemoveCompanyModal } from './remove-company-modal'
import { UpdateCompanyModal } from './update-company-modal'

interface RowOptionsProps {
  company: Company
}

export function CompanyRowOptions({ company }: RowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState(false)
  const router = useRouter()

  function handleNavigateToCompany() {
    router.push(`/company/${company.id}/dashboard`)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        {/* "Acessar" keeps a text label: unlike Editar/Remover, it leaves the Admin domain
            entirely (navigates to the company's own dashboard), so it needs to stay legible on
            its own — DESIGN.md §4 (primary/unfamiliar actions need visible text). */}
        <Button variant='outline' size='sm' onClick={handleNavigateToCompany}>
          Acessar
        </Button>

        <RowActionButton label='Editar empresa' onClick={() => setUpdateModalIsOpen(true)}>
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label='Remover empresa' onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdateCompanyModal open={updateModalIsOpen} onClose={() => setUpdateModalIsOpen(false)} company={company} />
      )}
      {removeModalIsOpen && (
        <RemoveCompanyModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} company={company} />
      )}
    </TooltipProvider>
  )
}
