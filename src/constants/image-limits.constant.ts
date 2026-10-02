import type { AspectRatio, FramingMode } from '@/utils/image/crop-plan.util'

export interface ImageProcessingLimits {
  /** Target canvas aspect ratio. `null` preserves the source's own ratio — only the longer
   * side gets capped, nothing is cropped. Used by the Company logo, which is displayed in a
   * wide box (`w-40 h-20`); forcing 1:1 there would waste pixels on a transparent bar. */
  aspect: AspectRatio | null
  mode: FramingMode
  maxSideInPixels: number
  minSideInPixels?: number
  quality: number
  /** Tried in order; the worker/canvas falls through to the next if the browser doesn't
   * honor the requested type (`canvas.toBlob`/`convertToBlob` can silently return PNG). */
  types: string[]
  /** `null` for logo (transparent background where the image doesn't cover the canvas —
   * only relevant in `contain` mode). Product photos always fill the canvas, so the
   * background never actually shows, but a white fallback avoids a flash of transparency in
   * intermediate states while the fill is JPEG-encoded (JPEG has no alpha channel at all). */
  background: string | null
}

// Product photo destinations, checked against the real containers: the modal/full-screen view
// (~1200 device px) is the largest, the 48px table thumbnail is the smallest.
export const PRODUCT_IMAGE_LIMITS: ImageProcessingLimits = {
  aspect: { width: 1, height: 1 },
  mode: 'fill',
  maxSideInPixels: 1400,
  minSideInPixels: 200,
  quality: 0.82,
  types: ['image/webp', 'image/jpeg'],
  background: '#ffffff'
}

// Company logo: largest destination is 160 CSS px (`w-40 h-20`) → 480 at 3x, covered by 512.
export const COMPANY_LOGO_LIMITS: ImageProcessingLimits = {
  aspect: null,
  mode: 'contain',
  maxSideInPixels: 512,
  quality: 0.82,
  types: ['image/webp', 'image/png'],
  background: null
}

// Storefront cover: a wide band across the top of the shop. `fill` because a cover is meant to be
// cropped to the band — `contain` would pillarbox a portrait photo and defeat the point.
// `maxSideInPixels` caps the LONGER side, so 1920 here means 1920×600 at this ratio, not a 1920
// height. `minSideInPixels` warns the shopkeeper before a small photo gets stretched across a
// desktop-width band; the crop engine never upscales.
export const COMPANY_COVER_LIMITS: ImageProcessingLimits = {
  aspect: { width: 16, height: 5 },
  mode: 'fill',
  maxSideInPixels: 1920,
  minSideInPixels: 900,
  quality: 0.82,
  types: ['image/webp', 'image/jpeg'],
  background: '#ffffff'
}
