'use client'

// "Adjust" — present on every uploaded image and NEVER required: the automatic crop already
// delivers the right result, and this panel exists for the few photos that need something
// else. Ported in spirit from `_Sellou/packages/ui/.../editor-de-enquadramento.tsx`.
//
// NO JARGON: there's no "aspect ratio", "resolution" or "quality" control anywhere. There's a
// window showing exactly what will stay, a drag, and a zoom slider.
//
// THE GEOMETRY IS NOT REDONE HERE. The preview uses the SAME `calculateCropPlan` that produces
// the final file, only converted from image pixels to screen percentages. Two different sums
// for the same thing is exactly how this kind of editor ends up lying about the result.
import { useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  calculateCropPlan,
  shiftFraming,
  type AspectRatio,
  type CropPlan,
  type Framing,
  type FramingMode
} from '@/utils/image/crop-plan.util'

const MAX_ZOOM = 4
const ARROW_STEP = 12

export interface ImageCropDialogProps {
  readonly open: boolean
  readonly fileName: string
  /** Local preview of the ORIGINAL, untreated file — re-framing always starts from the
   * source, never from an already-cropped result. */
  readonly imageUrl: string
  /** `null` preserves the source's own ratio (Company logo); a fixed ratio for Product photos. */
  readonly aspect: AspectRatio | null
  readonly mode: FramingMode
  readonly maxSideInPixels: number
  readonly initialFraming: Framing
  readonly onConfirm: (framing: Framing) => void
  readonly onClose: () => void
}

export function ImageCropDialog({
  open,
  fileName,
  imageUrl,
  aspect,
  mode,
  maxSideInPixels,
  initialFraming,
  onConfirm,
  onClose
}: ImageCropDialogProps) {
  const [framing, setFraming] = useState(initialFraming)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const draggingPointerId = useRef<number | null>(null)

  const plan: CropPlan | null =
    naturalSize === null
      ? null
      : calculateCropPlan({
          sourceWidth: naturalSize.width,
          sourceHeight: naturalSize.height,
          aspect,
          mode,
          maxSideInPixels,
          framing
        })

  function move(deltaX: number, deltaY: number) {
    const windowWidth = windowRef.current?.clientWidth
    if (plan === null || naturalSize === null || windowWidth === undefined || windowWidth === 0) return
    setFraming(current =>
      shiftFraming(current, {
        deltaXOnCanvas: deltaX,
        deltaYOnCanvas: deltaY,
        canvasWidth: windowWidth,
        currentPlan: plan,
        sourceWidth: naturalSize.width,
        sourceHeight: naturalSize.height
      })
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-ARROW_STEP, 0],
      ArrowRight: [ARROW_STEP, 0],
      ArrowUp: [0, -ARROW_STEP],
      ArrowDown: [0, ARROW_STEP]
    }
    const step = steps[event.key]
    if (step === undefined) return
    event.preventDefault()
    move(step[0], step[1])
  }

  // From the output canvas (image pixels) to the on-screen window (CSS percentages). Same
  // conversion on both axes, so the width ratio alone is enough.
  const position = calculateWindowPosition(plan, naturalSize)

  // Dragging only moves something when the image spills outside the window. On a square photo
  // in a square target, or a logo in `contain` with no zoom, nothing spills: a "grab" cursor
  // would promise a gesture that doesn't happen, and the editor's first impression would be a
  // control that lies.
  const canDrag =
    plan !== null &&
    naturalSize !== null &&
    (plan.source.width < naturalSize.width || plan.source.height < naturalSize.height)

  const hasChanged =
    framing.zoom !== initialFraming.zoom ||
    framing.centerX !== initialFraming.centerX ||
    framing.centerY !== initialFraming.centerY

  const windowAspectRatio = aspect
    ? `${aspect.width} / ${aspect.height}`
    : naturalSize
      ? `${naturalSize.width} / ${naturalSize.height}`
      : '1 / 1'

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className='sm:max-w-lg'
        // Escape/click-outside only close when nothing has changed yet — once the person has
        // touched the framing, closing without warning would throw the adjustment away.
        onEscapeKeyDown={event => {
          if (hasChanged) event.preventDefault()
        }}
        onInteractOutside={event => {
          if (hasChanged) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Ajustar a imagem</DialogTitle>
          <DialogDescription>Aproxime e arraste para escolher a parte que fica. {fileName}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div
            ref={windowRef}
            role='group'
            tabIndex={0}
            aria-label={
              canDrag
                ? 'Área da imagem. Arraste, ou use as setas do teclado, para escolher a parte que fica.'
                : 'Área da imagem. A imagem inteira já cabe aqui; aproxime para poder escolher outra parte.'
            }
            onKeyDown={handleKeyDown}
            onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
              draggingPointerId.current = event.pointerId
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
              if (draggingPointerId.current === event.pointerId) {
                move(event.movementX, event.movementY)
              }
            }}
            onPointerUp={() => {
              draggingPointerId.current = null
            }}
            onPointerCancel={() => {
              draggingPointerId.current = null
            }}
            // `touch-none` is what stops the browser from scrolling the page instead of
            // dragging the image on mobile — without it, the editor simply doesn't work on touch.
            className={`relative w-full touch-none select-none overflow-hidden rounded-md border border-border bg-surface-muted ${
              canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            style={{ aspectRatio: windowAspectRatio }}
          >
            <img
              src={imageUrl}
              alt=''
              draggable={false}
              onLoad={event => {
                setNaturalSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight
                })
              }}
              className='absolute max-w-none'
              style={
                position === null
                  ? { visibility: 'hidden' }
                  : { left: `${position.left}%`, top: `${position.top}%`, width: `${position.width}%` }
              }
            />
          </div>

          <label className='flex items-center gap-3 text-sm font-semibold text-text'>
            Aproximar
            <input
              type='range'
              min={1}
              max={MAX_ZOOM}
              step={0.05}
              value={framing.zoom}
              // Without `aria-valuetext`, a screen reader announces "1.35 of 4" — a number with
              // no referent. "Not zoomed" / "2.4x closer" says what actually changed.
              aria-valuetext={framing.zoom <= 1 ? 'Sem aproximar' : `${framing.zoom.toFixed(1).replace('.', ',')} vezes mais perto`}
              onChange={event => {
                setFraming(current => ({ ...current, zoom: Number(event.target.value) }))
              }}
              className='h-11 flex-1 accent-primary'
            />
          </label>
        </div>

        <DialogFooter>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancelar
          </Button>
          <Button type='button' onClick={() => onConfirm(framing)}>
            Usar assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface WindowPosition {
  readonly left: number
  readonly top: number
  readonly width: number
}

/** Everything in PERCENTAGE of the window, so the drawing tracks any screen width without
 * measuring anything — which also eliminates the layout jump between first render and measuring. */
function calculateWindowPosition(
  plan: CropPlan | null,
  naturalSize: { width: number; height: number } | null
): WindowPosition | null {
  if (plan === null || naturalSize === null) return null
  const screenScale = plan.destination.width / plan.source.width
  const drawnWidth = naturalSize.width * screenScale
  // Only the width is set on the `<img>`; the height follows the file's own natural ratio on
  // its own, which avoids a second sum that could drift from the first.
  return {
    left: ((plan.destination.x - plan.source.x * screenScale) / plan.canvas.width) * 100,
    top: ((plan.destination.y - plan.source.y * screenScale) / plan.canvas.height) * 100,
    width: (drawnWidth / plan.canvas.width) * 100
  }
}
