'use client'

import { useShop } from '@/hooks/use-shop'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'

export default function RequestAccessSuccess() {
  const { company } = useShop()

  return (
    <div className='min-h-[600px] flex items-center justify-center p-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <CheckCircle className='h-12 w-12 text-success-foreground' />
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>Acesso requisitado com sucesso!</h1>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>Recebemos a sua solicitação de acesso à loja.</p>
          <div className='rounded-lg bg-muted p-4'>
            <h2 className='font-semibold mb-2'>O que acontece agora?</h2>
            <p className='text-sm text-muted-foreground'>
              A equipe responsável pela loja será notificada e em breve você receberá um e-mail com as instruções.
            </p>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button asChild>
            <Link href={`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`}>Continuar visualizando o catálogo</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
