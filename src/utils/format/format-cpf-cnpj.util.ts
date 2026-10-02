export function formatCpfCnpj(value: string) {
  if (!value) return ''

  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '')

  // Formata como CPF (xxx.xxx.xxx-xx) se a quantidade de dígitos for <= 11
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14) // CPF com máscara tem no máximo 14 caracteres
  }

  // Formata como CNPJ (xx.xxx.xxx/xxxx-xx) se a quantidade de dígitos for > 11
  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18) // CNPJ com máscara tem no máximo 18 caracteres
}
