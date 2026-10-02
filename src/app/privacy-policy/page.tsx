import type { Metadata } from 'next'

import {
  LegalDocument,
  LegalItem,
  LegalList,
  ToDefine,
  type LegalSection
} from '@/components/legal/legal-document'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Sellou',
  description:
    'Como a Sellou trata dados pessoais na plataforma de gestão comercial, à luz da Lei Geral de Proteção de Dados (Lei 13.709/2018).'
}

const UPDATED_AT = '19 de agosto de 2026'

/**
 * Draft. Written from what the codebase actually does — nothing here asserts a certification, an
 * encryption algorithm, a retention window or a subprocessor that could not be confirmed in the
 * repository. Everything that could not be confirmed is a visible `[A DEFINIR: …]` marker instead
 * of a comfortable sentence, and the page carries a banner saying so.
 *
 * It has not been reviewed by a lawyer.
 */
const sections: LegalSection[] = [
  {
    id: 'quem-somos',
    title: 'Quem somos e o que esta política cobre',
    body: (
      <>
        <p>
          A Sellou é uma plataforma de gestão comercial contratada por empresas para organizar produtos, pedidos,
          clientes, metas, rotas de visita e a loja virtual que cada uma dessas empresas oferece aos seus próprios
          compradores.
        </p>
        <p>
          Esta política explica como tratamos dados pessoais na plataforma acessada em <strong>app.sellou.com.br</strong>{' '}
          e nas lojas virtuais hospedadas nela (endereços que começam com <code>/shop/</code>). Ela vale para três
          grupos de pessoas: quem usa a plataforma a trabalho (administradores, gestores e representantes das empresas
          contratantes), quem compra pela loja virtual de uma dessas empresas, e as pessoas de contato cujos dados uma
          empresa contratante cadastra na plataforma.
        </p>
        <p>
          Responsável pela plataforma: <ToDefine>razão social, CNPJ e endereço completo da Sellou</ToDefine>.
        </p>
      </>
    )
  },
  {
    id: 'papeis',
    title: 'Controladora ou operadora: por que a diferença importa aqui',
    body: (
      <>
        <p>
          A Sellou é uma plataforma multiempresa: cada empresa contratante tem o seu próprio espaço, e uma não enxerga
          os dados da outra. Por causa disso, o nosso papel perante a LGPD muda conforme o dado, e isso muda também a
          quem você deve pedir alguma coisa.
        </p>

        <LegalItem term='A Sellou é controladora'>
          <p>
            Dos dados de quem opera a plataforma: nome, e-mail, cargo, perfil de acesso e registros de uso das pessoas
            das empresas contratantes, além dos dados necessários para manter o contrato e a conta funcionando. Aqui
            somos nós que decidimos as finalidades, e é a nós que você pede.
          </p>
        </LegalItem>

        <LegalItem term='A Sellou é operadora'>
          <p>
            Dos dados que a empresa contratante insere na plataforma sobre <em>os clientes dela</em> — compradores,
            contatos comerciais, endereços, documentos, histórico de pedidos e de visitas. Quem decide coletar esses
            dados, para quê e por quanto tempo é a empresa contratante: ela é a controladora, e nós tratamos os dados
            seguindo as instruções dela.
          </p>
        </LegalItem>

        <p>
          <strong>Consequência prática:</strong> se os seus dados estão na Sellou porque uma empresa que usa a
          plataforma os cadastrou, o pedido de acesso, correção ou eliminação deve ser dirigido a essa empresa. Se você
          nos procurar primeiro, encaminhamos o pedido a ela e damos o suporte técnico necessário — o que não podemos
          fazer é decidir sozinhos sobre dados que não são nossos.
        </p>
        <p>
          O acesso na plataforma é sempre verificado contra a empresa e o perfil da pessoa que está pedindo, tanto no
          navegador quanto no servidor. É esse controle que mantém os espaços das empresas separados.
        </p>
      </>
    )
  },
  {
    id: 'dados',
    title: 'Quais dados tratamos',
    body: (
      <>
        <p>Reunimos abaixo tudo o que a plataforma coleta, agrupado por origem.</p>

        <LegalItem term='Cadastro e acesso de quem usa a plataforma'>
          <p>
            Nome, e-mail, senha, cargo, perfil de acesso, situação da conta, data de criação e as empresas às quais a
            pessoa está vinculada.
          </p>
          <p>
            <ToDefine>
              confirmar com a equipe técnica como as senhas são armazenadas antes de descrever o método aqui
            </ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Clientes e contatos cadastrados pela empresa contratante'>
          <p>
            Razão social e nome fantasia, CNPJ ou CPF, inscrição estadual, endereços de cobrança e de entrega, CEP,
            cidade e estado, e-mails, telefones, nome da pessoa de contato, limite de crédito, condições e métodos de
            pagamento, observações e os representantes responsáveis. Esses dados podem ser digitados um a um ou
            importados em massa por arquivo (CSV) pela própria empresa.
          </p>
        </LegalItem>

        <LegalItem term='Compradores da loja virtual'>
          <p>
            Na solicitação de acesso: nome completo, nome da empresa, e-mail, telefone e CNPJ. Depois de aprovado o
            acesso: nome, e-mail, senha e o histórico dos pedidos feitos na loja.
          </p>
        </LegalItem>

        <LegalItem term='Registros de atividade na plataforma'>
          <p>
            Pedidos e orçamentos, metas, rotas e visitas. O registro de uma visita guarda quem a realizou, qual cliente
            foi visitado, data e hora, observações e a marcação de que a visita ocorreu fora da rota planejada.
          </p>
          <p>
            A plataforma exibe coordenadas de latitude e longitude de uma visita quando esse dado existe no registro. O
            aplicativo web não pede a localização do seu dispositivo — a permissão de geolocalização está bloqueada na
            própria configuração do site.{' '}
            <ToDefine>
              confirmar com a equipe de back-end se coordenadas de visita são de fato coletadas, por qual meio, com que
              finalidade e por quanto tempo — se forem, esta seção precisa descrever isso, e a empresa contratante
              precisa informar os representantes
            </ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Dados técnicos da conexão'>
          <p>
            Como em qualquer serviço acessado pela internet, o servidor que entrega a plataforma recebe o endereço IP e
            informações do navegador a cada requisição.{' '}
            <ToDefine>confirmar se os registros de acesso com IP são guardados e por quanto tempo</ToDefine>
          </p>
        </LegalItem>

        <p className='text-[15px] leading-[1.6] text-text-muted'>
          <strong className='text-text-body'>O que a plataforma não coleta:</strong> não pedimos nem processamos dados
          de cartão de crédito ou qualquer meio de pagamento — a finalização do pedido na loja virtual registra a
          condição e o método de pagamento combinados entre comprador e empresa, e a cobrança acontece fora da
          plataforma. Também não pedimos data de nascimento, documentos de identidade digitalizados nem acesso à câmera,
          ao microfone ou à localização do seu dispositivo.
        </p>
      </>
    )
  },
  {
    id: 'cookies',
    title: 'Cookies e dados guardados no seu dispositivo',
    body: (
      <>
        <p>
          A plataforma usa apenas o que é necessário para funcionar. <strong>Não usamos cookies de publicidade, de
          redes sociais nem de perfilamento comportamental</strong>, e por isso não existe um banner de consentimento de
          cookies: não há nada opcional para você aceitar ou recusar.
        </p>

        <LegalItem term='Cookies de sessão'>
          <p>
            <code>next-auth.session-token</code> mantém você autenticado na plataforma e expira em 24 horas.
          </p>
          <p>
            <code>accessToken</code> é o token usado nas chamadas ao nosso servidor. Ao trocar de empresa dentro da
            plataforma, ele é regravado com validade de 7 dias.
          </p>
        </LegalItem>

        <LegalItem term='Armazenamento local do navegador'>
          <p>
            Na loja virtual, guardamos no seu navegador o token de acesso e os seus dados de conta enquanto você estiver
            logado, além do conteúdo do carrinho de compras.
          </p>
          <p>
            Na plataforma, guardamos preferências de interface — tema claro ou escuro, colunas visíveis nas tabelas e
            modo de visualização das listas. Nada disso é enviado a terceiros.
          </p>
        </LegalItem>

        <LegalItem term='Vídeos de produto'>
          <p>
            Quando uma empresa cadastra um vídeo em um produto, o player é carregado do serviço de origem. Para o
            YouTube usamos o domínio <code>youtube-nocookie.com</code>, que não grava cookies de publicidade. Vídeos do
            Vimeo e do Google Drive seguem as políticas desses serviços a partir do momento em que você dá play.
          </p>
        </LegalItem>
      </>
    )
  },
  {
    id: 'finalidades',
    title: 'Para que usamos os dados e com que base legal',
    body: (
      <>
        <p>
          A LGPD exige que todo tratamento tenha uma hipótese do artigo 7º que o autorize. Estas são as nossas, por
          finalidade.
        </p>

        <LegalItem term='Criar contas, autenticar e dar acesso à plataforma'>
          <p>
            Execução do contrato firmado com a empresa contratante e, quanto à pessoa que usa a plataforma, legítimo
            interesse na operação do serviço (art. 7º, V e IX).
          </p>
        </LegalItem>

        <LegalItem term='Prestar o serviço contratado: cadastros, pedidos, rotas, metas e relatórios'>
          <p>
            Aqui a Sellou atua como operadora. A base legal desse tratamento é definida pela empresa contratante, que é
            a controladora dos dados dos clientes dela (art. 39).
          </p>
        </LegalItem>

        <LegalItem term='Enviar comunicações operacionais, como a recuperação de senha'>
          <p>Execução de contrato (art. 7º, V).</p>
        </LegalItem>

        <LegalItem term='Manter a segurança da plataforma e registros de acesso'>
          <p>
            Legítimo interesse (art. 7º, IX) e cumprimento de obrigação legal quanto aos registros de acesso a aplicação
            previstos no art. 15 da Lei 12.965/2014 (Marco Civil da Internet).{' '}
            <ToDefine>confirmar se esses registros são efetivamente mantidos e por qual prazo</ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Medir o uso das páginas de forma agregada'>
          <p>Legítimo interesse (art. 7º, IX). Veja o item sobre a Vercel na seção de compartilhamento.</p>
        </LegalItem>

        <LegalItem term='Cumprir obrigações legais e defender direitos'>
          <p>
            Cumprimento de obrigação legal ou regulatória (art. 7º, II) e exercício regular de direitos em processo
            (art. 7º, VI).
          </p>
        </LegalItem>

        <p>
          Nenhuma das finalidades acima se apoia no seu consentimento. Se em algum momento passarmos a tratar dados para
          uma finalidade que exija consentimento, ele será pedido de forma destacada e separada, e você poderá
          revogá-lo.
        </p>
      </>
    )
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    body: (
      <>
        <p>
          <strong>Não vendemos dados pessoais e não os cedemos para publicidade.</strong> Compartilhamos apenas com
          fornecedores que executam parte do serviço em nosso nome, e apenas o necessário para isso.
        </p>

        <LegalItem term='Wasabi Technologies — armazenamento de imagens'>
          <p>
            As imagens enviadas à plataforma (fotos de produto, logotipo e capa da loja) ficam guardadas na Wasabi, um
            serviço de armazenamento em nuvem, no repositório <code>sellou-images</code>. Essas imagens não são
            públicas: cada visualização usa um link assinado que expira em cerca de uma hora.
          </p>
          <p>
            <ToDefine>região e país do centro de dados Wasabi utilizado</ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Vercel — medição de uso das páginas'>
          <p>
            A plataforma usa o Vercel Analytics para medir acessos às páginas. Hoje, quando alguém faz login — tanto na
            plataforma quanto na loja virtual —, o endereço de e-mail informado é enviado junto ao evento de login para
            esse serviço.
          </p>
          <p>
            <ToDefine>
              decidir se esse envio do e-mail será mantido; se for removido do produto, apagar esta frase — se for
              mantido, ele precisa constar aqui e no contrato com a empresa contratante
            </ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Hospedagem da aplicação e do banco de dados'>
          <p>
            <ToDefine>nome, país e região do provedor onde rodam o servidor da aplicação e o banco de dados</ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Envio de e-mails transacionais'>
          <p>
            Usamos um serviço de envio de e-mail para mensagens como a recuperação de senha.{' '}
            <ToDefine>nome e país do provedor de envio de e-mail</ToDefine>
          </p>
        </LegalItem>

        <LegalItem term='Serviços de vídeo'>
          <p>
            Google (YouTube), Vimeo e Google Drive, somente quando uma empresa cadastra um vídeo em um produto e apenas
            no momento em que alguém o reproduz.
          </p>
        </LegalItem>

        <p>
          <strong>Inteligência artificial:</strong> até a data desta política, a plataforma não envia dados pessoais a
          serviços de inteligência artificial de terceiros. Se isso mudar, atualizaremos esta seção antes de a mudança
          entrar em operação.{' '}
          <ToDefine>confirmar com a equipe de back-end que nenhum serviço de IA recebe dados hoje</ToDefine>
        </p>

        <p>
          Também podemos compartilhar dados com autoridades públicas quando houver obrigação legal ou ordem judicial, e
          com advogados e auditores no exercício regular de direitos. Em caso de reorganização societária, os dados
          podem ser transferidos ao sucessor, mantidas as condições desta política.
        </p>
      </>
    )
  },
  {
    id: 'transferencia-internacional',
    title: 'Transferência internacional de dados',
    body: (
      <>
        <p>
          Parte dos fornecedores acima é sediada fora do Brasil, o que caracteriza transferência internacional nos
          termos do art. 33 da LGPD:
        </p>

        <LegalList>
          <li>
            <strong>Wasabi Technologies</strong> (Estados Unidos) — imagens enviadas à plataforma.{' '}
            <ToDefine>região do centro de dados</ToDefine>
          </li>
          <li>
            <strong>Vercel Inc.</strong> (Estados Unidos) — medição de uso das páginas.
          </li>
        </LegalList>

        <p>
          <ToDefine>
            indicar qual hipótese do art. 33 ampara cada transferência e anexar as garantias contratuais correspondentes
            (por exemplo, cláusulas contratuais padrão)
          </ToDefine>
        </p>
      </>
    )
  },
  {
    id: 'retencao',
    title: 'Por quanto tempo guardamos',
    body: (
      <>
        <p>
          Os dados de uma empresa contratante e das pessoas ligadas a ela são mantidos enquanto o contrato estiver
          vigente e a conta existir. Depois disso, podem ser mantidos pelo prazo necessário ao cumprimento de obrigações
          legais e à defesa de direitos.
        </p>

        <p>Prazos técnicos que já são fixos hoje:</p>

        <LegalList>
          <li>sessão de login na plataforma: 24 horas;</li>
          <li>token regravado ao trocar de empresa: 7 dias;</li>
          <li>link de visualização de imagem: cerca de 1 hora.</li>
        </LegalList>

        <p>
          Sendo direto sobre o estado atual: a plataforma trabalha hoje principalmente com a{' '}
          <em>inativação</em> de cadastros, não com a eliminação automática de registros. A eliminação definitiva é
          feita mediante solicitação e avaliação caso a caso, e não temos um processo automático com prazo garantido.
          Preferimos dizer isso a prometer um prazo que o produto não cumpre.
        </p>

        <p>
          <ToDefine>
            definir o prazo de retenção após o encerramento do contrato e a política de descarte ou anonimização, e
            descrevê-los aqui
          </ToDefine>
        </p>
      </>
    )
  },
  {
    id: 'direitos',
    title: 'Seus direitos e como exercê-los',
    body: (
      <>
        <p>O artigo 18 da LGPD garante a você, a qualquer momento e sem custo, o direito de pedir:</p>

        <LegalList>
          <li>confirmação de que tratamos dados seus;</li>
          <li>acesso aos dados;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados fora da lei;</li>
          <li>portabilidade a outro fornecedor, observados os segredos comercial e industrial;</li>
          <li>eliminação dos dados tratados com base no seu consentimento;</li>
          <li>informação sobre com quem compartilhamos os seus dados;</li>
          <li>informação sobre a possibilidade de não consentir e sobre as consequências disso;</li>
          <li>revogação do consentimento, quando o tratamento se apoiar nele.</li>
        </LegalList>

        <p>
          Para exercer qualquer um deles, escreva ao nosso encarregado (veja a seção de contato). Vamos confirmar a sua
          identidade antes de responder — é o que impede que outra pessoa peça os seus dados no seu lugar — e responder
          no prazo previsto na lei.
        </p>

        <p>
          <strong>Se os seus dados estão aqui porque uma empresa cliente os cadastrou</strong>, quem decide sobre eles é
          essa empresa. Nesse caso encaminhamos o seu pedido a ela e prestamos o apoio técnico necessário, mas a
          resposta é dela.
        </p>

        <p>
          A plataforma não toma decisões automatizadas que afetem os seus interesses de forma jurídica ou relevante, de
          modo que não há revisão a pedir nos termos do art. 20.
        </p>
      </>
    )
  },
  {
    id: 'seguranca',
    title: 'Segurança',
    body: (
      <>
        <p>Medidas técnicas que estão em funcionamento hoje:</p>

        <LegalList>
          <li>todo o tráfego entre o seu navegador e a plataforma acontece por conexão HTTPS;</li>
          <li>
            a página declara ao navegador uma política de segurança de conteúdo e bloqueia o acesso à câmera, ao
            microfone e à geolocalização do dispositivo;
          </li>
          <li>a plataforma não pode ser carregada dentro de um quadro em outro site, o que impede ataques de clique falso;</li>
          <li>as imagens não ficam públicas: cada visualização depende de um link assinado que expira;</li>
          <li>a sessão de login expira automaticamente;</li>
          <li>o acesso é segregado por empresa e por perfil, verificado a cada requisição no servidor.</li>
        </LegalList>

        <p>
          <ToDefine>
            confirmar e descrever a criptografia em repouso do banco de dados e do armazenamento de arquivos, a política
            de cópias de segurança e o controle de acesso da equipe interna
          </ToDefine>
        </p>

        <p>
          Se ocorrer um incidente de segurança com risco relevante, comunicaremos a Autoridade Nacional de Proteção de
          Dados e as pessoas afetadas, na forma do art. 48 da LGPD.
        </p>

        <p>
          Uma parte da segurança depende de você: escolha uma senha forte, não a compartilhe e avise-nos se suspeitar
          que alguém acessou a sua conta.
        </p>
      </>
    )
  },
  {
    id: 'menores',
    title: 'Crianças e adolescentes',
    body: (
      <p>
        A Sellou é uma ferramenta de trabalho entre empresas e não se destina a menores de 18 anos. Não coletamos
        intencionalmente dados de crianças e adolescentes. Se tomarmos conhecimento de que isso aconteceu, eliminaremos
        os dados.
      </p>
    )
  },
  {
    id: 'contato',
    title: 'Encarregado (DPO) e contato',
    body: (
      <>
        <p>Para dúvidas sobre esta política ou para exercer os seus direitos, fale com o nosso encarregado:</p>

        <LegalList>
          <li>
            Encarregado: <ToDefine>nome do encarregado pelo tratamento de dados pessoais</ToDefine>
          </li>
          <li>
            E-mail: <ToDefine>e-mail do encarregado</ToDefine>
          </li>
          <li>
            Endereço para correspondência: <ToDefine>endereço postal da Sellou</ToDefine>
          </li>
        </LegalList>

        <p>
          Você também pode apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD), pelos canais
          oficiais dela.
        </p>
      </>
    )
  },
  {
    id: 'alteracoes',
    title: 'Alterações desta política',
    body: (
      <p>
        Podemos atualizar esta política para refletir mudanças na plataforma, nos fornecedores ou na legislação. A data
        de última atualização fica sempre no topo desta página. Quando a mudança for relevante para você, avisaremos
        pelos canais da plataforma antes de ela entrar em vigor.
      </p>
    )
  }
]

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow='Sellou · Documentos legais'
      title='Política de Privacidade'
      intro='Como a Sellou trata dados pessoais na plataforma de gestão comercial e nas lojas virtuais hospedadas nela, à luz da Lei Geral de Proteção de Dados (Lei 13.709/2018).'
      updatedAt={UPDATED_AT}
      notice={
        <div
          role='note'
          className='rounded-lg border border-warning-border bg-warning p-4 text-[15px] leading-[1.6] text-warning-foreground'
        >
          <p className='text-label'>Minuta — ainda não publicada</p>
          <p className='mt-1'>
            Este texto foi redigido a partir do que a plataforma faz hoje, mas ainda não passou por revisão jurídica e
            contém informações pendentes, marcadas ao longo do texto. Preencha os marcadores e submeta o documento à
            revisão de um advogado antes de tratá-lo como a política vigente.
          </p>
        </div>
      }
      sections={sections}
      related={{ href: '/terms', label: 'Ler os Termos de Uso' }}
    />
  )
}
