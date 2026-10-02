import { CustomError } from '@/errors/custom-error.error'
import type { CommonResponse } from '@/interfaces/common-response.interface'
import { signOut } from 'next-auth/react'
import { clientFetch } from './client-fetch.util'
import { isApiErrorResponse } from './is-api-error-response.util'

interface GetPreSignedUrlResponse {
  presignedUrl: string
  previewUrl: string
}

export async function uploadFileToAws(file: File): Promise<string> {
  try {
    const body = JSON.stringify({
      filename: file.name ? `${Date.now()}-${file.name}` : `upload-${Date.now()}.png`,
      filetype: file.type === 'image/jpg' ? 'image/jpeg' : file.type
    })

    const response = await clientFetch<CommonResponse<GetPreSignedUrlResponse>>(
      '/uploads/presigned-url',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      },
      { handleTokenExpired: signOut }
    )

    if (isApiErrorResponse(response)) {
      throw new CustomError(response.message)
    }

    const { presignedUrl, previewUrl } = response.data

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    if (!uploadResponse.ok) {
      throw new Error('Falha no upload para o S3')
    }

    return previewUrl
  } catch (error) {
    throw error
  }
}
