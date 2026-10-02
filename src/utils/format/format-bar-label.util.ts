interface FormatDashboardLabelProps {
  label: string | null | undefined
  isShortLabel?: boolean
}

export function formatDashboardLabel({ label, isShortLabel = true }: FormatDashboardLabelProps): string {
  if (!label) {
    return '-'
  }

  if (isShortLabel) {
    const labelLength = label.length
    const isLongLabel = labelLength > 15

    if (!isLongLabel) {
      return label
    }

    return label.slice(0, 15) + '...'
  }

  return label
}
