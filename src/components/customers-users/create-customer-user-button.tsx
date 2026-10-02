'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateUserCompanyModal } from './create-customer-user-modal'

export function CreateCustomerUserButton({ companyId, customerId }: { companyId: number; customerId: number }) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpen}>Criar usuário</Button>
      {isOpen && (
        <CreateUserCompanyModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          companyId={companyId}
          customerId={customerId}
        />
      )}
    </>
  )
}
