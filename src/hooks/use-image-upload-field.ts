'use client'

import type { ImageProcessingLimits } from '@/constants/image-limits.constant'
import { useImageProcessingQueue } from '@/hooks/use-image-processing-queue'
import { useToast } from '@/hooks/use-toast'
import { DEFAULT_FRAMING, type Framing } from '@/utils/image/crop-plan.util'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Guard against a pick so large the decode itself would hang the tab. */
const MAX_RAW_FILE_BYTES = 40 * 1024 * 1024

export interface ImageUploadField {
  /** The treated file, ready to upload. Null when nothing new was picked. */
  file: File | null
  previewUrl: string | null
  status: 'processing' | 'ready' | 'failed'
  framing: Framing
  /** Whether "Ajustar" has a source to re-crop from. */
  canAdjust: boolean
  inputRef: React.RefObject<HTMLInputElement>
  isCropDialogOpen: boolean
  cropDialogImageUrl: string | null
  openCropDialog: () => void
  closeCropDialog: () => void
  selectFile: (files: FileList | null) => void
  applyFraming: (framing: Framing) => void
}

/**
 * Everything one image field needs: pick, process, preview, re-crop, and blob hygiene.
 *
 * This lived inline in `company-preferences-form.tsx` as seven `useState` and two effects, all
 * named after the logo. Adding the storefront cover meant either a second literal copy of that
 * block or this — and a copy would have doubled the file with code that has to stay in sync.
 *
 * `clientKey` only has to be unique per field: the picker is disabled while processing, so a
 * single field never has two entries in flight.
 */
export function useImageUploadField(limits: ImageProcessingLimits, clientKey: string): ImageUploadField {
  const { toast } = useToast()
  const { enqueue } = useImageProcessingQueue(limits)

  const [file, setFile] = useState<File | null>(null)
  // The raw pick, kept apart from `file` (which becomes the treated result) so "Ajustar" always
  // re-crops from the untouched source instead of degrading a already-encoded copy.
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [framing, setFraming] = useState<Framing>(DEFAULT_FRAMING)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'processing' | 'ready' | 'failed'>('ready')
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [cropDialogImageUrl, setCropDialogImageUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Whenever `previewUrl` is replaced (a fresh pick, or the engine swapping the raw preview for
  // the treated one) or the field unmounts, the PREVIOUS blob is revoked — never minted in the
  // render body, which would leak a new one on every render.
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Blob local to the dialog's lifetime.
  useEffect(() => {
    if (!isCropDialogOpen || !originalFile) return

    const url = URL.createObjectURL(originalFile)
    setCropDialogImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
      setCropDialogImageUrl(null)
    }
  }, [isCropDialogOpen, originalFile])

  const selectFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const selectedFile = files[0]

      if (inputRef.current) inputRef.current.value = ''

      if (selectedFile.size > MAX_RAW_FILE_BYTES) {
        toast({ title: `O arquivo ${selectedFile.name} excede o limite de 40MB.`, status: 'error' })
        return
      }

      // Shows the raw pick immediately, then swaps both file and preview for the treated version
      // once the crop/resize engine finishes.
      setStatus('processing')
      setFile(selectedFile)
      setOriginalFile(selectedFile)
      setFraming(DEFAULT_FRAMING)
      setPreviewUrl(URL.createObjectURL(selectedFile))

      enqueue([{ clientKey, file: selectedFile }], result => {
        if (result.status === 'failed') {
          setFile(null)
          setOriginalFile(null)
          setPreviewUrl(null)
          setStatus('ready')
          toast({ title: result.failureMessage ?? 'Não foi possível preparar a imagem.', status: 'error' })
          return
        }

        if (result.fallbackWarning) {
          toast({ title: result.fallbackWarning, status: 'warning' })
        }

        setFile(result.file ?? selectedFile)
        setPreviewUrl(result.preview ?? null)
        setFraming(result.framing ?? DEFAULT_FRAMING)
        setStatus('ready')
      })
    },
    [clientKey, enqueue, toast]
  )

  const applyFraming = useCallback(
    (nextFraming: Framing) => {
      setIsCropDialogOpen(false)
      if (!originalFile) return

      setStatus('processing')

      enqueue([{ clientKey, file: originalFile, framing: nextFraming }], result => {
        if (result.status === 'failed') {
          setStatus('ready')
          toast({ title: result.failureMessage ?? 'Não foi possível preparar a imagem.', status: 'error' })
          return
        }

        if (result.fallbackWarning) {
          toast({ title: result.fallbackWarning, status: 'warning' })
        }

        setFile(result.file ?? originalFile)
        setPreviewUrl(result.preview ?? null)
        setFraming(result.framing ?? nextFraming)
        setStatus('ready')
      })
    },
    [clientKey, enqueue, originalFile, toast]
  )

  return {
    file,
    previewUrl,
    status,
    framing,
    canAdjust: Boolean(originalFile),
    inputRef,
    isCropDialogOpen,
    cropDialogImageUrl,
    openCropDialog: () => setIsCropDialogOpen(true),
    closeCropDialog: () => setIsCropDialogOpen(false),
    selectFile,
    applyFraming
  }
}
