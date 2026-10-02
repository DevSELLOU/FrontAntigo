'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface RowActionButtonProps {
  label: string
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function RowActionButton({ label, onClick, children, className, disabled }: RowActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={onClick}
          aria-label={label}
          disabled={disabled}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text transition-colors disabled:opacity-40 disabled:pointer-events-none',
            className
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
