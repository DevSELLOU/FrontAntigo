export function formatCnpj(value: string) {
  if (!value) return ''

  return value
    .replace(/\D/g, '') // Remove caracteres não numéricos
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18) // Limita a 18 caracteres (com máscara)
}
