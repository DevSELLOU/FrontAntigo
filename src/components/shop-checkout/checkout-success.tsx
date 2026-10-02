'use client'

import { useShop } from '@/hooks/use-shop'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export function ShopOrderSuccessPage() {
  const router = useRouter()
  const { company } = useShop()

  return (
    <div className='min-h-[80vh] w-full flex items-center justify-center p-4'>
      <Card className='max-w-md w-full p-6 text-center space-y-6'>
        <div className='flex justify-center'>
          <div className='rounded-full bg-success p-3'>
            <CheckCircle className='w-12 h-12 text-success-foreground' />
          </div>
        </div>

        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>Pedido Confirmado!</h1>
          <p className='text-muted-foreground'>
            Seu pedido foi recebido com sucesso. Em breve entraremos em contato para dar continuidade ao processo.
          </p>
        </div>

        <div className='pt-4'>
          <Button size='lg' className='min-w-[200px]' onClick={() => router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`)}>
            Voltar à Loja
          </Button>
        </div>
      </Card>
    </div>
  )
}
