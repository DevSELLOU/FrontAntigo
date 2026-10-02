'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  subtitle?: string
  children: ReactNode
  onClear?: () => void
  onApply?: () => void
}

export function FilterDrawer({
  open,
  onOpenChange,
  title = 'Filtrar',
  subtitle = 'Refine os resultados da lista.',
  children,
  onClear,
  onApply
}: FilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:w-96 flex flex-col'>
        <SheetHeader>
          <div>
            <SheetTitle className='text-h3'>{title}</SheetTitle>
            <p className='text-caption text-text-muted mt-1'>{subtitle}</p>
          </div>
        </SheetHeader>

        {/* Filter content — `flex-1 min-h-0` is what makes `overflow-y-auto` actually kick in:
            `SheetContent` is a fixed-height flex column, so this is the one child allowed to
            shrink and scroll instead of pushing the footer off-screen. Without both, a plain
            `overflow-y-auto` on an auto-height block never has a boundary to scroll against. */}
        <div className='flex-1 min-h-0 space-y-6 overflow-y-auto py-6'>{children}</div>

        {/* Footer actions — a normal flex child now, not `absolute`, so it never overlaps
            content and never floats off the bottom of a short viewport. */}
        {(onClear || onApply) && (
          <div className='-mx-6 -mb-6 flex gap-2 border-t border-border bg-surface px-6 py-4'>
            {onClear && (
              <Button variant='secondary' onClick={onClear} className='flex-1'>
                Limpar
              </Button>
            )}
            {onApply && (
              <Button onClick={onApply} className='flex-1'>
                Aplicar filtros
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* Filter Field component */
interface FilterFieldProps {
  label: string
  children: ReactNode
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className='space-y-2'>
      <label className='text-label text-text-body'>{label}</label>
      {children}
    </div>
  )
}
