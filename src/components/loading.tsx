import { cn } from '@/lib/utils'

export function Loading({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 ml-3 text-primary-foreground', className)}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0c4.418 0 8 3.582 8 8s-3.582 8-8 8v-4a4 4 0 00-4-4H4z'
      ></path>
    </svg>
  )
}
