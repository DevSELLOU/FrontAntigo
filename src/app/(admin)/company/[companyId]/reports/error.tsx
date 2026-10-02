'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * Scoped error boundary for the four report routes. Without it, a failed `serverFetch` — a slow
 * query timing out is the realistic case here — escaped to the root `app/error.tsx`, which takes
 * over the full viewport, drops the sidebar and offers a stack trace. This keeps the shell and
 * says what to do next, per DESIGN §4 "Estados de tela".
 */
export default function ReportsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Falha ao carregar o relatório:', error)
  }, [error])

  return (
    <div className='flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8 gap-6 flex flex-col'>
      <Card className='rounded-2xl border-border bg-surface p-5'>
        <div className='flex flex-col items-center gap-4 py-12 text-center'>
          <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-warning text-warning-foreground'>
            <AlertTriangle className='h-6 w-6' />
          </span>

          <div className='max-w-md'>
            <p className='text-h3 text-text'>Não foi possível carregar o relatório.</p>
            <p className='text-body mt-2 text-text-muted'>
              A consulta não respondeu. Períodos longos costumam ser a causa — tente de novo ou reduza
              os meses e anos selecionados.
            </p>
          </div>

          <Button onClick={reset} className='gap-2'>
            <RotateCcw className='h-4 w-4' />
            Tentar novamente
          </Button>
        </div>
      </Card>
    </div>
  )
}
