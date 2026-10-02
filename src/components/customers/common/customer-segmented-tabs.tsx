'use client'

import { cn } from '@/lib/utils'

// DEBT: this is the third copy of the pill-shaped tab strip. `dashboard/dashboard-tab-nav.tsx`
// navigates by href, this one is controlled state, and a generic `shared/segmented-tab-nav.tsx`
// is being introduced in parallel by the Management migration. The classes below were copied
// character for character from `dashboard-tab-nav.tsx` precisely so that consolidating the three
// into one component, once both branches are merged, is a mechanical diff and not a redesign.
// Consolidate then — not before, or the two branches collide on the same file.

export interface SegmentedTabItem<TValue extends string> {
  value: TValue
  label: string
  /** Omitted (or `null`) renders no number at all — used when a count failed to load. */
  count?: number | null
}

interface CustomerSegmentedTabsProps<TValue extends string> {
  items: SegmentedTabItem<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  ariaLabel: string
}

export function CustomerSegmentedTabs<TValue extends string>({
  items,
  value,
  onChange,
  ariaLabel
}: CustomerSegmentedTabsProps<TValue>) {
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
      {items.map(item => {
        const isActive = value === item.value
        return (
          <button
            key={item.value}
            type='button'
            onClick={() => onChange(item.value)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'min-h-[44px] flex items-center gap-2 rounded-xl px-4 py-2.5 text-label whitespace-nowrap transition-colors no-underline',
              isActive
                ? 'bg-[var(--glass-icon-bg)] text-[#008440] font-semibold'
                : 'text-text-muted hover:bg-surface-muted hover:text-text-body'
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-caption tabular-nums',
                  isActive ? 'bg-[#008440] text-white' : 'bg-surface-muted text-text-muted'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
