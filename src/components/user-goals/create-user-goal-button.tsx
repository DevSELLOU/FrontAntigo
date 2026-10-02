'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateYearlyGoalsModal } from './create-yearly-goals-modal'

export function CreateUserGoalButton({ companyId }: { companyId: number }) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpen}>Criar metas anuais</Button>
      {isOpen && <CreateYearlyGoalsModal open={isOpen} onClose={() => setIsOpen(false)} companyId={companyId} />}
    </>
  )
}
