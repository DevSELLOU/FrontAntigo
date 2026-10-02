export function DashboardSkeleton() {
  return (
    <div className='space-y-6 animate-pulse'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='rounded-lg border border-border bg-surface-muted p-4 h-24' />
        ))}
      </div>
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className='rounded-lg border border-border bg-surface overflow-hidden'>
            <div className='px-4 py-3 border-b border-border'>
              <div className='h-4 w-40 bg-surface-muted rounded' />
            </div>
            <div className='p-4 space-y-3'>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className='h-3 bg-surface-muted rounded w-full' />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='rounded-lg border border-border bg-surface overflow-hidden'>
            <div className='px-4 py-3 border-b border-border'>
              <div className='h-4 w-32 bg-surface-muted rounded' />
            </div>
            <div className='p-4 space-y-3'>
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className='h-3 bg-surface-muted rounded w-3/4' />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
