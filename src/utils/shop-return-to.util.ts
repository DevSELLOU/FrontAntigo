/** Nome do parâmetro na URL de login da loja. */
export const RETURN_TO_PARAM = 'returnTo'

function shopRoot(fantasyName: string): string {
  return `/shop/${encodeURIComponent(fantasyName)}`
}

/**
 * Monta o link de login carregando de onde o visitante veio.
 *
 * Sem isso, quem clicava em "Adicionar ao carrinho" deslogado fazia login e reaparecia na home da
 * loja — sem o produto, sem o filtro e sem a posição de rolagem. É abandono no auge da intenção
 * de compra.
 */
export function buildShopSignInHref(fantasyName: string, currentPathWithQuery?: string): string {
  const signIn = `${shopRoot(fantasyName)}/sign-in`

  if (!currentPathWithQuery) return signIn

  return `${signIn}?${RETURN_TO_PARAM}=${encodeURIComponent(currentPathWithQuery)}`
}

/**
 * Resolve o `returnTo` para um destino seguro, ou cai na home da loja.
 *
 * Esta função é a fronteira de segurança: sem ela, `?returnTo=https://exemplo.com` transformaria o
 * login numa página de redirecionamento aberto — o clássico vetor de phishing, em que o link
 * hospedado no domínio legítimo do lojista despeja a vítima num site controlado pelo atacante.
 *
 * Por isso a validação é por lista de permissão, não por lista de bloqueio: só passa caminho
 * relativo que comprovadamente vive DENTRO da loja atual. Tudo o mais volta para a home.
 */
export function resolveShopReturnTo(returnTo: string | null | undefined, fantasyName: string): string {
  const home = shopRoot(fantasyName)

  if (!returnTo) return home

  // NÃO decodifica aqui: `useSearchParams().get()` já devolve o valor decodificado uma vez.
  // Decodificar de novo destruiria o `%20` e os acentos do próprio nome da loja no caminho — a
  // mesma armadilha de codificação dupla que quebrou o link "Voltar para os produtos".
  const candidate = returnTo.trim()

  // Precisa ser caminho relativo. Isto barra `https://`, `javascript:` e `data:` de uma vez.
  if (!candidate.startsWith('/')) return home

  // `//evil.com` é protocolo-relativo: o navegador trata como host externo. `/\evil.com` é a
  // mesma ideia com a barra invertida, que alguns navegadores normalizam para `//`.
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return home

  // Uma barra invertida em qualquer lugar não tem uso legítimo aqui e atrapalha a comparação.
  if (candidate.includes('\\')) return home

  const [pathOnly] = candidate.split(/[?#]/)

  // Tem de ser a loja ATUAL — não basta ser uma loja qualquer, senão o link leva o comprador para
  // a vitrine de outro lojista.
  if (pathOnly !== home && !pathOnly.startsWith(`${home}/`)) return home

  // Voltar para a própria tela de login criaria laço.
  if (pathOnly === `${home}/sign-in`) return home

  return candidate
}
