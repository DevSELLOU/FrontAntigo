export default function OrderHistorySkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <div className='h-8 w-48 bg-muted rounded-md animate-pulse' />
        <div className='h-5 w-72 bg-muted rounded-md mt-2 animate-pulse' />
      </div>

      <div className='grid gap-4'>
        {[1, 2].map(index => (
          <div key={index} className='rounded-lg border bg-card'>
            <div className='p-6 pb-3'>
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <div className='h-5 w-24 bg-muted rounded-md animate-pulse' />
                  <div className='h-4 w-32 bg-muted rounded-md animate-pulse' />
                </div>
                <div className='h-6 w-24 bg-muted rounded-full animate-pulse' />
              </div>
            </div>

            <div className='p-6 pt-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 bg-muted rounded-md animate-pulse' />
                  <div className='h-4 w-16 bg-muted rounded-md animate-pulse' />
                </div>
                <div className='flex items-center gap-4'>
                  <div className='text-right space-y-1'>
                    <div className='h-4 w-8 bg-muted rounded-md animate-pulse' />
                    <div className='h-5 w-16 bg-muted rounded-md animate-pulse' />
                  </div>
                  <div className='h-8 w-8 bg-muted rounded-md animate-pulse' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
