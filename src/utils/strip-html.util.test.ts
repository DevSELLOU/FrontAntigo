import { describe, expect, it } from 'vitest'
import { stripHtml } from './strip-html.util'

describe('stripHtml', () => {
  it('returns an empty string for empty input', () => {
    expect(stripHtml(undefined)).toBe('')
    expect(stripHtml(null)).toBe('')
    expect(stripHtml('')).toBe('')
  })

  it('unwraps the single paragraph TipTap produces', () => {
    expect(stripHtml('<p>Cuba de apoio Daytona</p>')).toBe('Cuba de apoio Daytona')
  })

  it('joins block elements with a space instead of gluing the words together', () => {
    expect(stripHtml('<p>Disco de corte</p><p>125mm</p>')).toBe('Disco de corte 125mm')
    expect(stripHtml('<ul><li>Item A</li><li>Item B</li></ul>')).toBe('Item A Item B')
  })

  it('keeps text that carries inline markup', () => {
    expect(stripHtml('<p>Exaustor <strong>silencioso</strong> 220v</p>')).toBe('Exaustor silencioso 220v')
  })

  it('decodes the entities the editor writes', () => {
    expect(stripHtml('<p>Cuba&nbsp;de apoio</p>')).toBe('Cuba de apoio')
    expect(stripHtml('<p>Ferro &amp; A&ccedil;o</p>')).toBe('Ferro & A o')
    expect(stripHtml('<p>Bra&#231;adeira 3&quot;</p>')).toBe('Bra adeira 3"')
  })

  it('collapses the whitespace left behind by the markup', () => {
    expect(stripHtml('<p>  Disco  </p>\n<p>  de corte  </p>')).toBe('Disco de corte')
  })

  it('drops script and style bodies instead of printing their source', () => {
    expect(stripHtml('<p>Produto</p><script>alert(1)</script>')).toBe('Produto')
    expect(stripHtml('<style>.a{color:red}</style><p>Produto</p>')).toBe('Produto')
  })

  it('passes plain text through untouched', () => {
    expect(stripHtml('CUBA DE APOIO ORLANDO')).toBe('CUBA DE APOIO ORLANDO')
  })
})
