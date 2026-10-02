'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShop } from '@/hooks/use-shop'
import { useShopAuth } from '@/hooks/use-shop-auth'
import { Search, ShoppingCart, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UserMenu } from './user-menu'

export function ShopHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signOut, isAuthenticated } = useShopAuth()
  const { state, dispatch, company } = useShop()
  const [searchQuery, setSearchQuery] = useState('')

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)

  const logoUrl = company?.logoUrl

  useEffect(() => {
    const search = searchParams.get('search')
    setSearchQuery(search || '')
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`)
    }
  }

  const handleLogin = () => {
    router.push(`/shop/${encodeURIComponent(company?.fantasyName ?? '')}/sign-in`)
  }

  // `bg-primary` resolves to `var(--custom-color, var(--action))`, which the shop layout sets from
  // the company's shop/brand colour. The previous inline style built `#${company?.customColor}`, a
  // template literal that is truthy even when the colour is missing — so `|| undefined` never fired
  // and a company with neither colour got the literal string `"#undefined"`, leaving the header
  // unpainted with near-white text on it.
  return (
    <header className='sticky top-0 z-50 w-full max-w-full border-b bg-primary text-primary-foreground shadow-md'>
      <div className='flex h-16 items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 md:px-10'>
        {logoUrl ? (
          <Link className='relative h-11 w-24 flex-shrink-0 sm:h-20 sm:w-40' href={`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`}>
            <Image
              priority
              fill
              sizes='(min-width: 640px) 160px, 96px'
              src={logoUrl}
              alt={`Logo ${company?.fantasyName}`}
              className='rounded-md object-contain'
            />
          </Link>
        ) : (
          <Link href={`/shop/${encodeURIComponent(company?.fantasyName ?? '')}`} className='flex min-h-11 min-w-0 items-center truncate text-lg font-bold sm:text-2xl'>
            {company?.fantasyName}
          </Link>
        )}

        <div className='flex items-center gap-4 lg:gap-6'>
          <form className='flex-1  items-center gap-4 hidden lg:flex lg:gap-6 max-w-xl' onSubmit={handleSearch}>
            <div className='flex-1 relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Buscar produtos...'
                className='pl-8'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {isAuthenticated ? (
            <UserMenu user={user} signOut={signOut} fantasyName={company?.fantasyName} />
          ) : (
            <Button variant='outline' onClick={handleLogin} className='min-h-11 min-w-11 gap-2 text-primary'>
              <User className='h-4 w-4' />
              <span className='hidden sm:inline'>Entrar</span>
              <span className='sr-only'>na sua conta</span>
            </Button>
          )}
          {/* The trigger was icon-only with no accessible name, so a screen reader announced it as
              just "button", and the item count changed silently. */}
          <Button
            variant='outline'
            className='relative min-h-11 min-w-11 text-primary'
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
          >
            <ShoppingCart className='h-4 w-4' />
            <span className='sr-only'>Abrir carrinho</span>
            {totalItems > 0 && (
              <span
                aria-live='polite'
                className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'
              >
                {totalItems}
                <span className='sr-only'> itens no carrinho</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      <form className='flex w-full items-center gap-4 px-4 pb-3 sm:px-6 lg:hidden' onSubmit={handleSearch}>
        <div className='flex-1 relative'>
          <Search className='pointer-events-none absolute left-2.5 top-4 h-4 w-4 text-muted-foreground md:top-2.5' />
          <Input
            type='search'
            placeholder='Buscar produtos...'
            className='pl-8'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
    </header>
  )
}
