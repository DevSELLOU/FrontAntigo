import { Button } from '@/components/ui/button'
import { Ban } from 'lucide-react'
import Link from 'next/link'

export const NonAuthorizedPage = () => {
  return (
    /* h-screen + overflow-y-auto on purpose: at /forbidden this renders standalone, and the
       root layout locks `body` with overflow-hidden — without its own scroll the exit button
       is clipped away in landscape. */
    <div className='flex h-screen flex-1 flex-col items-center justify-center gap-6 overflow-y-auto bg-app px-4 py-10 text-center xl:px-10'>
      <div
        aria-hidden='true'
        className='flex h-16 w-16 items-center justify-center rounded-lg bg-warning text-warning-foreground'
      >
        <Ban className='h-8 w-8' />
      </div>

      <div className='flex flex-col gap-2'>
        <h1 className='text-h1 text-text'>Você não está autorizado</h1>
        <p className='text-body text-text-muted max-w-md text-balance'>
          Você não tem permissão para acessar esta página. Entre com uma conta que tenha esse acesso.
        </p>
      </div>

      {/* `asChild` on purpose: <Link><Button> renders <a><button>, which is invalid HTML
          and a nested control for screen readers. */}
      <div className='flex flex-col items-center gap-3'>
        <Button asChild>
          <Link href='/'>Ir para a página inicial</Link>
        </Button>
        <Button asChild variant='link' className='font-semibold text-primary'>
          <Link href='/sign-in?session=true'>Entrar com outra conta</Link>
        </Button>
      </div>
    </div>
  )
}
