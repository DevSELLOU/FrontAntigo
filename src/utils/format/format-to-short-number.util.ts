export function formatToShortNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}
