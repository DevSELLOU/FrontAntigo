/**
 * Utility functions for timezone-safe date handling.
 * Use these for DATEONLY fields to avoid GMT shifts in negative timezones.
 */

/**
 * Extracts the YYYY-MM-DD portion from any date string.
 * Handles plain dates ("2024-06-15") and ISO strings ("2024-06-15T00:00:00.000Z").
 */
export function extractDatePart(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return dateStr
  return `${match[1]}-${match[2]}-${match[3]}`
}

/**
 * Parses a DATEONLY string into a local Date at midnight.
 * Never use `new Date("YYYY-MM-DD")` directly — it interprets the input as UTC.
 */
export function parseDateOnly(dateStr: string): Date {
  const normalized = extractDatePart(dateStr)
  const [year, month, day] = normalized.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Formats a DATEONLY string for display in pt-BR (e.g. "15 de junho de 2024").
 */
export function formatDateOnly(dateStr?: string): string {
  if (!dateStr) return 'Sem data'
  const date = parseDateOnly(dateStr)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formats a full ISO datetime string for display in pt-BR (e.g. "15/06/2024, 14:30").
 */
export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
