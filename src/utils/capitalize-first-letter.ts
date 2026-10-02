/**
 * Capitaliza a primeira letra da string fornecida e retorna a string modificada.
 *
 * @param input - A string que terá sua primeira letra capitalizada.
 * @returns Retorna a string com a primeira letra em maiúscula e o restante inalterado.
 */
export function capitalizeFirstLetter(input: string): string {
  if (!input) return input

  return input.charAt(0).toUpperCase() + input.slice(1)
}
