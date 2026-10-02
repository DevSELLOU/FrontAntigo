/** Formatting helpers shared by the representative's goals dashboard.
 *  Moved out of the page unchanged — the numbers they produce must not shift. */

export const GOAL_MONTH_NAMES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export const GOAL_MONTH_FULL_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

export const GOAL_TYPE_LABELS: Record<string, string> = {
  sales_value: 'Valor de vendas',
  active_clients: 'Clientes ativos',
  new_clients: 'Novos clientes',
  product_sales: 'Vendas de produtos'
}

export function formatGoalCurrency(value: number) {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
  return `R$ ${value.toFixed(0)}`
}

export function formatGoalValue(value: number, type: string) {
  if (type === 'sales_value' || type === 'product_sales') {
    return formatGoalCurrency(value)
  }
  return value.toLocaleString('pt-BR')
}

export function formatGoalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
