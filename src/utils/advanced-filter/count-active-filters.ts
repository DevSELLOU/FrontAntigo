interface CountActiveFiltersOptions {
  /**
   * Condition keys that must not light the badge, because the screen already surfaces them in a
   * control of their own. Customers uses it for `status`: the status capsule writes into the same
   * `filters` param, and without this switching tabs would make the filter button look active.
   */
  exclude?: string[]
}

/**
 * Counts active `AdvancedFilter` conditions from the `filters` URL param, for listing screens
 * with no dedicated year/month filters (Orders has its own variant that excludes those — see
 * `orders/index.tsx`). Used to drive the badge count on `ListingPageHeader`'s filter button.
 */
export function countActiveFilters(searchParams: URLSearchParams, options?: CountActiveFiltersOptions): number {
  const filtersParam = searchParams.get('filters')
  if (!filtersParam) return 0

  try {
    const parsed = JSON.parse(filtersParam)
    const keys = Object.keys(parsed)
    const exclude = options?.exclude
    if (!exclude?.length) return keys.length

    return keys.filter(key => !exclude.includes(key)).length
  } catch {
    return 0
  }
}
