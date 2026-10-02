import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface EditFormLayoutProps {
  mainContent: ReactNode
  asideContent?: ReactNode
  onCancel: () => void
  onSaveDraft?: () => void
  onSave: () => void
  isSaving?: boolean
}

export function EditFormLayout({
  mainContent,
  asideContent,
  onCancel,
  onSaveDraft,
  onSave,
  isSaving = false
}: EditFormLayoutProps) {
  return (
    <div className='space-y-6'>
      {/* Main content + Sticky aside */}
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-6'>{mainContent}</div>

        {asideContent && (
          <div className='lg:sticky lg:top-20 lg:h-fit space-y-6'>
            {asideContent}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className='flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:justify-end md:gap-2'>
        <Button variant='secondary' onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        {onSaveDraft && (
          <Button variant='secondary' onClick={onSaveDraft} disabled={isSaving}>
            Salvar rascunho
          </Button>
        )}
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}

/* Form Card component */
interface FormCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function FormCard({ title, subtitle, children }: FormCardProps) {
  return (
    <div className='rounded-lg border border-border bg-surface p-6 space-y-4'>
      <div>
        <h2 className='text-h3 text-text font-semibold'>{title}</h2>
        {subtitle && <p className='text-caption text-text-muted mt-1'>{subtitle}</p>}
      </div>
      <div className='space-y-4'>{children}</div>
    </div>
  )
}

/* Form Grid component */
interface FormGridProps {
  children: ReactNode
  columns?: 1 | 2
}

export function FormGrid({ children, columns = 2 }: FormGridProps) {
  return (
    <div
      className={`grid gap-4 ${columns === 2 ? 'md:grid-cols-2' : ''}`}
    >
      {children}
    </div>
  )
}

/* Form Field component */
interface FormFieldProps {
  label: string
  required?: boolean
  help?: string
  children: ReactNode
  span?: 1 | 2
}

export function FormField({ label, required, help, children, span = 1 }: FormFieldProps) {
  return (
    <div className={span === 2 ? 'md:col-span-2' : ''}>
      <label className='block text-label text-text-body mb-2'>
        {label}
        {required && <span className='text-danger-foreground'>*</span>}
      </label>
      {children}
      {help && <p className='text-caption text-text-muted mt-1'>{help}</p>}
    </div>
  )
}
