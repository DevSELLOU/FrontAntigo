'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { User } from '@/interfaces/user.interface'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RemoveUserCompanyModal } from './remove-user-company-modal'
import { UpdateUserCompanyModal } from './update-user-company-modal'

interface UserCompanyRowOptionsProps {
  companyId: number
  user: User
}

export function UserCompanyRowOptions({ companyId, user }: UserCompanyRowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  // TODO - activate/deactivate and password resend modals exist for platform users
  // (`components/users`), but the company-scoped equivalents were never implemented.

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton label={`Editar usuário ${user.name}`} onClick={() => setUpdateModalIsOpen(true)}>
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label={`Remover usuário ${user.name}`} onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdateUserCompanyModal
          open={updateModalIsOpen}
          onClose={() => setUpdateModalIsOpen(false)}
          companyId={companyId}
          user={user}
        />
      )}

      {removeModalIsOpen && (
        <RemoveUserCompanyModal
          open={removeModalIsOpen}
          onClose={() => setRemoveModalIsOpen(false)}
          companyId={companyId}
          user={user}
        />
      )}
    </TooltipProvider>
  )
}
