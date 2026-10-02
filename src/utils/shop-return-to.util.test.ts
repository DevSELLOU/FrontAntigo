import { describe, expect, it } from 'vitest'
import { buildShopSignInHref, resolveShopReturnTo } from './shop-return-to.util'

const LOJA = 'Alfa Soluções'
const HOME = '/shop/Alfa%20Solu%C3%A7%C3%B5es'

describe('buildShopSignInHref', () => {
  it('aponta para o login da loja quando não há destino', () => {
    expect(buildShopSignInHref(LOJA)).toBe(`${HOME}/sign-in`)
  })

  it('carrega o destino codificado', () => {
    expect(buildShopSignInHref(LOJA, `${HOME}/product/42`)).toBe(
      `${HOME}/sign-in?returnTo=%2Fshop%2FAlfa%2520Solu%25C3%25A7%25C3%25B5es%2Fproduct%2F42`
    )
  })
})

describe('resolveShopReturnTo', () => {
  it('cai na home quando não há destino', () => {
    expect(resolveShopReturnTo(null, LOJA)).toBe(HOME)
    expect(resolveShopReturnTo(undefined, LOJA)).toBe(HOME)
    expect(resolveShopReturnTo('', LOJA)).toBe(HOME)
  })

  it('aceita um caminho dentro da loja atual', () => {
    expect(resolveShopReturnTo(`${HOME}/product/42`, LOJA)).toBe(`${HOME}/product/42`)
    expect(resolveShopReturnTo(`${HOME}/checkout`, LOJA)).toBe(`${HOME}/checkout`)
    expect(resolveShopReturnTo(HOME, LOJA)).toBe(HOME)
  })

  it('preserva a query, que é onde vivem filtro e ordenação', () => {
    const comFiltro = `${HOME}?category=3&sort=price-asc`
    expect(resolveShopReturnTo(comFiltro, LOJA)).toBe(comFiltro)
  })

  it('trata o valor como já decodificado, que é o que searchParams.get() entrega', () => {
    // Decodificar de novo aqui transformaria `%20` em espaço e o caminho deixaria de casar com a
    // própria loja — foi o que o teste da query pegou.
    expect(resolveShopReturnTo(encodeURIComponent(`${HOME}/product/42`), LOJA)).toBe(HOME)
  })

  describe('recusa redirecionamento aberto', () => {
    it('recusa URL absoluta', () => {
      expect(resolveShopReturnTo('https://exemplo.com', LOJA)).toBe(HOME)
      expect(resolveShopReturnTo('http://exemplo.com/phishing', LOJA)).toBe(HOME)
    })

    it('recusa protocolo-relativo, que o navegador trata como host externo', () => {
      expect(resolveShopReturnTo('//exemplo.com', LOJA)).toBe(HOME)
      expect(resolveShopReturnTo('//exemplo.com/login', LOJA)).toBe(HOME)
    })

    it('recusa barra invertida, que alguns navegadores normalizam para //', () => {
      expect(resolveShopReturnTo('/\\exemplo.com', LOJA)).toBe(HOME)
      expect(resolveShopReturnTo('/shop/Alfa\\..\\admin', LOJA)).toBe(HOME)
    })

    it('recusa esquemas que executam', () => {
      expect(resolveShopReturnTo('javascript:alert(1)', LOJA)).toBe(HOME)
      expect(resolveShopReturnTo('data:text/html,<script>alert(1)</script>', LOJA)).toBe(HOME)
    })

    it('recusa caminho de outra loja', () => {
      expect(resolveShopReturnTo('/shop/OutraLoja/product/1', LOJA)).toBe(HOME)
    })

    it('recusa um prefixo que apenas PARECE a loja atual', () => {
      expect(resolveShopReturnTo(`${HOME}-falsa/product/1`, LOJA)).toBe(HOME)
    })

    it('recusa caminho fora da loja', () => {
      expect(resolveShopReturnTo('/company/1/dashboard', LOJA)).toBe(HOME)
      expect(resolveShopReturnTo('/sign-in', LOJA)).toBe(HOME)
    })

    it('recusa lixo que não começa com barra', () => {
      expect(resolveShopReturnTo('%E0%A4%A', LOJA)).toBe(HOME)
      expect(resolveShopReturnTo('produto/42', LOJA)).toBe(HOME)
    })

    it('não volta para o próprio login, o que criaria laço', () => {
      expect(resolveShopReturnTo(`${HOME}/sign-in`, LOJA)).toBe(HOME)
    })
  })
})
