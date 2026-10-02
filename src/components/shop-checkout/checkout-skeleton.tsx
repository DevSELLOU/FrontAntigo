'use client'

export function CheckoutSkeleton() {
  return (
    <div className='w-full p-5 lg:px-20 space-y-8'>
      <div className='h-10 w-40 rounded bg-border animate-pulse' />
      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='space-y-4'>
          <div className='h-8 w-48 rounded bg-border animate-pulse' />
          <div className='space-y-4'>
            {[1, 2].map(i => (
              <div key={i} className='flex gap-4'>
                <div className='h-20 w-20 rounded bg-border animate-pulse' />
                <div className='space-y-2 flex-1'>
                  <div className='h-4 w-3/4 rounded bg-border animate-pulse' />
                  <div className='h-4 w-1/4 rounded bg-border animate-pulse' />
                  <div className='h-4 w-1/2 rounded bg-border animate-pulse' />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='space-y-4'>
          <div className='h-8 w-48 rounded bg-border animate-pulse' />
          <div className='h-[200px] w-full rounded bg-border animate-pulse' />
          <div className='h-10 w-full rounded bg-border animate-pulse' />
        </div>
      </div>
    </div>
  )
}
