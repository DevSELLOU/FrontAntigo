'use client'

import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import { ImageUploadPreview, imageUploadOpacityClass } from '@/components/shared/image-upload-preview'
import type { ImageProcessingLimits } from '@/constants/image-limits.constant'
import type { ImageUploadField } from '@/hooks/use-image-upload-field'
import { cn } from '@/lib/utils'
import { Crop } from 'lucide-react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { FormControl, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'

interface ImageUploadFieldControlProps {
  /** Shown above the stored image, e.g. "Logo Atual". */
  currentLabel: string
  /** Shown above the freshly picked one, e.g. "Novo Logo". */
  newLabel: string
  /** Placeholder text when there is neither, e.g. "SUA LOGO AQUI". */
  emptyText: string
  changeLabel: string
  currentUrl?: string | null
  field: ImageUploadField
  limits: ImageProcessingLimits
  /** The frame the previews are drawn in — a logo is a short band, a cover is a wide one. */
  previewClassName?: string
  /** `contain` for a logo (show it whole), `cover` for a cover (fill the band). */
  fit?: 'contain' | 'cover'
  helperText?: string
}

/**
 * The picker + preview + re-crop block, shared by the logo and the storefront cover.
 *
 * Both fields need exactly the same five states (stored image, new pick, processing overlay,
 * empty placeholder, crop dialog); this renders them from one place so the cover cannot drift
 * away from the logo as either is maintained.
 */
export function ImageUploadFieldControl({
  currentLabel,
  newLabel,
  emptyText,
  changeLabel,
  currentUrl,
  field,
  limits,
  previewClassName = 'w-full h-20',
  fit = 'contain',
  helperText
}: ImageUploadFieldControlProps) {
  const frameClassName = cn('border border-input rounded-md shadow-sm border-dashed', previewClassName)
  const fitClassName = fit === 'cover' ? 'object-cover' : 'object-contain'

  return (
    <div className='relative flex flex-col gap-4'>
      {currentUrl ? (
        <FormItem>
          <FormLabel>{currentLabel}</FormLabel>
          <FormControl>
            <div className={cn('relative', frameClassName)}>
              <Image
                priority
                fill
                sizes='(min-width: 1024px) 320px, 100vw'
                alt={currentLabel}
                src={currentUrl}
                className={fitClassName}
                unoptimized={true}
              />
            </div>
          </FormControl>
        </FormItem>
      ) : null}

      {field.file && field.previewUrl ? (
        <FormItem>
          <FormLabel>{newLabel}</FormLabel>
          <FormControl>
            <ImageUploadPreview status={field.status} className={frameClassName}>
              <Image
                priority
                fill
                alt={newLabel}
                src={field.previewUrl}
                unoptimized
                className={cn(fitClassName, 'transition-opacity', imageUploadOpacityClass(field.status))}
              />
            </ImageUploadPreview>
          </FormControl>
        </FormItem>
      ) : null}

      {!field.file && !currentUrl ? (
        <div className={cn('relative flex select-none items-center justify-center', frameClassName)}>
          <p className='text-center text-xl font-extrabold text-gray-300'>{emptyText}</p>
        </div>
      ) : null}

      {helperText && <p className='text-sm text-muted-foreground'>{helperText}</p>}

      <div className='flex gap-2'>
        <Button
          type='button'
          className='text-gray-950'
          onClick={() => field.inputRef.current?.click()}
          variant='secondary'
          disabled={field.status === 'processing'}
        >
          {field.file ? 'Escolher outra' : changeLabel}
        </Button>

        {field.file && field.canAdjust && field.status === 'ready' && (
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={field.openCropDialog}
            title={`Ajustar ${newLabel.toLowerCase()}`}
            aria-label={`Ajustar ${newLabel.toLowerCase()}`}
          >
            <Crop className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* `image/*`, not an explicit list: the processing engine handles HEIC on Safari, and
          narrowing this would stop an iPhone owner from picking a photo straight from Photos. */}
      <Input
        ref={field.inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={e => field.selectFile(e.target.files)}
      />

      {field.canAdjust && field.cropDialogImageUrl && (
        <ImageCropDialog
          open={field.isCropDialogOpen}
          fileName={field.file?.name ?? newLabel}
          imageUrl={field.cropDialogImageUrl}
          aspect={limits.aspect}
          mode={limits.mode}
          maxSideInPixels={limits.maxSideInPixels}
          initialFraming={field.framing}
          onClose={field.closeCropDialog}
          onConfirm={field.applyFraming}
        />
      )}
    </div>
  )
}
