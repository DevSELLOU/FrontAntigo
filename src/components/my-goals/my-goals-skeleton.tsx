function Block({ className }: { className: string }) {
  return <div className={`rounded-md bg-surface-muted motion-safe:animate-pulse ${className}`} />
}

/** Loading placeholders mirroring the real blocks (design.md §4 — no full-page spinner). */
export function MyGoalsSkeleton() {
  return (
    <div className='flex flex-col gap-6' role='status' aria-label='Carregando suas metas'>
      <div className='rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6'>
        <Block className='h-3 w-40' />
        <Block className='mt-3 h-9 w-32' />
        <Block className='mt-4 h-2 w-full' />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[0, 1, 2, 3].map(index => (
          <div key={index} className='rounded-2xl border border-border bg-surface p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <Block className='h-3 w-24' />
              <Block className='h-10 w-10 rounded-xl' />
            </div>
            <Block className='mt-4 h-7 w-28' />
            <Block className='mt-2 h-3 w-20' />
            <Block className='mt-4 h-2 w-full' />
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6'>
        <Block className='h-4 w-48' />
        <Block className='mt-6 h-52 w-full sm:h-64' />
      </div>

      <div className='rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6'>
        <Block className='h-4 w-40' />
        <div className='mt-5 space-y-3'>
          {[0, 1, 2].map(index => (
            <Block key={index} className='h-12 w-full' />
          ))}
        </div>
      </div>

      <span className='sr-only'>Carregando suas metas…</span>
    </div>
  )
}
