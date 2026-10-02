const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'"
}

/**
 * Turns the TipTap HTML stored in `Product.description` into plain text.
 *
 * The product detail page renders that HTML for real (`parse(DOMPurify.sanitize(...))`), but the
 * card in the grid only has room for a two-line preview — and printing the markup as a string is
 * what made `<p>Produto ...</p>` show up literally in the storefront.
 *
 * The result is always rendered into a text node, never into `dangerouslySetInnerHTML`, so this is
 * a formatting helper and not a sanitizer. Script/style bodies are dropped anyway, so their
 * contents don't leak into the preview text.
 */
export function stripHtml(value?: string | null): string {
  if (!value) return ''

  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, entity => NAMED_ENTITIES[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
