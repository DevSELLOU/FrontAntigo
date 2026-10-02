/**
 * Initials for the avatar chip: first letter of the first name plus the first letter of the last
 * one. A single-word name yields a single letter, and a missing name yields `?` — an empty circle
 * reads as a broken avatar rather than as "unknown user".
 *
 * Lives here (instead of inline in the topbar) because the profile screen draws the same chip and
 * the two must never disagree about how a name is abbreviated.
 */
export function getUserInitials(name?: string | null): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'

  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''

  return (first + last).toUpperCase()
}
