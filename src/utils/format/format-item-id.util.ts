export function formatItemId(id: number): string {
  return id?.toString()?.padStart(4, '0')
}
