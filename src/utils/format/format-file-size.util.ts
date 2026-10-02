// Human file size (ported from `_Sellou/packages/ui/.../tamanho-legivel.ts`).
//
// Scale of 1000, not 1024, on purpose: it's what Finder/File Explorer shows for the SAME file.
// A person comparing our number to the one they just saw on their own computer would see 1024
// report "7.6 MB" for the file their OS calls "8 MB" and conclude our math is wrong.
const KILO = 1000
const MEGA = 1000 * KILO

/** One decimal place only when it changes the reading: "8.4 MB" informs, "8.0 MB" just adds noise. */
function withOneDecimal(value: number, unit: string): string {
  const rounded = Math.round(value * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${text} ${unit}`
}

export function formatFileSize(bytes: number): string {
  if (bytes >= MEGA) return withOneDecimal(bytes / MEGA, 'MB')
  if (bytes >= KILO) return withOneDecimal(bytes / KILO, 'KB')
  return `${String(Math.max(1, Math.round(bytes)))} B`
}
