export function formatPostalCode(value: string) {
  if (!value) return ''

  return value
    .replace(/\D/g, '') // Remove caracteres não numéricos
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9) // Limita a 9 caracteres (com máscara)
}
