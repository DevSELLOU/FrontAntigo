export function removeNonNumericChars(value: string): string {
  return value.replace(/\D/g, '')
}
