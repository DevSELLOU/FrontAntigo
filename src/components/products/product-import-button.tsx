'use client'

import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { ProductImportModal } from './product-import-modal'

export const ProductImportButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={() => setIsModalOpen(true)}
        title='Importar produtos'
        aria-label='Importar produtos'
        className='h-11 w-11 shrink-0 rounded-xl border-border bg-surface text-text-body shadow-sm transition-all hover:border-[var(--glass-hover-border)] hover:bg-[var(--glass-hover-bg)] hover:text-[#007538]'
      >
        <Upload className='h-4 w-4' />
      </Button>

      <ProductImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
