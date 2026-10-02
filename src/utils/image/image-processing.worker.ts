// Dumb painter, no decisions: given a bitmap and an already-computed crop plan, it draws and
// re-encodes on `OffscreenCanvas`, off the main thread. All the geometry lives in
// `crop-plan.util.ts` (testable); this file only executes what that produced.
//
// Instantiated by webpack's native worker support (`new Worker(new URL('./image-processing
// .worker.ts', import.meta.url))` in `image-processing.util.ts`), emitted as its own chunk
// under `/_next/static/chunks/` — same-origin, so it passes the project's CSP without any
// change to it. The beta project (`_Sellou`) builds this same worker from a `Blob` string
// instead, because its UI package compiles with plain `tsc`, no bundler — that reason doesn't
// apply here, and a `Blob` worker would actually be blocked by this project's
// `script-src`, which has no `blob:` (confirmed by reading `next.config.mjs`).
import type { CropPlan } from './crop-plan.util'

export interface ProcessImageMessage {
  readonly id: number
  readonly bitmap: ImageBitmap
  readonly plan: CropPlan
  readonly background: string | null
  readonly types: readonly string[]
  readonly quality: number
}

export interface ProcessImageResponse {
  readonly id: number
  readonly result?: Blob
  readonly error?: string
}

// Typed narrowly instead of pulling in the `webworker` lib (this project only loads `DOM` +
// `DOM.Iterable`, shared with the rest of the app) — `self` under `DOM` types as `Window`,
// whose `postMessage` signature doesn't match what a worker actually needs.
const context = self as unknown as {
  onmessage: ((event: MessageEvent<ProcessImageMessage>) => void) | null
  postMessage: (message: ProcessImageResponse) => void
}

context.onmessage = async event => {
  const { id, bitmap, plan, background, types, quality } = event.data
  try {
    const canvas = new OffscreenCanvas(plan.canvas.width, plan.canvas.height)
    const context2d = canvas.getContext('2d')
    if (context2d === null) throw new Error('no 2d context')

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

    let result: Blob | null = null
    for (const type of types) {
      const attempt = await canvas.convertToBlob({ type, quality })
      result = attempt
      if (attempt.type === type) break
    }

    if (result === null) throw new Error('convertToBlob produced no output')
    context.postMessage({ id, result })
  } catch (error) {
    context.postMessage({ id, error: String(error) })
  }
}
