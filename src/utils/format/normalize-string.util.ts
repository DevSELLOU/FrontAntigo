/**
 * Normaliza uma string removendo diacríticos (acentos) e convertendo para letras minúsculas.
 *
 * @param {string} input - A string a ser normalizada.
 * @returns {string} A string normalizada.
 *
 * @example
 * normalizeString('CAFÉ')  // retorna 'cafe'
 */
export function normalizeString(input?: string) {
  if (!input) {
    return ''
  }

  const str = String(input)

  return str
    .normalize('NFD')
    .replace(/[\u002E\u002C\u002D]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
