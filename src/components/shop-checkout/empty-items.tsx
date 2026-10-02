'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { Button } from '../ui/button'

export function EmptyItems({ router, fantasyName }: { router: AppRouterInstance; fantasyName: string }) {
  return (
    <div className='flex items-center justify-center py-20 px-10'>
      <div className='max-w-md mx-auto text-center'>
        <h1 className='text-2xl font-bold mb-4'>Seu carrinho está vazio</h1>
        <p className='text-muted-foreground mb-8'>Adicione produtos ao seu carrinho para continuar com a compra.</p>
        <Button onClick={() => router.push(`/shop/${encodeURIComponent(fantasyName)}`)}>Continuar comprando</Button>
      </div>
    </div>
  )
}
