export function formatCurrency(value: number) {
  return Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}
