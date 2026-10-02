'use client'

import { CartDrawer } from '@/components/shop/cart-drawer'
import { ShopHeader } from '@/components/shop/shop-header'
import { ScreenLoading } from '@/components/ui/screen-loading'
import { ShopAuthProvider } from '@/contexts/shop-auth-context'
import { ShopProvider } from '@/contexts/shop-context'
import { CommonResponse } from '@/interfaces/common-response.interface'
import { Company } from '@/interfaces/company.interface'
import { clientFetch } from '@/utils/client-fetch.util'
import { isApiErrorResponse } from '@/utils/is-api-error-response.util'
import { isValidColor } from '@/utils/is-valid-color.util'
import { setCustomColor } from '@/utils/set-custom-color.util'
import { Button } from '@/components/ui/button'
import { PlugZap } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  params: {
    fantasyName: string
  }
}

export default function ShopLayout({ children, params }: LayoutProps) {
  const { fantasyName } = params
  const [isLoading, setIsLoading] = useState(true)
  const [company, setCompany] = useState<Company | undefined>()
  // Sem isto, qualquer falha caía no `catch` e terminava em `notFound()` — uma queda de rede
  // virava "esta loja não existe", que é mentira e afugenta o comprador.
  const [loadFailed, setLoadFailed] = useState(false)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoadFailed(false)

        const url = `/company/by-fantasy-name/${encodeURIComponent(fantasyName)}/public`
        const response = await clientFetch<CommonResponse<Company>>(url, { method: 'GET' })

        if (isApiErrorResponse(response)) {
          // 404 é a única resposta que significa de verdade "esta loja não existe". Qualquer
          // outra (500, 502, timeout) é falha nossa, e o visitante merece um "tentar de novo".
          if (response.statusCode === 404) {
            setCompany(undefined)
            return
          }

          throw new Error(response.message)
        }

        // Falls back to `customColor` so a company that only set the brand colour still gets a
        // painted storefront: without this, `--custom-color`/`--custom-text-color` stay unset and
        // every `bg-primary` in the shop silently drops to the default Sellou green with
        // near-white text on top of it.
        const shopBrandColor = response?.data?.shopColor || response?.data?.customColor

        if (shopBrandColor && isValidColor(shopBrandColor)) {
          setCustomColor(shopBrandColor)
        }

        setCompany(response.data)
      } catch (error) {
        console.error('Failed to fetch company data:', error)
        setLoadFailed(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyData()
  }, [fantasyName, retryToken])

  if (isLoading) {
    return <ScreenLoading />
  }

  if (loadFailed) {
    return (
      /* h-screen + overflow-y-auto de propósito: o layout raiz trava o `body` com
         overflow-hidden, então toda tela cheia carrega a própria rolagem. */
      <div className='flex h-screen items-center justify-center overflow-y-auto bg-app px-4 py-10'>
        <div className='flex w-full max-w-md flex-col items-center gap-6 text-center'>
          <PlugZap className='h-16 w-16 text-danger-foreground' aria-hidden='true' />
          <div className='flex flex-col gap-2'>
            <h1 className='text-h2 text-text'>Não foi possível abrir a loja</h1>
            <p className='text-body text-text-muted text-balance'>
              Pode ter sido uma falha de conexão. A loja continua existindo — é só tentar de novo.
            </p>
          </div>
          <Button onClick={() => setRetryToken(token => token + 1)}>Tentar de novo</Button>
        </div>
      </div>
    )
  }

  if (!company) {
    notFound()
  }

  return (
    <ShopAuthProvider>
      <ShopProvider company={company}>
        {/* `100dvh`, not `100vh`: on iOS Safari and Chrome Android `100vh` is taller than what is
            actually visible, so the URL bar never collapses and the last ~80px of the shop sit
            behind the browser toolbar. */}
        <main className='mx-auto flex h-[100dvh] w-full flex-col'>
          <ShopHeader />
          {/* The footer is `fixed`, so it sits outside the flow and would otherwise cover whatever
              ends the page. The grid used to compensate with its own `mb-12`, which left the
              product page and the checkout — the screen where the primary button lives — covered.
              Reserving the space here fixes every shop route at once, home indicator included. */}
          <div
            className='flex-1 overflow-y-auto'
            style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
          >
            {children}
          </div>
          <CartDrawer />
        </main>
      </ShopProvider>
    </ShopAuthProvider>
  )
}
