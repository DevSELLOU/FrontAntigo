'use client'

import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { ImportCustomersModal } from '../import-customers-modal'

interface ImportCustomersButtonProps {
  companyId: number
}

/** Toolbar twin of `products/product-import-button.tsx` — same size, same hover treatment. */
export function ImportCustomersButton({ companyId }: ImportCustomersButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={() => setIsModalOpen(true)}
        title='Importar clientes'
        aria-label='Importar clientes'
        className='h-11 w-11 shrink-0 rounded-xl border-border bg-surface text-text-body shadow-sm transition-all hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)] hover:text-[#007538]'
      >
        <Upload className='h-4 w-4' />
      </Button>

      <ImportCustomersModal companyId={companyId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
