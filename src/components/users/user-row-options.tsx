'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { UserStatus } from '@/enums/user-status.enum'
import type { User } from '@/interfaces/user.interface'
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import { useState } from 'react'
import { ActiveUserModal } from './active-user-modal'
import { InactiveUserModal } from './inactive-user-modal'
import { RemoveUserModal } from './remove-user-modal'
import { UpdateUserModal } from './update-user-modal'

interface UserRowOptionsProps {
  user: User
}

export function UserRowOptions({ user }: UserRowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)
  const [activeModalIsOpen, setActiveModalIsOpen] = useState<boolean>(false)
  const [inactiveModalIsOpen, setInactiveModalIsOpen] = useState<boolean>(false)
  // const [passwordResendModalIsOpen, setPasswordResendModalIsOpen] = useState<boolean>(false)

  const isOnboarding = user.status === UserStatus.Onboarding

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton label='Editar usuário' onClick={() => setUpdateModalIsOpen(true)}>
          <Edit className='h-4 w-4' />
        </RowActionButton>

        {/* Always rendered in this position (Editar / status / Remover) so the icons don't shift
            column between rows depending on status. */}
        {user.status === UserStatus.Active && (
          <RowActionButton label='Inativar usuário' onClick={() => setInactiveModalIsOpen(true)}>
            <UserX className='h-4 w-4' />
          </RowActionButton>
        )}
        {user.status === UserStatus.Inactive && (
          <RowActionButton label='Ativar usuário' onClick={() => setActiveModalIsOpen(true)}>
            <UserCheck className='h-4 w-4' />
          </RowActionButton>
        )}
        {isOnboarding && (
          <RowActionButton label='Ativação pendente' onClick={() => {}} disabled>
            <UserCheck className='h-4 w-4' />
          </RowActionButton>
        )}

        <RowActionButton label='Remover usuário' onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdateUserModal open={updateModalIsOpen} onClose={() => setUpdateModalIsOpen(false)} user={user} />
      )}
      {activeModalIsOpen && (
        <ActiveUserModal open={activeModalIsOpen} onClose={() => setActiveModalIsOpen(false)} user={user} />
      )}
      {inactiveModalIsOpen && (
        <InactiveUserModal open={inactiveModalIsOpen} onClose={() => setInactiveModalIsOpen(false)} user={user} />
      )}
      {/* {passwordResendModalIsOpen && (
        <PasswordResendUserModal
          open={passwordResendModalIsOpen}
          onClose={() => setPasswordResendModalIsOpen(false)}
          user={user}
        />
      )} */}
      {removeModalIsOpen && (
        <RemoveUserModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} user={user} />
      )}
    </TooltipProvider>
  )
}
