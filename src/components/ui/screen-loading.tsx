import { Loading } from '../loading'

/**
 * A primeira tela de toda visita — inclusive na loja, enquanto os dados da empresa carregam.
 *
 * Era `bg-gray-50` com um spinner `text-green-950`: cinza e verde Sellou, fixos, justamente no
 * instante em que o visitante ainda não sabe em que loja está. Numa loja laranja ou azul, a
 * promessa de white-label quebrava antes do primeiro produto aparecer — e no modo escuro o fundo
 * cinza-claro virava uma mancha.
 *
 * `bg-app` acompanha o tema; `text-primary` resolve `var(--custom-color)`, que o layout da loja
 * já semeia com a cor do lojista antes de renderizar.
 */
export const ScreenLoading = () => {
  return (
    <div className='flex h-screen items-center justify-center bg-app'>
      <Loading className='text-primary' />
    </div>
  )
}
