function Block({ className }: { className: string }) {
  return <div className={`rounded-md bg-surface-muted motion-safe:animate-pulse ${className}`} />
}

/** Card-shaped placeholders for the representative's route grid (design.md §4). */
export function MyRoutesSkeleton() {
  return (
    <div
      role='status'
      aria-label='Carregando suas rotas'
      className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
    >
      {[0, 1, 2].map(index => (
        <div key={index} className='rounded-2xl border border-border bg-surface p-4 shadow-sm'>
          <div className='flex items-start justify-between gap-3'>
            <Block className='h-5 w-40' />
            <Block className='h-6 w-24 rounded-full' />
          </div>
          <Block className='mt-3 h-3 w-full' />
          <Block className='mt-2 h-3 w-2/3' />
          <div className='mt-4 flex gap-4'>
            <Block className='h-3 w-24' />
            <Block className='h-3 w-20' />
          </div>
          <Block className='mt-4 h-11 w-full rounded-md' />
        </div>
      ))}
      <span className='sr-only'>Carregando suas rotas…</span>
    </div>
  )
}
