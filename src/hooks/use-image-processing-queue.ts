'use client'

// Sequential processing queue for the image-treatment engine (`image-processing.util.ts`).
// Ported in spirit from `_Sellou/packages/ui/.../fila-de-imagens.ts`, but reshaped: the beta
// hook OWNS its list of images (its UI is built entirely around that list). Here, the caller
// (`product-form.tsx`) already owns a list (`imagesWithPreviews`/`SortableImageItem[]`) — this
// hook doesn't duplicate that state, it only sequences the async work and reports each result
// back through an `onUpdate` callback the caller supplies per batch, keyed by `clientKey`.
//
// SEQUENTIAL ON PURPOSE (queue of one): ten 12-megapixel bitmaps decoded at once is ~500MB of
// live memory — a real risk on a field rep's Android. Since the actual work already runs off
// the main thread (the worker), the UI stays responsive either way; sequential just keeps
// memory flat, at the cost of ~2-4s of wall-clock for ten photos, with per-item progress.
import { useCallback, useRef } from 'react'
import type { ImageProcessingLimits } from '@/constants/image-limits.constant'
import { DEFAULT_FRAMING, type Framing } from '@/utils/image/crop-plan.util'
import { describeSavings } from '@/utils/image/describe-savings.util'
import { ImageProcessingError, processImage } from '@/utils/image/image-processing.util'
import { describeProcessingFailure } from '@/utils/image/processing-failure-message.util'

export interface QueueItemResult {
  readonly clientKey: string
  readonly status: 'ready' | 'failed'
  readonly file?: File
  readonly preview?: string
  readonly savings?: string
  /** The framing that produced this result — echoed back so the caller can remember it (e.g.
   * to reopen the crop dialog pre-set to what's actually live, not always the default). */
  readonly framing?: Framing
  /** Set when the browser couldn't process the image and it's uploading untreated instead of
   * being rejected outright — the pessimistic-but-not-blocking outcome. */
  readonly fallbackWarning?: string
  readonly failureMessage?: string
}

export interface QueueEntry {
  readonly clientKey: string
  readonly file: File
  /** Defaults to the automatic framing — pass the confirmed one when re-processing after
   * "Ajustar" changed it. */
  readonly framing?: Framing
}

export function useImageProcessingQueue(limits: ImageProcessingLimits) {
  const pendingRef = useRef<QueueEntry[]>([])
  const isDrainingRef = useRef(false)

  const processEntry = useCallback(
    async (entry: QueueEntry, onUpdate: (result: QueueItemResult) => void) => {
      const framing = entry.framing ?? DEFAULT_FRAMING
      try {
        const processed = await processImage(entry.file, limits, framing)
        const preview = URL.createObjectURL(processed.file)
        onUpdate({
          clientKey: entry.clientKey,
          status: 'ready',
          file: processed.file,
          preview,
          framing,
          savings: describeSavings(processed.originalBytes, processed.file.size)
        })
      } catch (error) {
        if (error instanceof ImageProcessingError && error.reason === 'COULD_NOT_PROCESS') {
          // The browser couldn't prepare it, but the image itself may be perfectly fine — it
          // uploads as-is and the SERVER decides. Refusing here would invent a rule that isn't
          // ours to enforce client-side.
          const preview = URL.createObjectURL(entry.file)
          onUpdate({
            clientKey: entry.clientKey,
            status: 'ready',
            file: entry.file,
            preview,
            framing,
            fallbackWarning: 'Enviada do jeito que veio — seu navegador não conseguiu prepará-la.'
          })
          return
        }

        onUpdate({ clientKey: entry.clientKey, status: 'failed', failureMessage: describeProcessingFailure(error) })
      }
    },
    [limits]
  )

  const drain = useCallback(
    async (onUpdate: (result: QueueItemResult) => void) => {
      if (isDrainingRef.current) return
      isDrainingRef.current = true
      try {
        while (pendingRef.current.length > 0) {
          const next = pendingRef.current.shift()
          if (next === undefined) break
          await processEntry(next, onUpdate)
        }
      } finally {
        isDrainingRef.current = false
      }
    },
    [processEntry]
  )

  const enqueue = useCallback(
    (entries: QueueEntry[], onUpdate: (result: QueueItemResult) => void) => {
      if (entries.length === 0) return
      pendingRef.current = [...pendingRef.current, ...entries]
      void drain(onUpdate)
    },
    [drain]
  )

  return { enqueue }
}
