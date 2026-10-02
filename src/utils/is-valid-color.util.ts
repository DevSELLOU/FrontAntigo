export function isValidColor(color: string) {
  const hexRegex = /^[0-9A-Fa-f]{3,6}$/
  return hexRegex.test(color)
}
