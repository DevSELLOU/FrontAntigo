'use client'

// Shared processing/failed overlay for anything picked through the image-processing engine
// (`use-image-processing-queue.ts`) — the recurring pattern between Product photos (a grid of
// these) and the Company logo (a single one), so it's built once instead of twice. Wraps
// whatever image element the caller renders (`<img>` for local previews, `next/image` for the
// existing-photo case) rather than owning the tag itself, since the two consumers need
// different ones.
import { Loader2, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ImageUploadStatus = 'processing' | 'ready' | 'failed'

/** Apply to the wrapped image element itself — dims it while unsettled. */
export function imageUploadOpacityClass(status?: ImageUploadStatus): string {
  return status === 'processing' || status === 'failed' ? 'opacity-40' : ''
}

interface ImageUploadPreviewProps {
  status?: ImageUploadStatus
  failureMessage?: string
  className?: string
  children: ReactNode
}

export function ImageUploadPreview({ status, failureMessage, className, children }: ImageUploadPreviewProps) {
  return (
    <div className={cn('relative', className)}>
      {children}

      {status === 'processing' && (
        <div className='absolute inset-0 flex items-center justify-center' aria-live='polite'>
          <Loader2 className='h-6 w-6 animate-spin text-[#008440]' aria-label='Preparando imagem' />
        </div>
      )}

      {status === 'failed' && (
        <div className='absolute inset-0 flex items-center justify-center' aria-live='polite'>
          <TriangleAlert className='h-6 w-6 text-danger-foreground' aria-label={failureMessage ?? 'Falha ao preparar imagem'} />
        </div>
      )}
    </div>
  )
}
