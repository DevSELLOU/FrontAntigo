export default function NotFound() {
  return (
    /* h-screen + overflow-y-auto on purpose: the root layout locks `body` with
       overflow-hidden, so a full-screen state has to carry its own scroll. */
    <div className='flex h-screen items-center justify-center overflow-y-auto bg-app px-4 py-10'>
      <div className='flex w-full max-w-2xl flex-col items-center justify-center gap-6 text-center'>
        <div className='text-7xl font-bold text-border-strong xl:text-9xl' aria-hidden='true'>
          404
        </div>

        <div className='flex flex-col gap-2'>
          <h1 className='text-h2 text-text xl:text-h1'>Página não encontrada</h1>
          <p className='text-body text-text-muted max-w-md text-balance'>
            A página que você procura não existe ou foi removida. Confira o endereço digitado e tente novamente.
          </p>
        </div>
      </div>
    </div>
  )
}
