'use client'

import { RowActionButton } from '@/components/shared/row-action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Segment } from '@/interfaces/segment.interface'
import { Edit, Layers, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RemoveSegmentModal } from './remove-segment-modal'
import { UpdateSegmentModal } from './update-segment-modal'

interface RowOptionsProps {
  segment: Segment
}

export function SegmentRowOptions({ segment }: RowOptionsProps) {
  const router = useRouter()
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <RowActionButton
          label={`Subsegmentos de ${segment.name}`}
          onClick={() => router.push(`/company/${segment.companyId}/sub-segments/${segment.id}`)}
        >
          <Layers className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label={`Editar segmento ${segment.name}`} onClick={() => setUpdateModalIsOpen(true)}>
          <Edit className='h-4 w-4' />
        </RowActionButton>

        <RowActionButton label={`Remover segmento ${segment.name}`} onClick={() => setRemoveModalIsOpen(true)}>
          <Trash2 className='h-4 w-4' />
        </RowActionButton>
      </div>

      {updateModalIsOpen && (
        <UpdateSegmentModal open={updateModalIsOpen} onClose={() => setUpdateModalIsOpen(false)} segment={segment} />
      )}
      {removeModalIsOpen && (
        <RemoveSegmentModal open={removeModalIsOpen} onClose={() => setRemoveModalIsOpen(false)} segment={segment} />
      )}
    </TooltipProvider>
  )
}
