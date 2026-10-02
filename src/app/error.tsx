'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react'
import { useState } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  return (
    /* h-screen + overflow-y-auto on purpose: the root layout locks `body` with
       overflow-hidden, so a full-screen state has to carry its own scroll or the expanded
       stack trace becomes unreachable. */
    <div className='flex h-screen flex-col items-center justify-center overflow-y-auto bg-app p-4'>
      <div className='w-full max-w-md space-y-6 py-6'>
        <div className='space-y-2 text-center'>
          <div
            aria-hidden='true'
            className='mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-danger text-danger-foreground'
          >
            <AlertCircle className='h-8 w-8' />
          </div>
          <h1 className='text-h1 text-text'>Algo deu errado</h1>
          <p className='text-body text-text-muted'>Não foi possível concluir a sua solicitação.</p>
        </div>

        <Alert className='border-danger-border bg-danger text-danger-foreground'>
          <AlertTitle>Erro na aplicação</AlertTitle>
          <AlertDescription>
            Tente atualizar a página ou entre em contato com o suporte se o problema continuar.
            {error.digest && (
              <span className='mt-2 block font-mono text-xs'>Código do erro: {error.digest}</span>
            )}
          </AlertDescription>
        </Alert>

        <div className='space-y-3'>
          <Button variant='default' className='w-full' onClick={() => reset()}>
            <RefreshCcw className='h-4 w-4' /> Tentar novamente
          </Button>

          <Button variant='outline' className='w-full' onClick={() => (window.location.href = '/')}>
            Voltar para a página inicial
          </Button>

          <Button
            variant='ghost'
            className='w-full text-text-muted'
            aria-expanded={showErrorDetails}
            onClick={() => setShowErrorDetails(!showErrorDetails)}
          >
            {showErrorDetails ? (
              <>
                Ocultar detalhes do erro <ChevronUp className='h-4 w-4' />
              </>
            ) : (
              <>
                Mostrar detalhes do erro <ChevronDown className='h-4 w-4' />
              </>
            )}
          </Button>
        </div>

        {showErrorDetails && (
          <div className='mt-4 rounded-md border border-border bg-surface-muted p-4 font-mono text-sm text-text-body'>
            <div className='mb-2'>
              <span className='font-semibold text-text'>Erro:</span> {error.message}
            </div>
            {error.stack && (
              <div>
                <span className='font-semibold text-text'>Rastreamento da pilha:</span>
                <pre className='mt-1 overflow-x-auto whitespace-pre-wrap text-xs'>{error.stack}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
