'use client'

import { ChevronRight, ExternalLink, FileText, Lock, Package } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { useRouter } from 'next/navigation'
import { OrderHistory } from './order-history'
import { PasswordChange } from './password-change'

export function AccountManagement() {
  const router = useRouter()
  const { company } = useShop()
  const { isAuthenticated } = useShopAuth()
  const [activeTab, setActiveTab] = useState('orders')

  if (!isAuthenticated) {
    router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/sign-in`)
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrderHistory />
      case 'password':
        return <PasswordChange />
      default:
        return <OrderHistory />
    }
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-6 gap-6'>
        <div className='hidden md:block w-64 flex-shrink-0'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Minha Conta</CardTitle>
              <CardDescription>Gerencie suas informações</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <nav className='flex flex-col'>
                <Button
                  variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
                  className='justify-start rounded-none h-12 px-4'
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className='mr-2 h-4 w-4' />
                  Meus Pedidos
                  <ChevronRight className='ml-auto h-4 w-4' />
                </Button>
                <Button
                  variant={activeTab === 'password' ? 'secondary' : 'ghost'}
                  className='justify-start rounded-none h-12 px-4'
                  onClick={() => setActiveTab('password')}
                >
                  <Lock className='mr-2 h-4 w-4' />
                  Alterar Senha
                  <ChevronRight className='ml-auto h-4 w-4' />
                </Button>
                <Link
                  href='/privacy-policy'
                  target='_blank'
                  className='flex items-center justify-start rounded-none h-12 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Política de Privacidade
                  <ExternalLink className='ml-auto h-4 w-4' />
                </Link>
                <Link
                  href='/terms'
                  target='_blank'
                  className='flex items-center justify-start rounded-none h-12 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Termos de Uso
                  <ExternalLink className='ml-auto h-4 w-4' />
                </Link>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className='md:hidden w-full'>
          <Card>
            <CardContent className='p-4'>
              <div className='mb-4 flex flex-col gap-2'>
                <Link
                  href='/politica-de-privacidade.pdf'
                  target='_blank'
                  className='flex items-center justify-between p-2 text-sm text-muted-foreground hover:text-foreground'
                >
                  <span className='flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    Política de Privacidade
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </Link>
                <Link
                  href='/termos-de-uso.pdf'
                  target='_blank'
                  className='flex items-center justify-between p-2 text-sm text-muted-foreground hover:text-foreground'
                >
                  <span className='flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    Termos de Uso
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </Link>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='orders'>Meus Pedidos</TabsTrigger>
                  <TabsTrigger value='password'>Alterar Senha</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className='flex-1'>
          <Card className='h-full'>
            <CardContent className='p-6'>{renderContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
