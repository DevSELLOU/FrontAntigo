'use client'

import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ProductImageProps {
  src?: string | null
  alt: string
  /** Required: it is what lets the optimizer pick a card-sized variant instead of the original. */
  sizes: string
  /** Set on the first images of the grid so the largest visible one is not lazy-loaded. */
  priority?: boolean
  /** `contain` shows the whole product, `cover` fills a small square thumbnail. */
  fit?: 'contain' | 'cover'
  className?: string
}

/**
 * One place for how a storefront photo behaves while it loads and when it fails.
 *
 * Before this, a missing photo rendered a bare "Sem Imagem" box, a photo whose URL had expired fell
 * through to the browser's broken-image icon (there was no `onError` anywhere), and a photo still
 * downloading left a blank white card — which is what made the grid look broken rather than slow.
 */
export function ProductImage({ src, alt, sizes, priority, fit = 'contain', className }: ProductImageProps) {
  const [hasFailed, setHasFailed] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  if (!src || hasFailed) {
    return (
      <div
        className={cn('flex h-full w-full flex-col items-center justify-center gap-1 bg-surface-muted', className)}
        role='img'
        aria-label={`${alt} — sem imagem`}
      >
        <ImageOff className='h-5 w-5 text-text-muted' aria-hidden='true' />
        <span className='text-caption text-text-muted'>Sem imagem</span>
      </div>
    )
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-surface-muted', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setHasLoaded(true)}
        onError={() => setHasFailed(true)}
        className={cn(
          'transition-opacity duration-300 motion-reduce:transition-none',
          fit === 'contain' ? 'object-contain' : 'object-cover',
          hasLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}
