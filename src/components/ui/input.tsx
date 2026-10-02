import * as React from 'react'

import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'

export const inputVariants = cva(
  'flex items-center h-12 md:h-9 w-full text-base md:text-sm rounded-md border border-border bg-surface px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed placeholder:text-base md:placeholder:text-sm disabled:opacity-50 normal-case',

  {
    variants: {
      rounded: {
        none: 'rounded-none',
        md: 'rounded-md'
      },
      variant: {
        outline:
          'border-border focus-within:border-primary focus-within:shadow-[0_0px_0px_1px_var(--custom-color,var(--action))] aria-invalid:border-transparent',
        filled: 'border-2 bg-background focus-within:border-primary focus-within:bg-transparent',
        underlined:
          'rounded-none border-b-border focus-within:border-b-primary focus-within:shadow-[0_1px_0px_0px_var(--custom-color,var(--action))]',
        unstyled: ''
      }
    },
    defaultVariants: {
      rounded: 'md',
      variant: 'outline'
    }
  }
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, rounded, variant, startContent, endContent, ...props }, ref) => {
    return (
      <div className={cn(inputVariants({ variant, rounded, className }), className)}>
        {startContent && (
          <span className='pointer-events-none flex items-center text-muted-foreground'>{startContent}</span>
        )}
        <input
          ref={ref}
          {...props}
          className={cn('w-full bg-transparent outline-none focus-visible:outline-none', {
            'pl-1.5': !!startContent,
            'pr-1.5': !!endContent
          })}
        />
        {endContent && (
          <span className='pointer-events-none flex items-center text-muted-foreground'>{endContent}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
