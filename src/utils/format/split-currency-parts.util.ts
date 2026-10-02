import { formatCurrency } from './format-currency'

export interface CurrencyParts {
  pre: string
  main: string
  frac: string
}

/**
 * Splits a formatted currency value into its symbol, integer and cents parts
 * so callers can style the cents smaller/lighter than the integer amount.
 */
export function splitCurrencyParts(value: number): CurrencyParts {
  const formatted = formatCurrency(value)
  const match = formatted.match(/^(\D+)\s*([\d.]+),(\d{2})$/)

  if (!match) return { pre: '', main: formatted, frac: '' }

  const [, pre, main, frac] = match
  return { pre: pre.trim(), main, frac: `,${frac}` }
}
