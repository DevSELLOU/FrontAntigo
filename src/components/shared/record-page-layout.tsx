import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'

interface RecordPageLayoutProps {
  backHref: string
  backLabel: string
  title: string
  status?: {
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    label: string
  }
  subtitle?: string
  actions?: Array<{
    label: string
    onClick?: () => void
    href?: string
    variant?: 'default' | 'secondary'
  }>
  mainContent: ReactNode
  asideContent: ReactNode
}

export function RecordPageLayout({
  backHref,
  backLabel,
  title,
  status,
  subtitle,
  actions = [],
  mainContent,
  asideContent
}: RecordPageLayoutProps) {
  return (
    <div className='space-y-6'>
      {/* Back link */}
      <Link
        href={backHref}
        className='inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 transition-colors font-label'
      >
        <ChevronLeft className='h-4 w-4' />
        {backLabel}
      </Link>

      {/* Header with title, status, and actions */}
      <div className='space-y-4 md:flex md:items-start md:justify-between md:space-y-0'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3 flex-wrap'>
            <h1 className='text-h1 text-text'>{title}</h1>
            {status && <StatusBadge variant={status.variant}>{status.label}</StatusBadge>}
          </div>
          {subtitle && <p className='text-body text-text-muted'>{subtitle}</p>}
        </div>

        <div className='flex gap-2 flex-wrap md:flex-nowrap md:ml-auto'>
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'secondary'}
              onClick={action.onClick}
              {...(action.href && { href: action.href, asChild: true })}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main content + Aside */}
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-6'>{mainContent}</div>
        <div className='space-y-6'>{asideContent}</div>
      </div>
    </div>
  )
}

/* RecordCard component */
interface RecordCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  icon?: ReactNode
  featured?: boolean
}

export function RecordCard({ title, subtitle, children, icon, featured = false }: RecordCardProps) {
  return (
    <div
      className={`rounded-lg border p-6 space-y-4 ${
        featured
          ? 'border-brand-100 bg-brand-050'
          : 'border-border bg-surface shadow-card'
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <h2 className='text-h3 text-text font-semibold'>{title}</h2>
          {subtitle && <p className='text-caption text-text-muted'>{subtitle}</p>}
        </div>
        {icon && <div className='flex h-8 w-8 items-center justify-center rounded-md bg-brand-050 text-brand-700'>{icon}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

/* Info Grid component */
interface InfoGridProps {
  children: React.ReactNode
}

export function InfoGrid({ children }: InfoGridProps) {
  return <div className='space-y-3 divide-y divide-border'>{children}</div>
}

interface InfoRowProps {
  label: string
  children: ReactNode
  sub?: ReactNode
}

export function InfoRow({ label, children, sub }: InfoRowProps) {
  return (
    <div className='pt-3 first:pt-0 space-y-1'>
      <p className='text-caption font-label text-text-muted'>{label}</p>
      <p className='text-body text-text font-medium'>{children}</p>
      {sub && <p className='text-caption text-text-muted'>{sub}</p>}
    </div>
  )
}

/* Metric List component */
interface MetricListProps {
  children: React.ReactNode
}

export function MetricList({ children }: MetricListProps) {
  return <div className='space-y-3'>{children}</div>
}

interface MetricRowProps {
  label: string
  value: ReactNode
}

export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-body text-text-muted'>{label}</span>
      <span className='text-body font-medium text-text'>{value}</span>
    </div>
  )
}
