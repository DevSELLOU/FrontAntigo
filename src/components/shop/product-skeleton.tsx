import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'

/**
 * Mirrors the real card in `product-grid.tsx` block for block — same image ratio, same paddings,
 * same grid and gap. The previous version drew one wide column with no image placeholder while the
 * grid renders two narrow columns with a square photo, so every search and filter ended in a
 * visible layout jump. `bg-border` is used for the bars because it is the one neutral that stays
 * legible in both themes; the old `bg-gray-300` turned into a bright white smear in dark mode.
 */
export function ProductSkeleton() {
  return (
    <Card className='flex flex-col overflow-hidden'>
      <CardHeader className='p-0'>
        <div className='aspect-square w-full animate-pulse bg-border' />
      </CardHeader>
      <CardContent className='flex-1 p-4'>
        <div className='mb-2 flex flex-wrap gap-2'>
          <div className='h-5 w-16 animate-pulse rounded bg-border' />
          <div className='h-5 w-20 animate-pulse rounded bg-border' />
        </div>
        <div className='mb-2 h-5 w-3/4 animate-pulse rounded bg-border' />
        <div className='mb-1 h-4 w-full animate-pulse rounded bg-border' />
        <div className='h-4 w-2/3 animate-pulse rounded bg-border' />
      </CardContent>
      <CardFooter className='p-2 pt-0'>
        <div className='w-full space-y-2'>
          <div className='mx-2 h-6 w-24 animate-pulse rounded bg-border' />
          <div className='h-11 w-full animate-pulse rounded bg-border' />
        </div>
      </CardFooter>
    </Card>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7'>
      {Array.from({ length: 14 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
