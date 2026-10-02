export interface CreditLimitUsage {
  total: number
  used: number
  /** Share of the limit already consumed, clamped to 0–100 so the progress bar can't overflow. */
  percent: number
}

/** `creditLimit`/`creditLimitUsed` arrive from the API as decimal strings, not numbers. */
interface CreditLimitSource {
  creditLimit?: string | number | null
  creditLimitUsed?: string | number | null
}

function toAmount(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (!value) return 0

  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Credit limit usage for a customer, shared by the card and the table so both show the same
 * number. The clamp matters: `creditLimitUsed` can exceed `creditLimit` in real data (a customer
 * who blew past the limit), and the raw ratio used to render a bar wider than its container.
 */
export function getCreditLimitUsage(customer: CreditLimitSource | null | undefined): CreditLimitUsage {
  const total = toAmount(customer?.creditLimit)
  const used = toAmount(customer?.creditLimitUsed)

  if (total <= 0) return { total, used, percent: 0 }

  const percent = (used / total) * 100

  return { total, used, percent: Math.min(100, Math.max(0, percent)) }
}
