import { cn } from '@/lib/utils'

export interface SegmentedTab<T extends string> {
  id: T
  label: string
}

interface SegmentedTabNavProps<T extends string> {
  tabs: SegmentedTab<T>[]
  currentTab: T
  /** Path the links point at; the tab itself always travels in the query string. */
  baseHref?: string
  /** Query param carrying the tab. */
  param?: string
  ariaLabel?: string
}

/**
 * Capsule tab bar of the card visual language (DESIGN.md §12), shared by the Company Dashboard and
 * the management hub. Navigation is real `<a href>` + query param — not client state — so a tab is
 * linkable, bookmarkable and survives a reload.
 */
export function SegmentedTabNav<T extends string>({
  tabs,
  currentTab,
  baseHref = '',
  param = 'tab',
  ariaLabel
}: SegmentedTabNavProps<T>) {
  return (
    // `min-h-[52px]` (44px touch target + the 4px×2 padding) has to sit on the `<nav>` itself,
    // not just its children: `overflow-x-auto` turns this flex item's automatic minimum size to
    // 0 (the flexbox "min-size:auto + overflow" rule), so without an explicit floor here it
    // collapses to near-nothing inside the page's `flex-col` column — the links were still in
    // the DOM with the right text, just squeezed into a few visible pixels.
    <nav
      aria-label={ariaLabel}
      className='flex min-h-[52px] gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1'
    >
      {tabs.map(tab => {
        const isActive = currentTab === tab.id
        return (
          <a
            key={tab.id}
            href={`${baseHref}?${param}=${tab.id}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'min-h-[44px] flex items-center rounded-xl px-4 py-2.5 text-label whitespace-nowrap transition-colors no-underline',
              isActive
                ? 'bg-[var(--glass-icon-bg)] text-[#008440] font-semibold'
                : 'text-text-muted hover:bg-surface-muted hover:text-text-body'
            )}
          >
            {tab.label}
          </a>
        )
      })}
    </nav>
  )
}
