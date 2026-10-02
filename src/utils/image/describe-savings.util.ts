import { formatFileSize } from '@/utils/format/format-file-size.util'

/** "8 MB → 180 KB". Returns `undefined` when there was no gain — announcing "120 KB → 130 KB"
 * as an achievement would undermine exactly the trust this message exists to build. */
export function describeSavings(originalBytes: number, finalBytes: number): string | undefined {
  if (finalBytes >= originalBytes) return undefined
  return `${formatFileSize(originalBytes)} → ${formatFileSize(finalBytes)}`
}
