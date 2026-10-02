import type { Metadata } from 'next'

import { LegalDocument, LegalList, type LegalSection } from '@/components/legal/legal-document'

export const metadata: Metadata = {
  title: 'Termos de Uso | Sellou',
  description: 'Termos de Uso da plataforma Sellou'
}

const UPDATED_AT = '19 de agosto de 2026'

/**
 * The wording here is the one that already shipped — only the frame changed, so that the page the
 * Política de Privacidade links to does not look like it came from a different product. Rewriting
 * the terms themselves is a legal decision, not a design one.
 */
const sections: LegalSection[] = [
  {
    id: 'introducao',
    title: 'Introdução',
    body: (
      <p>
        Bem-vindo ao sistema da Sellou. Ao acessar e utilizar nossos serviços, você concorda com estes Termos de Uso.
        Caso não concorde, por favor, não utilize o sistema.
      </p>
    )
  },
  {
    id: 'uso-do-sistema',
    title: 'Uso do sistema',
    body: (
      <LegalList>
        <li>O acesso ao sistema é restrito a usuários autorizados.</li>
        <li>Você é responsável por manter a confidencialidade de suas credenciais.</li>
        <li>
          O uso do sistema para atividades ilegais, fraudulentas ou que violem direitos de terceiros é estritamente
          proibido.
        </li>
      </LegalList>
    )
  },
  {
    id: 'responsabilidades',
    title: 'Responsabilidades',
    body: (
      <LegalList>
        <li>A Sellou não se responsabiliza por danos decorrentes do mau uso do sistema.</li>
        <li>Nos reservamos o direito de suspender ou encerrar contas que violem estes termos.</li>
      </LegalList>
    )
  },
  {
    id: 'alteracoes',
    title: 'Alterações nos termos',
    body: (
      <p>
        Podemos atualizar estes Termos periodicamente. O uso contínuo do sistema após alterações indica sua concordância
        com os novos termos.
      </p>
    )
  },
  {
    id: 'contato',
    title: 'Contato',
    body: <p>Dúvidas ou sugestões? Entre em contato pelo nosso suporte.</p>
  }
]

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow='Sellou · Documentos legais'
      title='Termos de Uso'
      intro='As regras de uso da plataforma Sellou por quem acessa o sistema.'
      updatedAt={UPDATED_AT}
      sections={sections}
      related={{ href: '/privacy-policy', label: 'Ler a Política de Privacidade' }}
    />
  )
}
