// Client-side image treatment — crop, resize, re-encode, all BEFORE any byte leaves the
// browser. Ported from `_Sellou/packages/ui/src/components/envio-de-imagem/tratamento-no-
// navegador.ts` (see that file's header for the fuller rationale of each decision below).
//
// WHY OFF THE MAIN THREAD: drawing and re-encoding a 12-megapixel photo takes hundreds of
// milliseconds of CPU. Done on the main thread, that's the whole page frozen — and with ten
// photos, ten frozen stretches in a row. So:
//   1. `createImageBitmap` decodes (the spec is async and browsers decode off-thread already);
//   2. the bitmap is TRANSFERRED to the worker (a transferable — zero copy cost);
//   3. the worker draws on `OffscreenCanvas` and encodes — the heavy work, off-screen.
// The crop plan itself is computed here, on the main thread, because it's instant arithmetic
// and it's the part covered by tests (`crop-plan.util.ts`). The worker never decides anything.
import { calculateCropPlan, DEFAULT_FRAMING, type CropPlan, type Framing } from './crop-plan.util'
import type { ImageProcessingLimits } from '@/constants/image-limits.constant'
import type { ProcessImageMessage, ProcessImageResponse } from './image-processing.worker'

export type ProcessingFailureReason = 'NOT_AN_IMAGE' | 'TOO_SMALL' | 'COULD_NOT_PROCESS' | 'UNSUPPORTED_FORMAT'

export class ImageProcessingError extends Error {
  constructor(readonly reason: ProcessingFailureReason) {
    super(reason)
    this.name = 'ImageProcessingError'
  }
}

export interface ProcessedImage {
  readonly file: File
  readonly originalBytes: number
  readonly width: number
  readonly height: number
}

// HEIC/HEIF is the DEFAULT photo format of the iPhone camera ("High Efficiency" mode), and a
// real thing to hit — someone who takes the photo and sends it straight over hasn't done
// anything wrong. The problem is only that Chrome and Firefox have no built-in HEIC decoder:
// `createImageBitmap` rejects the file the same way it would reject a `.txt` renamed to
// `.jpg`. Re-encoding isn't an option here (that would need a JS HEIC decoder, adding real
// weight for a format most visitors will never send). Safari decodes HEIC natively — for it,
// `createImageBitmap` doesn't even fail, and this whole path is skipped.
//
// The "is this an image?" guard needs to know about HEIC too, not just `decode`: in several
// Chrome builds a `.heic` file arrives with an EMPTY `File.type` (the OS has no registered
// content type for the extension), so a guard that only checked `type.startsWith('image/')`
// would reject it before decoding was even attempted. The check below lets a HEIC file through
// even without a `type` (the attempt to decode still happens — which is what makes Safari, who
// does have the right `type` and decodes HEIC natively, work with no special-casing at all) —
// only once that attempt genuinely fails does `decode` classify it as `UNSUPPORTED_FORMAT`
// instead of the generic `NOT_AN_IMAGE`.
const HEIC_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'])
const HEIC_EXTENSION = /\.(heic|heif)$/i

function isHeic(file: File): boolean {
  return HEIC_TYPES.has(file.type) || HEIC_EXTENSION.test(file.name)
}

export async function processImage(
  original: File,
  limits: ImageProcessingLimits,
  framing: Framing = DEFAULT_FRAMING
): Promise<ProcessedImage> {
  if (!original.type.startsWith('image/') && !isHeic(original)) {
    throw new ImageProcessingError('NOT_AN_IMAGE')
  }

  const bitmap = await decode(original)
  const plan = calculateCropPlan({
    sourceWidth: bitmap.width,
    sourceHeight: bitmap.height,
    aspect: limits.aspect,
    mode: limits.mode,
    maxSideInPixels: limits.maxSideInPixels,
    minSideInPixels: limits.minSideInPixels,
    framing
  })

  if (plan.tooSmall) {
    bitmap.close()
    throw new ImageProcessingError('TOO_SMALL')
  }

  const result = await drawAndEncode(bitmap, plan, limits.background, limits.types, limits.quality)

  // Image that was already right and already lean: re-encoding would only make it bigger.
  // Returning the original is the honest outcome — the server validates both the same way.
  if (result.size >= original.size && planChangedNothing(plan, bitmap.width, bitmap.height)) {
    return { file: original, originalBytes: original.size, width: bitmap.width, height: bitmap.height }
  }

  return {
    file: new File([result], renameFile(original.name, result.type), { type: result.type }),
    originalBytes: original.size,
    width: plan.canvas.width,
    height: plan.canvas.height
  }
}

function planChangedNothing(plan: CropPlan, width: number, height: number): boolean {
  return (
    plan.canvas.width === width &&
    plan.canvas.height === height &&
    plan.source.width === width &&
    plan.source.height === height
  )
}

// Side finding while porting: `uploadFileToAws` builds the S3 key as `${Date.now()}-${file.name}`
// unencoded, and the backend concatenates the public URL the same way with no encoding either —
// a file named `Foto do Produto ção.JPG` ends up with spaces/accents baked into a stored URL.
// Since the file gets renamed here anyway (new extension), this is the cheap place to also make
// the name itself URL-safe — fixes it for every upload that goes through this engine (Product
// photos, Company logo), without touching the upload utility or the backend.
function slugify(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '') // strip accents (combining marks, post-NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized === '' ? 'image' : normalized
}

function renameFile(originalName: string, type: string): string {
  const withoutExtension = originalName.replace(/\.[^./\\]+$/, '')
  const extension = type.split('/')[1] ?? 'webp'
  const normalized = extension === 'jpeg' ? 'jpg' : extension
  return `${slugify(withoutExtension)}.${normalized}`
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file)
  } catch {
    if (isHeic(file)) throw new ImageProcessingError('UNSUPPORTED_FORMAT')
    // A file with an image-like extension the browser can't open reads, to whoever uploaded
    // it, as "this isn't an image" — that's the message that needs to land.
    throw new ImageProcessingError('NOT_AN_IMAGE')
  }
}

// ---------------------------------------------------------------------------------------
// Worker

// `undefined` = haven't tried yet; `null` = tried and this browser can't (or a security
// policy blocked it) — the main-thread fallback takes over in that case.
let worker: Worker | null | undefined
let nextId = 0
const pending = new Map<number, { resolve: (blob: Blob) => void; reject: (error: unknown) => void }>()

function getWorker(): Worker | null {
  if (worker !== undefined) return worker
  worker = createWorker()
  return worker
}

function createWorker(): Worker | null {
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return null
  try {
    const created = new Worker(new URL('./image-processing.worker.ts', import.meta.url))
    created.onmessage = (event: MessageEvent<ProcessImageResponse>) => {
      const waiting = pending.get(event.data.id)
      pending.delete(event.data.id)
      if (waiting === undefined) return
      if (event.data.result instanceof Blob) {
        waiting.resolve(event.data.result)
      } else {
        waiting.reject(new ImageProcessingError('COULD_NOT_PROCESS'))
      }
    }
    created.onerror = () => {
      // A worker that fails to even start (e.g. blocked by CSP) still needs every pending
      // promise to settle — otherwise a caller would hang forever instead of falling back.
      for (const [id, waiting] of pending) {
        waiting.reject(new ImageProcessingError('COULD_NOT_PROCESS'))
        pending.delete(id)
      }
    }
    return created
  } catch {
    return null
  }
}

async function drawAndEncode(
  bitmap: ImageBitmap,
  plan: CropPlan,
  background: string | null,
  types: readonly string[],
  quality: number
): Promise<Blob> {
  const activeWorker = getWorker()
  if (activeWorker === null) {
    return drawOnMainThread(bitmap, plan, background, types, quality)
  }

  const id = (nextId += 1)
  return new Promise<Blob>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    const message: ProcessImageMessage = { id, bitmap, plan, background, types, quality }
    activeWorker.postMessage(message, [bitmap])
  })
}

/** Fallback for a browser without Worker or without `OffscreenCanvas`. Blocks the main thread
 * while it runs — worse, which is why it's a fallback, but still better than shipping 8MB over
 * a sales rep's mobile connection in the field. */
async function drawOnMainThread(
  bitmap: ImageBitmap,
  plan: CropPlan,
  background: string | null,
  types: readonly string[],
  quality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = plan.canvas.width
  canvas.height = plan.canvas.height
  const context2d = canvas.getContext('2d')
  if (context2d === null) throw new ImageProcessingError('COULD_NOT_PROCESS')

  if (background !== null) {
    context2d.fillStyle = background
    context2d.fillRect(0, 0, canvas.width, canvas.height)
  }
  context2d.imageSmoothingEnabled = true
  context2d.imageSmoothingQuality = 'high'
  context2d.drawImage(
    bitmap,
    plan.source.x,
    plan.source.y,
    plan.source.width,
    plan.source.height,
    plan.destination.x,
    plan.destination.y,
    plan.destination.width,
    plan.destination.height
  )
  bitmap.close()

  for (const type of types) {
    const result = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, type, quality)
    })
    if (result !== null && (result.type === type || type === types[types.length - 1])) {
      return result
    }
  }
  throw new ImageProcessingError('COULD_NOT_PROCESS')
}
