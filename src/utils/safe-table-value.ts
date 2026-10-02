export function safeTableValue(value: string | undefined, fallback: string = '-'): string {
  return value ?? fallback
}
