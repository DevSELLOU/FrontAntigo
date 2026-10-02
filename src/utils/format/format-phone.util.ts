export function formatPhoneNumber(value: string) {
  return value
    .replace(/\D/g, '') // Remove caracteres não numéricos
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15) // Limita a 15 caracteres (com máscara)
}
