'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Crop, GripVertical, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ImageUploadPreview, imageUploadOpacityClass } from '@/components/shared/image-upload-preview'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import { PRODUCT_IMAGE_LIMITS } from '@/constants/image-limits.constant'
import { DEFAULT_FRAMING, type Framing } from '@/utils/image/crop-plan.util'

export interface SortableImageItem {
  file?: File
  preview: string
  isExisting: boolean
  photoId?: number
  description?: string
  /** Stable id for a freshly-picked file, assigned at selection time and kept for its whole
   * lifetime — including once processing swaps `file`/`preview` for the treated version.
   * Without it, `imageDragId` (below) would change identity mid-flight and `dnd-kit` would
   * lose track of the item being dragged. */
  clientKey?: string
  /** The raw picked file, kept for the whole item's lifetime even after `file` is replaced by
   * the treated result — "Ajustar" always re-crops from the untouched source, never from an
   * already-cropped file. Absent for existing (already-uploaded) photos, which have no local
   * bytes to re-crop — only a remote URL. */
  originalFile?: File
  /** The framing currently applied — `DEFAULT_FRAMING` until "Ajustar" changes it. */
  framing?: Framing
  /** Present while the image-processing engine (crop/resize/re-encode) is still working on a
   * freshly-picked file. Absent (or `'ready'`) for anything already settled. */
  status?: 'processing' | 'ready' | 'failed'
  /** "8 MB → 180 KB" — set once processing finishes with an actual gain to show. */
  savings?: string
  /** Why processing failed, shown on the card itself — `status === 'failed'` items are excluded
   * from upload; this is the person's cue to remove the card or pick a different photo. */
  failureMessage?: string
}

interface SortableProductImagesProps {
  images: SortableImageItem[]
  onReorder: (images: SortableImageItem[]) => void
  onRemove: (index: number) => void
  /** Reprocesses the item at `clientKey` with a new framing — absent items (existing photos)
   * simply don't get the "Ajustar" button. */
  onAdjust: (clientKey: string, framing: Framing) => void
}

/**
 * Stable drag id. Saved photos key off their database id — two of them can share
 * a url, and a bare url would make the pair collide and break dragging. Freshly
 * picked files use `clientKey`, stable across the preview swap that processing does;
 * falling back to `preview` only covers items created before that field existed.
 */
const imageDragId = (image: SortableImageItem) =>
  image.photoId ? `photo-${image.photoId}` : (image.clientKey ?? image.preview)

function SortableImage({
  item,
  index,
  onRemove,
  onAdjust
}: {
  item: SortableImageItem
  index: number
  onRemove: (index: number) => void
  onAdjust: (clientKey: string, framing: Framing) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: imageDragId(item)
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const isCover = index === 0
  const isProcessing = item.status === 'processing'
  const hasFailed = item.status === 'failed'
  const canAdjust = item.status === 'ready' && item.clientKey !== undefined && item.originalFile !== undefined

  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [cropDialogImageUrl, setCropDialogImageUrl] = useState<string | null>(null)

  // Blob URL local to the dialog's lifetime — created only while it's open, so re-adjusting
  // ten photos in a row doesn't leave nine unused blobs behind.
  useEffect(() => {
    if (!isCropDialogOpen || !item.originalFile) return
    const url = URL.createObjectURL(item.originalFile)
    setCropDialogImageUrl(url)
    return () => {
      URL.revokeObjectURL(url)
      setCropDialogImageUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCropDialogOpen])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-surface',
        isDragging ? 'z-10 border-[#35DD48] shadow-lg' : hasFailed ? 'border-danger-border' : 'border-border',
        isCover && !isDragging && !hasFailed && 'border-[#008440]'
      )}
    >
      <ImageUploadPreview status={item.status} failureMessage={item.failureMessage} className='aspect-square overflow-hidden bg-surface-muted'>
        <img
          src={item.preview || '/placeholder.svg'}
          alt={`Preview ${index + 1}`}
          className={cn('h-full w-full object-contain p-2 transition-opacity', imageUploadOpacityClass(item.status))}
        />
      </ImageUploadPreview>

      {isCover && (
        <span className='absolute left-2 top-2 rounded-full bg-[#008440] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm'>
          Capa
        </span>
      )}

      <button
        type='button'
        {...attributes}
        {...listeners}
        title='Arraste para reordenar'
        aria-label='Arraste para reordenar'
        className='absolute bottom-[42px] left-2 flex h-8 w-8 cursor-grab items-center justify-center rounded-xl bg-surface/90 text-text-muted shadow-sm backdrop-blur-sm active:cursor-grabbing'
      >
        <GripVertical className='h-3.5 w-3.5' />
      </button>

      <div className='border-t border-border px-2.5 py-2'>
        <p className={cn('truncate text-[11px]', hasFailed ? 'text-danger-foreground' : 'text-text-muted')}>
          {isProcessing
            ? 'Preparando...'
            : hasFailed
              ? (item.failureMessage ?? 'Falha ao preparar imagem')
              : item.savings || item.description || (item.file ? item.file.name : `Imagem ${index + 1}`)}
        </p>
      </div>

      <div className='absolute right-2 top-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'>
        {canAdjust && (
          <Button
            type='button'
            variant='secondary'
            size='icon'
            onClick={() => setIsCropDialogOpen(true)}
            className='h-8 w-8 rounded-xl shadow-md'
            title='Ajustar imagem'
            aria-label='Ajustar imagem'
          >
            <Crop className='h-3.5 w-3.5' />
          </Button>
        )}

        <Button
          type='button'
          variant='destructive'
          size='icon'
          onClick={() => onRemove(index)}
          className='h-8 w-8 rounded-xl shadow-md'
          title='Remover imagem'
          aria-label='Remover imagem'
        >
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </div>

      {canAdjust && item.clientKey && cropDialogImageUrl && (
        <ImageCropDialog
          open={isCropDialogOpen}
          fileName={item.description ?? item.file?.name ?? ''}
          imageUrl={cropDialogImageUrl}
          aspect={PRODUCT_IMAGE_LIMITS.aspect}
          mode={PRODUCT_IMAGE_LIMITS.mode}
          maxSideInPixels={PRODUCT_IMAGE_LIMITS.maxSideInPixels}
          initialFraming={item.framing ?? DEFAULT_FRAMING}
          onClose={() => setIsCropDialogOpen(false)}
          onConfirm={framing => {
            setIsCropDialogOpen(false)
            onAdjust(item.clientKey!, framing)
          }}
        />
      )}
    </div>
  )
}

export function SortableProductImages({ images, onReorder, onRemove, onAdjust }: SortableProductImagesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Let the remove button and other clicks through — only start dragging
      // after a deliberate movement.
      activationConstraint: { distance: 5 }
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex(image => imageDragId(image) === active.id)
    const newIndex = images.findIndex(image => imageDragId(image) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(images, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map(imageDragId)} strategy={rectSortingStrategy}>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {images.map((item, index) => (
            <SortableImage key={imageDragId(item)} item={item} index={index} onRemove={onRemove} onAdjust={onAdjust} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
