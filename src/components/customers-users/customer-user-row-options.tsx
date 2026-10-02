'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CustomerUser } from '@/interfaces/customer-user.interface'
import { Customer } from '@/interfaces/customer.interface'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { RemoveCustomerUserModal } from './remove-customer-user-modal'
import { UpdateCustomerUserModal } from './update-customer-user-modal'

interface CustomerUserRowOptionsProps {
  customer: Customer
  customerUser: CustomerUser
}

export function CustomerUserRowOptions({ customer, customerUser }: CustomerUserRowOptionsProps) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Abrir menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setUpdateModalIsOpen(true)}>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRemoveModalIsOpen(true)}>Remover</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {updateModalIsOpen && (
        <UpdateCustomerUserModal
          open={updateModalIsOpen}
          onClose={() => setUpdateModalIsOpen(false)}
          customer={customer}
          customerUser={customerUser}
        />
      )}

      {removeModalIsOpen && (
        <RemoveCustomerUserModal
          open={removeModalIsOpen}
          onClose={() => setRemoveModalIsOpen(false)}
          customer={customer}
          customerUser={customerUser}
        />
      )}
    </>
  )
}
