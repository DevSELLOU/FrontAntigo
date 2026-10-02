export function getForegroundColor(hex: string) {
  hex = hex?.replace('#', '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  } else if (hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split('')
      .map(char => char + char)
      .join('')
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6)
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const a = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  const luminance = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

  return luminance >= 0.42 ? '#000000' : '#FFFFFF'
}
