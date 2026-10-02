function Block({ className }: { className: string }) {
  return <div className={`rounded-md bg-surface-muted motion-safe:animate-pulse ${className}`} />
}

/** Placeholders for the trip execution screen (design.md §4 — no full-page spinner). */
export function TripExecutionSkeleton() {
  return (
    <div className='flex flex-col gap-6' role='status' aria-label='Carregando a viagem'>
      <div className='rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-surface)] px-5 py-5 shadow-sm sm:px-6'>
        <div className='flex items-start gap-4'>
          <Block className='hidden h-12 w-12 rounded-2xl sm:block' />
          <div className='flex-1'>
            <Block className='h-3 w-40' />
            <Block className='mt-2 h-7 w-56' />
            <Block className='mt-2 h-3 w-44' />
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-border bg-surface p-5 shadow-sm'>
        <Block className='h-3 w-36' />
        <Block className='mt-3 h-2 w-full' />
      </div>

      {[0, 1, 2].map(index => (
        <div key={index} className='rounded-2xl border border-border bg-surface p-4 shadow-sm'>
          <div className='flex items-start gap-3'>
            <Block className='h-10 w-10 rounded-full' />
            <div className='flex-1'>
              <Block className='h-5 w-48' />
              <Block className='mt-2 h-3 w-32' />
              <Block className='mt-4 h-3 w-full' />
              <Block className='mt-2 h-3 w-2/3' />
            </div>
          </div>
        </div>
      ))}

      <span className='sr-only'>Carregando a viagem…</span>
    </div>
  )
}
