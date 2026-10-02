import { ImageProcessingError, type ProcessingFailureReason } from './image-processing.util'

const FAILURE_MESSAGES: Record<ProcessingFailureReason, string> = {
  NOT_AN_IMAGE: 'Este arquivo não é uma imagem.',
  UNSUPPORTED_FORMAT: 'Formato de imagem não suportado neste navegador.',
  TOO_SMALL: 'Imagem pequena demais para este uso.',
  COULD_NOT_PROCESS: 'Não foi possível preparar a imagem.'
}

/** User-facing message for a processing failure. Shared by every consumer of
 * `processImage`/the queue, so the wording never drifts between Product photos and the Logo. */
export function describeProcessingFailure(error: unknown): string {
  const reason: ProcessingFailureReason = error instanceof ImageProcessingError ? error.reason : 'COULD_NOT_PROCESS'
  return FAILURE_MESSAGES[reason]
}
