# HANDOFF — Sellou Vendas (redesign de front-end)

> Documento vivo. Atualizado a cada sessão — itens concluídos são removidos, não arquivados aqui.
> Histórico de verdade fica no `git log`; este arquivo é só "onde estamos agora".

## Ambiente

> ⚠️ **Bug de renderização no Antigravity (achado em 2026-08-15).** Quando o usuário lê as
> respostas do Claude através do Antigravity, trechos de texto saem cortados/corrompidos antes
> de chegar até ele — confirmado com prints: `POSTGRES_USER` virou `POST RES_USER`, `docker
> compose exec db psql` perdeu o `exec`, `CREATE EXTENSION` virou `CREATE E TE SIO`. Não é bug do
> terminal SSH/Hostinger nem do Claude Code — o texto já chega cortado no Antigravity. Comandos
> de terminal que o usuário for copiar de uma resposta **não devem ser confiados via Antigravity**;
> pedir para o usuário ler a resposta direto no Claude Code, ou digitar o comando manualmente em
> vez de copiar.

- Repos: `sellou-front2025` e `sellou-back2025` — **PRs #4 mergeados e em produção** (backend 12:43, frontend 12:46 de 2026-08-14, ambos os deploys com sucesso, na ordem correta)
- Frontend: `npm run dev -- --port 8001` → http://localhost:8001
- Backend: precisa **Node 20** (`eval "$(fnm env)" && fnm use v20.20.2`) — Node do sistema (26) quebra `jsonwebtoken`. `npm run start:dev` → http://localhost:8000
- Login de teste: `joao.silva@alfa.com` / `Teste@123` (empresa 1, Alfa Soluções)
- Referência de design: `DESIGN.md` na raiz do front (fonte: mockups HTML em `/Users/andersilva/Projetos/Sellou/*.html`)
- Wasabi (upload de imagem): credenciais reais configuradas no `.env` do back — funcionando

## Progresso no roteiro do design.md

- [x] Passo 0 — fundação (tokens, Inter, Sidebar/Topbar, templates reutilizáveis)
- [x] Passo 1 — Login
- [x] Passo 2 — Dashboard admin e Dashboard da Empresa no visual em cartão — **os dois fechados em 2026-08-15**
- [x] Passo 3 — Pedidos: lista, cards, filtros, edição, modo escuro — **linguagem em cartão
      concluída em 2026-08-16** (kanban, 9 modais e formulário incluídos)
- [x] Passo 4 — Empresas (lista, no visual em cartão) — **feito em 2026-08-15**; não existe tela de detalhe (CRUD é só por modal), então não há "detalhe" a migrar
- [x] Passo 5 — Produtos (lista, tabela, cards, modal, formulário) — **feito em 2026-08-15**
- [x] Passo 6 — Demais módulos: Usuários **feito em 2026-08-15**; Clientes, o submenu
      **Gerenciamento** (hub com 7 abas + Hierarquia, Requisições de Acesso, Metas, Rotas e
      Tabelas de Preço em rota própria), Minhas Metas, Minhas Rotas, Execução da viagem,
      Relatórios (as 4), Preferências do Superadmin e o bloco de autenticação/erro/404 — **todos
      feitos em 2026-08-16**. Falta só a **Loja do cliente**, fora de escopo por decisão de
      produto (ver seção própria abaixo).

> ⚠️ **Mudança de direção visual em 2026-08-15.** A plataforma adotou uma segunda linguagem
> visual (cabeçalho em cartão, acento verde), vinda de mockups da equipe de design.
> **Leia a seção 12 do `DESIGN.md` antes de mexer em qualquer tela.** Produtos, os dois Dashboards,
> Empresas, Usuários e Pedidos são a referência — Pedidos fechou a migração em 2026-08-16
> (lista, cards, kanban, modais e formulário).

---

## 🔖 Sessão 2026-09-05 — Dashboard, Observações do cliente e Tabelas de Preço

Branch `MelhoriasVisuais05.09.26`, três frentes pequenas e independentes:

- **Dashboard do superadmin**: o cabeçalho "Visão geral" encolhia até ~42px (ícone cortado,
  título e descrição escondidos) em telas com bastante conteúdo abaixo. Causa: `<header>` é
  item de um `flex-col` de altura limitada e tem `overflow-hidden` (só pra recortar os círculos
  decorativos), o que zera o `min-height` automático do flexbox. Corrigido com `shrink-0` no
  `ListingPageHeader` compartilhado — protege qualquer tela futura do mesmo problema.
- **Aba Dados do cliente**: salvar não fazia nada (nenhuma requisição, nenhum erro visível)
  para clientes sem "Tipo de Cliente" classificado. A API devolve `customerType: null` nesse
  caso, mas o schema Zod só aceitava `undefined` — a validação falhava silenciosamente antes de
  chamar a action, e o erro ficava longe de qualquer campo que o usuário tivesse mexido (ex.:
  Observações). Corrigido com `.nullable()`, mesmo padrão já usado no campo `gln` neste arquivo.
- **Tabelas de Preço**: ver atualização na tabela de migração do `DESIGN.md` — a grade de
  preços ganhou cabeçalho fixo ao rolar, coluna Produto com corte visual, indicador de variação
  vs. preço base e botão de salvar sempre visível. **Escopo deliberado**: só
  `price-table.tsx` — os modais satélite e o editor de regras continuam sóbrios, e nenhuma
  ordenação/filtro foi adicionada (exigiria a `DataTable` baseada em tanstack, que não suporta
  células editáveis). Nenhum comportamento de salvamento mudou — `handleSave`, `getPrice` e o
  payload enviado ao backend são idênticos a antes.

Verificado: `npx tsc --noEmit` e `npm run build` limpos (só os warnings de estilo
pré-existentes, mesmos de sempre). Os dois primeiros itens foram reproduzidos ao vivo em
produção antes e depois da correção.

---

## 🔖 Onde paramos (2026-08-19) — Loja do cliente EM PRODUÇÃO e verificada

**Tudo o que segue está mergeado na `main` e no ar.** Front em `d0cd47b`, backend em `5776c58`.

### Verificado em produção, não só relatado
- **Imagens otimizadas**: uma foto real da Bravabuild vai de **153 KB → 14 KB (−91%)** por
  `/_next/image`, HTTP 200. Era o maior risco da entrega.
- Backend servindo os 6 campos novos da loja no endpoint público.
- Container do front reconstruído; `Dockerfile` agora **versionado** e com o `COPY next.config.mjs`.

### O que entrou (5 frentes)
1. **Bugs que quebravam no celular** — botão "Adicionar ao carrinho" cortado em todo aparelho,
   "Finalizar pedido" vazando do drawer, drawer de categorias sem rolagem, header `"#undefined"`,
   parede de "Não informado", HTML cru no card, produto inexistente derrubando a página.
2. **Imagens** — removido o `unoptimized`; `ProductImage` novo com `onError` e fade-in; no backend,
   a assinatura passou a ser reaproveitada em 80% da validade, o que é o que torna o cache do
   otimizador possível.
3. **Capa + identidade + assinatura Sellou** — `coverUrl`, `about`, `whatsapp`, `phone`, `address`,
   `businessHours`. A capa se monta da cor da loja quando não há imagem.
4. **Mobile** — header de 168px → 64px, alvos de 44px, `100dvh`, CTA sticky no checkout.
5. **Vídeo por link público** (YouTube/Vimeo/Drive), com `parseVideoUrl` como fronteira de
   segurança e a CSP liberada só para os três hosts.

**Bônus não planejado: cliente voltou a conseguir logar na loja.** O portão lê `UserCompanies` e
nada escrevia lá; e o backfill do boot só olhava `User.companyId`, que em cliente de loja é NULO
(a empresa só é alcançável pelo `customerId`). Corrigido nos dois pontos.

### Deploy: por que ele estava quebrado há 2 dias (resolvido)
O `Dockerfile` **nunca esteve no repositório** — a imagem era construída a partir de um arquivo
que existia só no servidor, feito à mão. Quando `c8740cf` finalmente o versionou (justamente com o
`COPY next.config.mjs`), o `git pull` passou a se recusar a sobrescrever o arquivo solto e abortava
**antes de baixar qualquer coisa**. O commit que traria o Dockerfile para o controle de versão era
o único que nunca conseguia chegar: ele se bloqueava. 13 commits ficaram parados.

Os dois workflows agora usam `fetch` + `reset --hard` no SHA que disparou a execução, abortam se a
árvore não ficar exatamente nele, conferem que o container continua de pé e batem na URL pública no
fim. **Não use `git clean` aí** — ele apagaria o `.env.production`/`.env` do servidor.

---

## ⏳ Pendente

### Não verificado (precisa de humano)
1. **Largura real de celular.** Todo o trabalho de mobile é raciocínio + medições que independem de
   breakpoint. O `resize_window` do Chrome não move o viewport neste ambiente (travou em 1440px em
   ~6 tentativas). **Abrir a loja num celular de verdade.**
2. **Upload de arquivo** (logo e capa). A máquina de upload foi extraída para
   `hooks/use-image-upload-field.ts`; a extração foi revisada linha a linha, mas ninguém clicou em
   "Alterar Capa" com um arquivo real depois do deploy.

### Trabalho pronto e NÃO enviado
`melhorias-logo` (front) tem **2 commits locais, não pushados**: `094d668` (página de perfil com o
bloco de senha, tirado de Preferências) e `5ecf4c7` (Política de Privacidade). Precisam de PR
próprio.

⚠️ **A política é MINUTA, com 13 marcadores `[A DEFINIR]`, e NÃO pode ir ao ar sem revisão
jurídica.** A página exibe um banner dizendo isso — só remover depois da revisão.

### Achados registrados, não corrigidos (decisão do dono)
- **O e-mail do usuário é enviado à Vercel Analytics a cada login** —
  `components/auth/sign-in-form.tsx:66` e `components/shop-access/sign-in-form.tsx:74`
  (`track('sign-in', { email })`). É dado pessoal indo a terceiro no exterior. A correção limpa é
  remover o `email` do evento (2 linhas), não descrever isso numa política.
- **Dois links quebrados na área "Minha Conta" da loja (mobile)**:
  `shop/account/account-management.tsx:95,106` apontam para `/politica-de-privacidade.pdf` e
  `/termos-de-uso.pdf` — **nenhum dos dois existe em `public/`**. Devem virar `/privacy-policy` e
  `/terms`.
- **A tela de login afirma "Seus dados são criptografados e seguros"** (`sign-in-form.tsx:193`) —
  alegação de segurança que não foi possível confirmar no código.
- `npm run lint` está quebrado no repo (pré-existente): `.eslintrc.js` estende `"prettier"` e o
  `eslint-config-prettier` não está instalado.
- `npm run start:dev` do backend está quebrado: procura `dist/main`, mas o build gera
  `dist/src/main` (há arquivos fora de `src/`). Subir com `node dist/src/main`.
- **Node 26 quebra o `jsonwebtoken`** — rodar os testes do backend com Node 20.

---

## 🧭 Sugestão de próximos passos, em ordem

1. **Fechar os dois pendentes de verificação** (celular + upload). São 15 minutos e cobrem a única
   parte da entrega sem prova.
2. **Remover o e-mail do evento da Vercel.** É o único item com implicação de privacidade real, e
   custa duas linhas.
3. **Consertar os dois links de PDF quebrados** na área da conta — o cliente final os vê.
4. **Abrir o PR do perfil + política**, com a política marcada como bloqueada até revisão jurídica.
5. **Terminar a tokenização da loja.** Sobraram cores fixas em `category-drawer.tsx` (13, azuis que
   ignoram o white-label) e nos skeletons. Hoje é invisível porque o modo escuro é inalcançável na
   loja, mas é bomba armada.
6. **Estado de filtro/ordenação na URL da loja.** Entrar num produto e voltar hoje perde filtro,
   ordenação e posição de rolagem, e refaz as requisições da página 1. É o maior incômodo de UX que
   sobrou, e não cabia na véspera da demo.
7. **Repetir pedido** no histórico do cliente — a lacuna B2B mais pedida e ainda aberta.

---

## 📌 Do plano `logo-customization-svg-support`: o que ainda falta

O **§1 daquele plano foi feito e está em produção** (fallback de cor do header e contraste do
texto — hoje o header usa `bg-primary`, e o layout da loja semeia a variável a partir de
`shopColor || customColor`). Restam dois lotes, independentes entre si:

**§2 — logo clara (`logoUrlLight`)**: campo novo + upload opcional + resolução de exibição.
É a **mesma cirurgia** que a capa já fez (entity → DTO → mapper → whitelist de `attributes` →
interface → schema → formulário → exibição), e o formulário agora tem `ImageUploadFieldControl` +
`useImageUploadField` prontos para receber um terceiro campo sem duplicar nada.

**§3 — suporte a SVG**: detectar `image/svg+xml` ANTES do pipeline de raster (rasterizar destruiria
o propósito), cap de tamanho próprio bem menor que os 40MB atuais, sanitização com DOMPurify no
cliente como conveniência e **de novo no servidor como fronteira real**, via endpoint próprio que
receba os bytes — a rota de presigned URL genérica deve continuar recusando SVG de propósito.

---

## 🔖 Onde paramos (madrugada de 2026-08-16 → 17, ainda em andamento)

**As 6 frentes do roteiro de migração visual (ver abaixo) fecharam e foram verificadas de forma
independente** — não só relatadas pelos agentes, reconferidas por fora (`tsc`/`build`/`test` de
novo, fronteira de arquivo proibido checada por `git diff`). Cada uma vive na sua própria branch
`deploy/*`, em worktree próprio, e **nenhuma foi mesclada em `chore/next-improvements` nem em
`main`** — por isso não apareciam no `localhost:8001` de quem for testar (essa porta roda
`chore/next-improvements`, que não tem nada disso).

**Produção (`app.sellou.com.br`) não foi tocada e não deveria ter sido** — deploy é sempre passo
manual, separado do merge, nunca automático. O dono checou produção e viu o visual antigo; é o
esperado, não é sinal de nada quebrado.

**Ação em andamento agora:** montando uma branch de prévia **local, temporária, só para visualizar
tudo junto** — `preview/overnight-completo` (criada a partir de `chore/next-improvements` @
`45e75de`, no checkout principal `sellou-front2025`). Mesclando as 6 branches `deploy/*` nela, uma
de cada vez, resolvendo conflito manualmente. **As 6 branches originais não são alteradas por
isso** — ficam intactas, exatamente como verificadas, prontas para o dono revisar e mesclar de
verdade quando quiser.

Progresso do merge de prévia, nesta ordem: `deploy/clientes-cartao` ✅ · `deploy/gerenciamento-
consolidado` ✅ · `deploy/pedidos-cartao` ✅ · `deploy/representante-cartao` ✅ ·
`deploy/relatorios-cartao` — **em andamento** (conflito em `DESIGN.md`, só nas tabelas de "Estado
da migração"/componentes compartilhados, nada de código) · `deploy/auth-erro-cartao` — falta.

**Todo conflito até aqui foi só em documentação** (`DESIGN.md`, `HANDOFF.md`) e num comentário
duplicado em `tailwind.config.ts` — nunca em código de verdade, porque as 6 frentes trabalharam em
árvores de arquivo praticamente disjuntas (checado por `git diff --name-only` antes de cada merge).

**Ao retomar, depois do merge de prévia terminar:**
1. `npx tsc --noEmit` + `npm run build` + `npm test` no resultado mesclado inteiro.
2. Reiniciar `npm run dev -- --port 8001` **nesse checkout, já em `preview/overnight-completo`** —
   ele estava rodando `chore/next-improvements` e caiu à noite porque um `npm run build` (produção)
   foi rodado na mesma pasta enquanto o dev server estava de pé, corrompendo o `.next` dele. Não
   repetir: build de verificação a partir de agora só nos worktrees isolados, nunca no checkout que
   está servindo o dev.
3. Avisar o dono que a prévia está pronta pra navegar, com a lista do que esperar ver em cada tela
   (Clientes, Gerenciamento consolidado, Pedidos, Representante, Relatórios, Auth/Superadmin).
4. Só depois disso — e só com aprovação explícita — decidir mesclar em `chore/next-improvements`/
   `main` de verdade, e só depois disso, e só com aprovação explícita separada, cogitar deploy.

**Achado transversal já corrigido nas 6 branches + `chore/next-improvements`:** `bg-app` não gerava
CSS nenhuma (chave da paleta do Tailwind escrita errada) — commit `bfa617f`, propagado idêntico em
todas. Detalhe completo na seção de cada fase abaixo.

**Achado transversal registrado, não corrigido — decisão do dono:** a escala `--brand-*` só existe
no tema claro (sem par em `.dark`), deixando o seletor de visualização em ~1,5:1 de contraste no
escuro, em telas já no ar antes desta sessão. Precisa de valores de cor de verdade, não é rename
mecânico. E `cn()`/`tailwind-merge` descarta `text-h3` quando combinado com `text-text` — todo
`CardTitle` do app está sem tamanho de fonte definido.

---

## Sessão 2026-08-16 — Pedidos termina a migração (Fase 4 do roteiro de 8 fases)

Branch: `deploy/pedidos-cartao`, a partir de `chore/next-improvements` (`45e75de`). Cinco lotes,
cada um com `tsc --noEmit` + `npm run build` + `npm test` limpos antes do commit (37/37 em todos).

**O que estava faltando e foi feito:**

1. **Ordenação falsa da tabela de Pedidos — corrigida.** Os 10 `SortableColumnHeader` eram
   clicáveis mas o `DataTable` nunca recebia `sorting`, então caía no modo não-controlado e
   reordenava só as 10 linhas da página. Ligado o `useUrlSorting`. **Cinco colunas perderam o botão
   de propósito** (cliente, responsável, produtos, condição de pagamento, progresso de pagamento):
   são calculadas no browser e não existem como coluna em `Orders`; como `buildSortQuery` empurra o
   campo direto pro `order` do Sequelize, pedir `sort={"customer":"asc"}` quebraria a consulta.
   Para ordená-las é preciso backend (ordenar por include), registrado abaixo.
2. **Dívida de hooks de Produtos paga** — `products/index.tsx` saiu do `use-delayed-state` para o
   `use-delayed-url-search` (reset de página ao buscar) e `products-table.tsx` perdeu sua cópia
   inline da lógica de ordenação em favor do `useUrlSorting`. Pedidos tinha o mesmo hook antigo na
   busca e foi junto.
3. **Kanban** — `kanban-column.tsx` (o pior ofensor: `bg-gray-100 border-gray-200`, moldura
   `border-2`, estados de drop em green-500/red-300/blue-300) e `kanban-board.tsx` (`bg-white/50`,
   spinner artesanal, dois `bg-gray-300`) reconstruídos em token. Coluna vazia agora diz que está
   vazia. `kanban-card.tsx` não precisou de mudança: é um wrapper de `useSortable` sobre o
   `OrderCard`, sem estilo próprio. **Arrasto intocado** — sensores, `handleDragStart`/`handleDragEnd`,
   `canMoveStatus` e `executeStatusChange` idênticos.
4. **9 modais** migrados para o mesmo casco de diálogo que Produtos usa (`rounded-3xl`, `p-0`,
   cabeçalho `bg-surface-muted/70`, miolo rolável, blocos `rounded-2xl`). Os três `text-blue-700`
   fixos (azul num produto de acento verde) viraram cápsulas de marca. `remove-order-modal` ganhou
   o `h-auto` que impede diálogo pequeno de esticar pra tela inteira abaixo de xl.
5. **`OrderForm`** — o `<h1>` cru virou o cabeçalho em vidro do `ProductForm` (voltar, eyebrow,
   número do pedido em pílula, status em cápsula + ações). Os 5 cards ganharam cabeçalho com chip de
   ícone. `customer-selection` e `product-selection` renderizavam um `<Card>` dentro do card da
   seção (borda dupla visível) e viraram blocos simples. Cobre as três rotas: create, edit e
   duplicate.

**Regra de risco respeitada.** `split-order-modal`, `kanban-invoice-modal`, `update-order-value`,
`product-selection` e `order-summary` receberam **só casco**: o diff desses arquivos não contém
mudança de fórmula, de clamp de quantidade, de guarda, de payload nem de mensagem de validação.
Nada foi "conferido" nos cálculos — eles foram **deixados intocados**, que não é a mesma coisa.

**Verificado:** `npx tsc --noEmit` limpo, `npm run build` compilando e `npm test` 37/37 nos cinco
lotes. Com `npm run dev` na porta 8024 e o backend real em :8000, as quatro rotas
(`/company/1/orders`, `/orders/create`, `/orders/edit/1`, `/orders/duplicate/1`) responderam 200 e
**o log do dev não registrou uma única exceção** — os server components buscaram dados de verdade.

**Não verificado:** a aparência. Todo o `(admin)` está dentro de um `ProtectedRoute` client-side, então
o HTML do servidor não contém o conteúdo da página nem autenticado — verificação visual por HTTP é
impossível aqui, precisa de navegador com humano. Ninguém olhou essas telas renderizadas.

### Achados desta sessão (registrados, não corrigidos)

- **🟠 `order-view-modal.tsx` não tem nenhum importador** (grep em todo o `src`). Foi migrado porque
  estava no escopo, mas hoje é código morto: o "detalhe do pedido" que o usuário alcança é o
  formulário de edição. Decidir: ligar num botão "Ver" ou apagar as 299 linhas.
- **🟠 O Kanban só enxerga a página atual.** `orderWrapper.orders` vem paginado (`limit=10`), então
  o quadro inteiro mostra no máximo 10 pedidos somados todas as colunas, e o contador do cabeçalho
  conta só esses. Por isso **não** foi adicionado o "valor consolidado por coluna" que o DESIGN.md §7
  pede: com dados parciais ele exibiria um número de dinheiro errado. Precisa de endpoint de
  agregação (ou limite próprio para a visão kanban) antes.
- **🟠 `split-order-modal` bloqueia divisão só por quantidade.** O guard
  `selectedItems.length === productItems.length` impede confirmar quando todos os produtos estão
  marcados — mesmo que as quantidades tenham sido reduzidas, que é uma divisão parcial legítima.
  No mesmo arquivo, `movedCount = totalCount - selectedCount` conta *produtos*, então com divisão
  parcial o rodapé ("N para manter, M para novo pedido") mente. **Não mexido**: é regra de negócio
  em tela de valor.
- **🟡 `update-order-value` não aceita zerar o valor pago.** `UpdateOrderValueSchema` é
  `z.number().positive()`, então corrigir um pagamento lançado errado para R$ 0,00 é impossível pela
  tela. Pode ser deliberado; é decisão do dono.
- **🟢 Divergência de escopo:** a missão descrevia `product-selection.tsx` como tendo "lógica de
  preço/desconto por item". Ele não tem: só exibe `product.price` do catálogo e escolhe quantidade.
  O desconto por item não existe nesta tela (o formulário tem um desconto único, no nível do pedido).
- **🟢 Ordenação por colunas de relação em Pedidos** (cliente, responsável, condição de pagamento)
  exige `order: [[{ model: Customer, as: 'customer' }, 'fantasyName', 'ASC']]` no
  `orders.service.ts`. Enquanto não existir, os cabeçalhos ficam sem botão.

---

## Sessão 2026-08-16 — Clientes migra para o cartão

Branch: **`deploy/clientes-cartao`** (a partir de `chore/next-improvements`, HEAD `45e75de`),
worktree `Sellou2025/wt-clientes`. Rodou em modo autônomo, à noite, sem aprovação intermediária.
Uma frente paralela (`wt-gerenciamento`, submenu Gerenciamento) estava em andamento ao mesmo
tempo — nenhum arquivo dela foi tocado; a cápsula de abas foi criada em
`customers/common/customer-segmented-tabs.tsx`, **não** em `shared/`, justamente para não colidir.

Clientes era a última das cinco telas principais da sidebar 100% no visual antigo. Foi migrada
inteira (listagem + perfil), menos a aba **Dados**.

**Achados que viraram correção, não só maquiagem:**

- **Busca e ordenação já existiam no backend e não tinham UI.** `customers/page.tsx` sempre
  enviou `query` e `sort`, e o backend casa parcial em `id`/`document`/`fantasyName`/
  `corporateName`. Ligar o `ListingPageHeader` acendeu as duas sem uma linha de backend.
- **As contagens das abas mentiam.** Eram calculadas sobre a base inteira, ignorando busca e
  filtros: buscar um cliente deixava "Todos 250" acima de uma linha só. Agora cada contagem
  respeita `query` e os demais filtros.
- **Uma contagem fora do ar derrubava a página com 500** (`fetchData` lança). Agora cada uma cai
  em `try/catch` e devolve `null`; a cápsula simplesmente omite o número.
- **A barra de crédito estourava o contêiner** quando `creditLimitUsed > creditLimit` — não havia
  teto. `getCreditLimitUsage` (testado) limita a 0–100 e é usado pelo card e pela tabela.
- **Modo lista não existia de verdade:** o seletor tinha "lista", mas só empilhava os mesmos
  cards. Agora tem tabela com ordenação server-side e colunas configuráveis.
- **A aba Usuários mentia dentro do sheet** (o sheet nunca passou `customerUsers`, então dizia
  sempre "Nenhum usuário encontrado") e o `AdvancedFilter` dela **reescrevia o `filters` da URL da
  listagem por baixo do drawer aberto**. O sheet agora esconde essa aba e ganhou link "Abrir
  perfil completo".
- **Dois botões que faziam a mesma coisa** no card ("Visualizar" e "Editar" chamavam o mesmo
  `setIsSheetOpen`), e dois ícones sem nome acessível na tabela (passavam `name` para ícone
  lucide, que não faz nada).
- **A listagem baixava 4 requisições que quase ninguém usava.** `payment-condition`,
  `payment-method` e `users` existiam só para alimentar o modal de novo cliente — carregados em
  toda visita, para um formulário que a maioria das visitas nem abre. Agora carregam na abertura
  do modal (`common/create-customer-modal-loader.tsx`; o modal de 530 linhas não foi tocado, só o
  fio). `segments` continua na página, porque card e tabela imprimem o nome do segmento. Somando
  com a contagem de "Todos" vinda do `metadata.total`, **a carga comum da listagem faz 4
  requisições a menos** do que no início desta frente.
- **737 linhas de código morto apagadas** (`desktop/customers-table.tsx` e
  `desktop/customer-row-options.tsx`, órfãos desde `60589d2` em 21/02/2025;
  `common/update-customer-modal.tsx`, substituído de propósito por `dados-tab.tsx` em `7e177c1`).
  Num commit isolado, revertível sozinho.

**Decisões de implementação que valem lembrar:**

- **Abas do perfil por `window.history.replaceState`, nunca `router.push`.** A página do perfil é
  server component e dispara **6 requisições**; trocar de aba via `push` custaria as 6 de novo.
  `replaceState` funciona para isso desde o Next 14.1 (o projeto está no 14.2.13). Hook novo:
  `profile/use-profile-tab.ts`. Se algum dia parar de refletir no `useSearchParams`, o fallback é
  estado local puro — **não** `router.push`.
- `countActiveFilters` ganhou 2º parâmetro opcional `{ exclude }` (aditivo; Empresas e Usuários
  seguem chamando igual). Clientes exclui `status`, porque a cápsula de situação escreve no mesmo
  param `filters` — sem isso o badge do botão de filtro acenderia só por trocar de aba.
- `import-customers-modal.tsx` virou `isOpen`/`onClose` (padrão do `ProductImportModal`).
- Contagem de testes: **37 → 79**.

### Pendências e perguntas em aberto (para o dono decidir)

1. **Endpoint agregado de contagem (backend).** Sobraram 3 requisições só para as contagens de
   situação, e cada uma ainda arrasta um `include` de Orders no backend. Um
   `GET /company/:id/customer/status-counts` com `GROUP BY status` mataria as três. Não
   implementado — é backend, e esta frente era 100% front.
2. **`getCustomerCreditStatus` rotula `used >= limit` como "Sem Limite"** — exatamente o mesmo
   rótulo de quem não tem limite cadastrado (`limit === 0`). São duas situações comerciais
   opostas: "estourou o limite" e "não tem limite definido". **Não foi alterado**, só registrado:
   é decisão de negócio. Se for para separar, sugerir "Limite esgotado" para o primeiro caso.
3. **Rota de tabela de preço por cliente não existe.** A tabela antiga tinha um botão "Tabela de
   Preços" apontando para `/company/:id/price-tables/:customerId` — rota que nunca existiu (só
   `/price-tables`, sem parâmetro). O botão **não** foi recriado. Falta decidir se essa tela é
   para existir.
4. **Inadimplente: vermelho ou âmbar?** As duas telas antigas discordavam (o card pintava de
   amarelo, o cabeçalho do perfil de vermelho). Unificado em **vermelho** (`danger`). Reverter é
   uma linha em `STATUS_VARIANT`.
5. **Aba Dados do perfil (654 linhas): só a casca foi migrada.** Cartão, tokens e sentence case
   sim; o formulário em si (`zodResolver` + 4 server actions de pagamento) **não** foi
   reestruturado — risco alto de regressão silenciosa de gravação, e o diff foi mantido
   estritamente visual (13 linhas, nenhuma delas de schema, campo ou action). Se o dono quiser o
   formulário repensado, é tarefa própria e precisa de teste de gravação de verdade.
6. **Consolidar a cápsula de abas.** Existem três cópias do mesmo strip de abas em pílula:
   `dashboard/dashboard-tab-nav.tsx` (navega por href), `customers/common/customer-segmented-tabs.tsx`
   (estado controlado) e o `shared/segmented-tab-nav.tsx` que a frente de Gerenciamento está
   criando. As classes da de Clientes foram copiadas **caractere a caractere** da do Dashboard
   justamente para que a consolidação, depois do merge das duas frentes, seja diff mecânico.
7. **`ui/progress.tsx` tem cores cravadas** (`bg-green-500`, `bg-red-700`, `bg-gray-500/50`), sem
   par para o modo escuro. Clientes deixou de usá-lo e montou a barra com tokens; o componente
   compartilhado não foi tocado, para não mexer em outras telas.

**Verificado:** `npx tsc --noEmit` limpo, `npm run build` limpo (20 rotas) e `npm test` 79/79 em
**cada** lote. Além disso, sondagem HTTP com `npm run dev` na porta 8020: `/company/1/customers`,
com `?filters=status`, com `?query=`, `/customers/1`, `?tab=pedidos` e `?tab=lixo` — todas
respondem **200** com o redirecionamento de login, nenhuma dá 500, e o `<title>` renderiza.

**NÃO verificado — pendente de olho humano:** absolutamente nada visual. Não há navegador
disponível para agente sem humano ao vivo nesta sessão, e nenhuma verificação visual foi
fabricada. Falta conferir: aparência em claro/escuro, 360–1440px, hover/foco dos cards, tooltips
das ações, o round-trip de ordenação da tabela, o `localStorage` das colunas, a troca de aba do
perfil refletindo na URL sem recarregar, e as contagens com dados reais. Também **não** foi
possível testar o caminho autenticado: obter sessão exigia ler o `.env.local`, e **o sistema de
permissões negou essa leitura** — a tentativa parou ali, sem contornar por outra ferramenta.

---

## Sessão 2026-08-16 — Gerenciamento migra para o cartão (e vira um hub com subabas)

Branch: `deploy/gerenciamento-consolidado` (de `chore/next-improvements` @ `45e75de`), 8 commits.
Plano completo em `docs/planos/gerenciamento-consolidacao.md`.

**Pedido do dono:** o submenu **Gerenciamento** tinha 12 links, todos em telas no visual sóbrio, e
"dava pra colocar várias numa página só, com subabas".

**Decisão de escopo.** Sete telas viraram abas de um hub em
`/company/[companyId]/settings?tab=…` — Categorias, Segmentos, Condições de pagamento, Métodos de
pagamento, Usuários da empresa, Prazos de pedido e Preferências. As cinco listagens eram
literalmente a mesma página de 66 linhas, então viraram **uma** implementação parametrizada
(`ManagementListTab`), não sete cópias. **O grupo Gerenciamento caiu de 12 para 6 itens**
(Configurações, Hierarquia, Metas, Requisições de Acesso, Rotas, Tabelas de Preço) — a sidebar de
topo continua com os 7 itens de sempre.

**Metas, Rotas e Tabelas de Preço não viraram aba**, e isso foi deliberado: somam ~3.500 linhas de
regra de negócio (precificação, roteirização, metas). Elas — mais Hierarquia (árvore) e Requisições
de Acesso (workflow de aprovação) — ganharam a mesma linguagem visual **na sua própria rota**, com o
miolo intocado.

**Permissão resolvida no servidor.** O hub roda `getServerSession` e normaliza a aba pedida contra o
papel **antes de qualquer fetch**: um representante que digitar `?tab=usuarios` cai em Preferências,
sem disparar requisição de admin. Com uma aba só visível, a barra de abas some — a tela continua
sendo a Preferências de sempre. 7 testes cobrem essa resolução.

**Rotas antigas viraram redirect 307** (`categories`, `segments`, `payment-conditions`,
`payment-methods`, `users`, `orders-setup` → a aba correspondente), então bookmark antigo continua
funcionando.

**Achados corrigidos de passagem** (todos visíveis no código, nenhum introduzido agora):
- **Hierarquia**: a busca nunca era renderizada — a função de filtro existia e funcionava, mas nada
  alimentava o `searchTerm`; e criar/remover vínculo não atualizava a árvore na tela (o callback de
  refresh nunca era passado). Ambos corrigidos.
- **Tabelas de Preço**: `price-table-row-options.tsx` era código morto (zero importadores) e sua
  ação principal apontava para `/price-tables/:id/prices`, rota que não existe. Apagado.
- **Prazos de pedido**: aceitava mínimo maior que o máximo, salvando uma janela de agendamento
  impossível. Agora bloqueia com mensagem.
- **Modo escuro**: Hierarquia, Metas, histórico de visitas e a coluna fixa da grade de preços eram
  pintados com `bg-white`/`gray-*`/`green-*` fixos. Agora usam token.
- Coluna fixa de Tabelas de Preço, cápsulas de status de Requisições de Acesso e badges de Rotas
  passaram a usar os componentes compartilhados.

**Componentes que nasceram compartilhados** (em vez de mais uma cópia):
`shared/segmented-tab-nav.tsx` (o Dashboard passou a consumir), `hooks/use-persisted-column-visibility.ts`
(Empresas e Usuários retrofitados), `utils/users/is-administrator-role.util.ts` (`use-auth` delega),
`management/management-shell.tsx` e `management/management-list-tab.tsx`.

**Verificado:** `npx tsc --noEmit` limpo, `npm test` **44/44** (37 pré-existentes + 7 novos) e
`npm run build` limpo **a cada um dos 8 commits**. Além disso, com o backend local no ar e uma
sessão real de ADMINISTRATOR (`joao.silva@alfa.com`), conferi via HTTP no dev server (porta 8010),
inspecionando o payload RSC: as 7 abas montam o próprio componente com dados reais; aba
desconhecida cai em Categorias; **anônimo em `?tab=categorias` e `?tab=usuarios` renderiza
Preferências e não instancia os componentes de admin**; os 6 redirects levam à aba certa; e
Hierarquia, Requisições de Acesso, Tabelas de Preço, Rotas, Metas, Dashboard e Produtos respondem
200.

**Não verificado — precisa de um humano com navegador:** nada foi visto em tela. Não há prova visual
de layout, modo escuro, responsivo (360/768/1440) ou teclado; e nenhum fluxo de escrita foi clicado
(criar/editar/remover categoria, aprovar requisição, salvar preços, editar meta, arrastar rota).

### Dívidas conhecidas desta sessão

1. **Três cápsulas de aba.** `shared/segmented-tab-nav.tsx` navega por `<a href>`, o que é certo
   para abas renderizadas no servidor (Dashboard, hub) mas causaria recarga dura em **Rotas** e
   **Metas**, que buscam no client — as duas repetem só as classes, com estado local. A frente de
   **Clientes** está criando uma quarta, controlada e com contagem por aba. O lote de consolidação
   combinado é dar ao componente compartilhado um modo controlado opcional (`value`/`onChange`) e
   `count`, e apagar as cópias. **Isso é dívida planejada, não bug.**
2. **`revalidateTag` inócuo (pré-existente, não tocado).** As actions de CRUD chamam
   `revalidateTag('/company/1/categories')`, mas `serverFetch` nunca registra tags — a invalidação
   não faz nada. O hub contorna com `force-dynamic`; as telas fora dele seguem dependendo de
   `router.refresh()` onde existe. A correção de verdade é registrar tags no `serverFetch`.
3. **Remoção na Hierarquia ainda usa `confirm()` nativo**, enquanto todo o resto do app usa modal.
4. **`npm run lint` continua quebrado** por `eslint-config-prettier` ausente (dívida anterior); nada
   desta sessão passou por lint.

---

## Sessão 2026-08-16 — Fase 5: as três telas do representante

Branch: `deploy/representante-cartao` (a partir de `chore/next-improvements`, HEAD `45e75de`).
Worktree: `Sellou2025/wt-representante`. Quatro commits, cada um com `tsc` + `build` + `test`
limpos antes de fechar.

| Lote | Commit | Tela |
|---|---|---|
| 1 | `f144a28` | `my-goals` + 5 componentes novos em `components/my-goals/` |
| 2 | `2231cbe` | `my-routes` + `seller-route-card` + `create-route-sheet` + skeleton |
| 3 | `6322d5a` | `my-routes/trips/[tripId]` + layout + `check-in-modal` + `complete-trip-modal` + 3 componentes novos |
| 4 | `84cd16d` | `route-view-modal` (o detalhe que abre do cartão) + N+1 de clientes |

**Medições (idênticas nos quatro lotes):** `npx tsc --noEmit` limpo · `npm test` 37/37 ·
`npm run build` completo (só o aviso pré-existente do ESLint sem `eslint-config-prettier`).
As três rotas respondem **200** em `npm run dev` (checado por `fetch` do Node, porta 8023).

> ⚠️ **Rodar `npm run build` com o `next dev` no ar corrompe o `.next`** e faz a rota devolver
> 500 com `Cannot read properties of undefined (reading 'call')`. Aconteceu aqui e parecia bug
> da tela; era só o build sobrescrevendo o `.next` do dev. Subir o dev de novo resolve.
> (Tentei apagar `.next` para confirmar — **a exclusão foi negada pelo sistema de permissões**
> e não busquei outro caminho; a confirmação veio reiniciando o dev, que voltou 200.)

### Divergências entre o combinado e o que o código mostrou

1. **Os dois modais de meta não eram meus.** O roteiro pedia para tokenizar
   `update-user-goal-modal.tsx` e `remove-user-goal-modal.tsx`. O grep mostra que
   `remove-user-goal-modal` é usado **pela tela `goals` do Gerenciamento** (frente proibida
   para mim), e `update-user-goal-modal` só era importado por `my-goals` — onde estava
   **inalcançável**: nada nunca chamava `setEditGoal`/`setRemoveGoal`, então os dois `{x && <Modal/>}`
   jamais renderizavam. Não toquei em `components/user-goals/`; removi a fiação morta da página.
   **`update-user-goal-modal.tsx` ficou órfão** (zero importadores) — apagar ou religar.
2. **Pergunta de negócio aberta:** o representante deve poder editar a própria meta? Hoje não
   pode (e nunca pôde, apesar do código sugerir que sim). Se a resposta for "não", apague o
   modal órfão. Se for "sim", ele precisa de botão, de trava (senão o vendedor baixa a própria
   cota) e de tokenização.
3. **`my-routes` lista as rotas da empresa inteira, não só as minhas.** A tela chama
   `fetchRoutesAction` (todas) e filtra no cliente com o botão "Apenas minhas rotas", que nasce
   **desligado**. Existe `fetchMyRoutesAction` (`/routes-visits/routes/my-routes`) importado e
   nunca usado. Não mexi: decidir se é regra (rep vê tudo e pode assumir rota de colega) ou bug
   de permissão.
4. **`components/routes/` é compartilhada entre as duas frentes.** Os quatro arquivos que o
   roteiro me deu (`seller-route-card`, `create-route-sheet`, `check-in-modal`,
   `complete-trip-modal`) moram na mesma pasta dos componentes de Rotas do Gerenciamento. O grep
   confirma que os quatro — mais `route-view-modal` — só têm importador no fluxo do
   representante. Usei **uso**, não pasta, como critério; se a frente de Gerenciamento também
   varrer a pasta, o conflito é nesses cinco arquivos.
5. **`shared/searchable-select.tsx` tem zero importadores** e não serve dentro do cabeçalho em
   cartão: dropdown `absolute` é cortado pelo `overflow-hidden` do `<header>`. Ou vira portal,
   ou é código morto.

### Corrigido de passagem (achados reais, não pedidos)

- **N+1 no modal de detalhe da rota**: carregava os clientes um `await` por vez dentro de um
  `for`. Rota de 12 paradas = 12 idas ao servidor em série, na conexão que o rep tem em campo.
  Trocado pelo `fetchCustomersByIdsAction` que a tela de viagem já usava.
- **Camada dupla de padding** em `my-routes/trips/[tripId]`: o `layout.tsx` e a `page.tsx`
  pintavam o mesmo container `px-4 py-4 xl:px-10 xl:py-8`.
- **Três controles inacessíveis por teclado** viraram `<button>`: o cartão de rota, a linha
  de expandir cliente no modal de detalhe e o botão Voltar (que era só um ícone sem nome).
- **Filtro que não filtrava**: o `<select>` "Todos/Ativos/Inativos" no sheet de nova rota
  gravava estado que nada lia. Removido.
- **Botão que parecia habilitado e não fazia nada**: "Salvar visita" com a data da próxima
  visita vazia — `handleSave` saía no primeiro `if`. Agora fica desabilitado.
- **"Finalizar Rota" abria "Finalizar Viagem"** — mesmo fluxo com dois nomes (design.md §8).
  Padronizado em "Finalizar viagem".
- Textos: `Consolidated in {ano}` (inglês) e `Aucune route trouvée` (francês) removidos;
  6 `console.log` esquecidos (2 no fetch de metas, 4 no `[SKIP]` da viagem).

### Não verificado — precisa de olho humano

**Não há navegador disponível para agente sem humano ao vivo.** Foram provados `tsc`, `build`,
`test` e resposta HTTP das rotas. **Não foi visto nada renderizado.** Em particular, continuam
por confirmar:

- **Alvo de toque de 44px e ausência de rolagem horizontal em 360/390px** — o critério que mais
  importa nestas telas. Está construído para isso (alturas `h-11`, `truncate`, tabela virando
  cartão), mas medida real, não.
- Modo claro/escuro nas três telas, incluindo os fundos `--glass-*` e os verdes literais.
- O `Switch` continua com 24px de altura de trilho; quem dá os 44px é o `<Label>` ao lado.
- O `Popover` do período: colisão de borda em tela estreita e retorno de foco ao fechar.
- Fluxo real com dados: iniciar viagem → registrar visita → finalizar. Nada disso foi clicado.

### Sobras conhecidas

- `ListingPageHeader` não deixa a ação primária em largura total no celular (design.md §7 pede).
  É componente compartilhado por 6 telas já migradas — mudança de frente, não desta.
- Não existe `prefers-reduced-motion` global no `globals.css`. Usei `motion-safe:`/`motion-reduce:`
  nos elementos que criei; o resto do app segue sem.
- `route-view-modal.tsx` tem um `handleStartTrip` morto (já era antes): com viagem PENDING o
  rodapé oferece "Ir para viagem" (não inicia) enquanto o cartão oferece "Iniciar viagem".

---

## Sessão 2026-08-16 — Relatórios (as 4 telas) migram para o cartão

Branch: **`deploy/relatorios-cartao`**, saída de `chore/next-improvements` (`45e75de`).
Fase 6 do roteiro de 8 fases. Worktree: `Sellou2025/wt-relatorios`.

As 4 telas de `company/[companyId]/reports/` não estavam só "no visual sóbrio" — estavam **fora
do projeto**: aspas duplas, `p-6`, `<h1 className="text-3xl font-bold mb-4">`, caixa
`border rounded-lg p-4 bg-white shadow-md`, nenhuma usando o casco padrão nem o
`GenericHeaderTitle`. Agora as quatro usam `flex-1 min-w-0 bg-app px-4 py-4 xl:px-10 xl:py-8`,
`DashboardHeader card`, `KpiGrid`, `FilterDrawer` e `DataTable`.

**Commits (um por lote, cada um com `tsc` + `build` + `test` verdes):**

| Commit | Lote |
|---|---|
| `b8b0e89` | `report-filter-drawer.tsx` + `report-toolbar.tsx` + `title`/`description` aditivos no `DashboardHeader` |
| `3f3b1b7` | Relatório de Pedidos |
| `258ba8d` | Relatório de Vendas |
| `702a36d` | Relatório de Produtos |
| `d06947e` | Relatório Personalizável (pivot) + remoção do `filter-controls.tsx` |
| `1cb745b` | Correções de acabamento (escala tipográfica, altura dos gráficos) |
| `e54164f` | Acessibilidade (rótulo nos combobox, `accessibilityLayer`) + `DESIGN.md`/`HANDOFF.md` |
| `8f5db26` | Textos do filtro que prometiam mais do que o filtro faz |
| `ab905db` | Estados de carregamento/erro + correções da revisão de design |

**Medições:** `npx tsc --noEmit` 0 erros; `npm test` 37/37; `npm run build` verde em todos os
lotes. Baseline da branch tinha 3 erros de `tsc` (`Cannot find module '@/assets/*.webp'`) que
somem depois do primeiro `build` — são de tipos gerados, não de código.

> ℹ️ **A base andou durante a noite.** Saí de `45e75de`; `chore/next-improvements` ganhou depois
> o commit `bfa617f` ("fix: bg-app utility generated zero CSS"). Não toquei no
> `tailwind.config.ts`, então a mesclagem é limpa (conferido com `git merge-tree`) — mas até
> mesclar, o `bg-app` dos quatro relatórios não gera regra de fundo nenhuma, igual a todas as
> outras telas em `45e75de`. Se olhar a branch com `git diff chore/next-improvements..HEAD`, o
> `tailwind.config.ts` aparece como se eu tivesse revertido aquele commit; é artefato de comparar
> com a ponta que andou. Contra a base de verdade (`git diff 45e75de..HEAD`) são 18 arquivos e
> nenhum deles é o `tailwind.config.ts`.

**Bugs de conteúdo corrigidos junto (nenhum é cosmético):**

1. **`📊 Loading Sales Pivot Table...`** — inglês, com emoji, em produção. Virou skeleton em
   pt-BR com o formato da tabela que substitui.
2. **O filtro do Relatório Personalizável não fazia efeito.** `PivotTableClient` lia `data` só no
   inicializador do `useState`; ao aplicar um filtro a página re-renderizava em volta de um pivot
   ainda mostrando o primeiro período carregado. Agora ressincroniza por assinatura de conteúdo,
   preservando a configuração de linhas/colunas que o usuário montou.
3. **A coluna "Período" do Relatório de Vendas não ordenava.** `accessorKey: 'period'` apontava
   para um campo que `SalesByVendorRow` não tem — o botão de ordenar não reordenava nada. Agora
   usa `accessorFn` derivando `yyyy-MM`.
4. **A tabela do Relatório de Produtos tinha uma célula a mais que o cabeçalho** — o ícone de
   "ver clientes" era um `<TableCell>` solto fora das `columns`. Virou coluna de verdade.
5. **`totals.discount`** era calculado e jogado fora no Relatório de Pedidos; virou KPI.
6. **`react-pivottable`** traz CSS próprio, fixado numa paleta azul-acinzentada (Verdana,
   `#ebf0f8`, `#c8d4e3`), ignorando o tema — ilegível no modo escuro. Recebeu overrides escopados
   com os tokens do projeto.

**Achado que vale uma frente própria (não corrigido aqui):** `cn()` usa `tailwind-merge`, que
trata `text-h3`/`text-body`/`text-label`/`text-caption` como classes de **cor** e as descarta
quando estão no mesmo `cn()` que `text-text*`. Isso significa que **`CardTitle` de `ui/card.tsx`
nunca aplica `text-h3`** — em todas as telas do app, não só aqui. Contornado dentro de
`components/reports/` (o cartão de bloco renderiza o próprio `<h2>`), mas a correção de verdade é
em `ui/card.tsx`, que 5 frentes estavam tocando em paralelo nesta noite — não mexi. Ver o aviso
adicionado no `DESIGN.md` §12.

**Não verificado (sem navegador, sem humano ao vivo):**

- **Nada foi visto na tela.** O que foi medido: as 4 rotas compilam e respondem **200** em
  `next dev` na porta 8023 (checado por `fetch` em Node), sem 500 e sem erro no log do servidor;
  e o `/company/1/dashboard` — que usa o `DashboardHeader` e o `KpiGrid` que mexi — também
  continua compilando e respondendo 200. Como não havia sessão, o HTML devolvido é o do redirect
  para login: **o miolo dos relatórios nunca foi renderizado de fato**.
- **Gráficos e a tabela dinâmica não foram vistos funcionando.** Recharts saiu de
  `ResponsiveContainer` cru para `ChartContainer`; a rampa de cor por período, o tooltip em
  moeda, a legenda com muitos períodos e o pivot com Plotly precisam de um olho humano.
- **A exportação do pivot (Plotly) carrega de `https://cdn.plot.ly`** — CDN externa, herdada, não
  mexi. Se o cliente rodar em rede fechada, os renderers de gráfico do pivot não carregam.
- **Modo escuro** dos quatro relatórios não foi visto. Os tokens usados existem nos dois temas
  (conferido em `globals.css`), mas isso é leitura de código, não verificação.
- O chip de ícone verde do `KpiGrid` (`bg-[var(--glass-icon-bg)] text-[#008440]`) é escuro sobre
  escuro no tema escuro e provavelmente não passa 3:1. É **pré-existente e compartilhado** —
  dentro de `components/reports/` já saiu com `dark:text-[#35DD48]`, mas o `KpiGrid` em si não foi
  tocado nesse ponto para não conflitar com as outras frentes.

### Revisão de design ao final (skill `impeccable`, dois avaliadores independentes)

Nota inicial das 4 telas: **19/40** nas heurísticas de Nielsen. O visual estava certo; o que
puxava a nota para baixo era o que **não existia**. Corrigido nesta sessão (commit `ab905db`):

- **Não havia `loading.tsx` nem `error.tsx`** nas rotas de relatório. Clicar num relatório na
  sidebar deixava a tela anterior no ar durante toda a consulta, sem sinal de que o clique pegou;
  e uma consulta que falhava caía no `app/error.tsx` da raiz — tela cheia, sem sidebar, com
  **stack trace**. Agora há um esqueleto com o formato do conteúdo e um erro escopado que mantém
  o casco e oferece "Tentar novamente".
- **Falha disfarçada de vazio, em 3 lugares:** o drilldown de Produtos engolia erro de fetch e
  dizia "Nenhum cliente comprou este produto no período"; o pivot ficava em branco para sempre se
  a CDN da Plotly não carregasse; e as páginas mostravam o estado vazio para respostas quebradas.
- **O filtro de Produtos era uma porta de mão única.** A página estreitava a consulta pelos
  produtos selecionados e depois montava a lista de opções do filtro **a partir dessa resposta
  estreitada** — escolher um produto deixava a lista com aquele produto só, e adicionar um segundo
  exigia limpar antes. Vendas, com um controle idêntico, fazia o contrário. Uniformizado.
- **Três indicadores mentiam:** o ponto verde de "filtro ativo" ficava aceso permanentemente
  (o servidor sempre assume o ano corrente); "Limpar" apagava params que já não existiam e
  redesenhava a mesma faixa; e a faixa dizia "Recorte aplicado" onde o Dashboard, um clique ao
  lado, diz "Filtros ativos" para a mesma coisa.
- **Sem "Selecionar todos"/"Limpar" nos seletores** (exigência do `DESIGN.md` §4): escolher
  janeiro a junho custava 6 cliques.
- Foco visível nos botões crus, `role='img'` + rótulo nos gráficos, rótulos de status rotacionados
  (os nomes em pt-BR colidiam), truncamento compartilhado entre os dois gráficos que precisavam
  dele, estado vazio dentro do gráfico de Produtos, e 4 KPIs em vez de 5 (o quinto ficava órfão em
  todos os breakpoints).

**Achados fora do meu escopo — vale uma frente própria:**

1. 🔴 **`--brand-050` a `--brand-800` só existem em `:root`, nunca em `.dark`.** Conferido no
   `globals.css`. O seletor de visualização do `listing-page-header.tsx` usa
   `bg-brand-050 border-brand-100`, então **no tema escuro ele fica verde-menta claro com texto
   cinza-claro por cima — em torno de 1,5:1**. Afeta Produtos, Pedidos, Empresas, Usuários e os
   dois Dashboards, não só relatórios. Dentro de `components/reports/` desviei para os tokens de
   vidro, que têm par claro/escuro; a correção de verdade é acrescentar os valores escuros.
2. **Relatórios não conversam entre si.** Ir de Pedidos para Vendas descarta `years`/`months` e
   volta ao ano corrente — os links da sidebar em `layout.tsx` são hrefs secos. O fluxo que essas
   4 telas existem para servir (comparar o mesmo período em dimensões diferentes) é justamente o
   que não funciona. Uma faixa de abas dentro do casco do relatório, carregando os search params,
   resolveria — mas é decisão de produto, e `layout.tsx` está travado por outra frente.
3. **Nenhum relatório exporta nada.** O `ExportDock` existe e o `DashboardHeader` já aceita
   `secondaryActions`. A única superfície cujo propósito é tirar dado de dentro do sistema é a
   única sem botão de exportar.
4. **Tabelas de relatório sem `ColumnVisibilityToggle` e sem paginação.** A de Pedidos tem 8
   colunas fixas e é a única tabela do app sem seletor de colunas; um ano de pedidos renderiza
   todas as linhas num scroller só.
5. **`Relatório personalizável` não é uma tela desenhada.** É um `react-pivottable` de prateleira:
   vocabulário em inglês ("Sum", "Grouped Column Chart"), interação só por arrastar (inacessível a
   teclado), 20 campos + ~10 agregadores + ~10 renderizadores na primeira pintura, e 3,5MB de
   Plotly vindos de CDN pública. Sugestão do revisor, que acho boa: 3 predefinições
   ("Vendas por cliente e situação", "Produtos por UF", "Faturamento por condição de pagamento")
   serviriam mais gente do que a tela em branco.
6. **Gráfico de Vendas com 12 períodos** empilha 12 faixas numa rampa de um só tom — não são
   distinguíveis nesse número, e a legenda vira 12 itens. Falta dobrar o excedente em "Outros
   períodos", como já é feito com o excedente de vendedores.
7. **Gráficos com altura fixa e sem variante por breakpoint** — funcionam, mas não são responsivos
   de verdade a 360px.
8. `dashboard-header.tsx` usa `text-[#007538]`, um terceiro verde literal fora dos dois que o §12
   autoriza. O botão de fechar do `ui/dialog.tsx` anuncia "**Close**", em inglês.
9. **KPI truncado sem `title`** no `kpi-grid.tsx`: em "Produto mais vendido" e "Vendedor destaque"
   o valor é um nome, então é a resposta que fica cortada, sem texto acessível completo.

**Buraco no sistema de tokens (achado pela varredura, não corrigido):** o `DESIGN.md` §12 autoriza
`#008440` e `#35DD48` como literais, mas **nenhum dos dois existe na escala `--brand-*`** —
`--brand-600` é `#2E9E45` e `--brand-700` é `#2A7A44`, verdes diferentes. Ou seja, o verde
oficial da linguagem em cartão não é expressável por token; toda tela migrada é obrigada a
escrever o hex na mão. A correção é no `globals.css`, não nas telas.

**Nota sobre o detector de design da skill:** ele roda, mas as regras de token
(`design-system-color/font/size/radius`) **não armam neste repo** — o carregador exige
frontmatter YAML na primeira linha do `DESIGN.md`, e a linha 1 é um `#` de markdown. Então
"detector limpo" aqui significa "sem anti-padrões de slop", **não** "disciplina de token
verificada". A disciplina foi conferida por varredura: zero `text-green-*`/`bg-white`/
`text-muted-foreground` em `components/reports/` (contra 671 ocorrências no resto de `src/`) e
zero `style={{}}` inline.

**Decisão de negócio que ficou pendente (não travou a noite):** "Limpar" no recorte remove
`years` da URL, e o servidor volta a assumir o ano corrente — ou seja, "limpar" é na prática
"voltar ao padrão", nunca "sem período". É o comportamento que já existia e foi preservado, mas
se a intenção for permitir consultar **todos os anos**, `parseReportSearchParams` precisa de um
valor explícito para isso.

---

## Sessão 2026-08-16 — Fases 3 e 8: autenticação, erro/404 e Preferências do Superadmin

Branch: **`deploy/auth-erro-cartao`** (a partir de `chore/next-improvements` / `45e75de`),
worktree `Sellou2025/wt-auth-erro`. Três commits, cada um com `tsc --noEmit` + `npm run build`
+ `npm test` (37/37) limpos.

### O que entrou

**Fase 3 — autenticação, erro e 404 (7 arquivos de tela)**

- `/forgot-password` e `/reset-password/[token]` usavam um template **diferente** do `/sign-in`
  (`auth/aside-content.tsx` + `bg-white`): eram, na prática, duas telas de login distintas.
  Passaram a compor o `auth/auth-template.tsx`, o mesmo do `/sign-in`. `aside-content.tsx` foi
  apagado; a classe `.aside-content-pattern` do `globals.css` **ficou**, porque
  `admin/side-bar-company.tsx` ainda usa.
- Os dois formulários trocaram `bg-white`/`text-gray-500`/`text-green-950` por
  `bg-surface`/`text-text-muted`/`text-text`, e o layout `h-full grid grid-rows-3` (feito para
  um painel de altura cheia) virou pilha vertical, que é o que cabe na coluna `max-w-sm` do
  template. **Nenhuma linha de lógica mudou** — schema, submit, toast e tratamento de erro são
  os mesmos.
- `/forbidden` (`admin/non-authorized-page.tsx`), `app/error.tsx`, `app/not-found.tsx` e
  `app/shop/not-found.tsx` foram tokenizados. `error.tsx` manteve a estrutura de erro inteira
  (alerta, três ações, stack recolhível). `shop/not-found.tsx` ficou **neutro de propósito**:
  vive sob `/shop/*` e a loja tem decisão de acento por tenant pendente.

**Fase 8 — Preferências do Superadmin (`/settings`)**

- `shared/settings-page.tsx` saiu do `bg-gray-100` + `GenericHeaderTitle` e passou ao casco
  padrão: `bg-app` + `ListingPageHeader card` com chip de ícone e eyebrow, igual a Usuários.
- Renomeada de "Configurações" para **"Preferências"** — o item da sidebar, o breadcrumb do
  topbar e a tela equivalente da empresa já chamavam assim; só o H1 e o metadata discordavam.
- O cartão do miolo (`settings/change-password-content.tsx`) **não foi tocado**: é
  compartilhado com `company/[companyId]/settings`, que outra branch está migrando agora.

### Consertos de passagem (achados reais, medidos)

- **Logo distorcido** em `forgot-password-form` e `reset-password-form`: `next/image` forçava
  `200×200` num arquivo de `2048×743`. Agora respeita a proporção, com altura 40 (DESIGN §5).
- **`wrapper-auth`**: classe usada nas duas páginas e **nunca definida** em CSS nenhum. Sumiu
  junto com a reescrita.
- **`text-brand-700` em link no escuro**: `--brand-700` não é sobrescrito no `.dark`, dá 3.2:1
  sobre `#0F1115` (AA pede 4.5:1). Os links das telas novas usam `text-primary`, que resolve
  `--action` e cai para `--brand-600` no escuro, como manda o DESIGN §9.
- `/forbidden` ganhou a saída que o próprio texto promete ("entre com uma conta diferente") e
  o toggle de detalhes do `error.tsx` ganhou `aria-expanded`.
- **`<Link><Button>` gerava `<a><button>`** — HTML inválido e controle aninhado para leitor de
  tela. Era o padrão antigo do `not-found.tsx`; agora é `<Button asChild><Link>`, que rende um
  `<a>` só com as classes do botão. O `ui/button.tsx` já suportava `asChild`.

> ⚠️ **Armadilha de ambiente:** rodar `npm run build` com um `npm run dev` no ar **apaga o CSS
> compilado do dev** — o servidor passa a servir 404 em `/_next/static/css/app/layout.css` e as
> páginas ficam sem estilo nenhum. Não é bug do código. Reinicie o `dev` depois de qualquer
> `build`, senão qualquer conferência visual naquela porta é inválida.

### Revisão de design (skill do Claude) — o que a revisão pegou e o que virou correção

As telas passaram pela revisão de design com dois avaliadores independentes (um de crítica, um
determinístico). Nota Nielsen do conjunto: **11/40** antes das correções abaixo. O que **entrou
nesta branch**:

- **`body` tem `overflow-hidden` no `app/layout.tsx:44`** e, com `html` em `overflow: visible`,
  isso **trava a rolagem da viewport inteira**. Consequência real, não teórica: o stack trace do
  `error.tsx` (1000–3000px) era inalcançável, e no `reset-password` a 360×640 com o teclado
  aberto o botão de enviar ficava fora do alcance. Não mexi no layout raiz (arquivo global, com
  outras frentes no ar): as quatro telas de estado passaram a `h-screen overflow-y-auto`, que
  resolve dentro do meu escopo. **A correção de raiz continua devendo** — ver "não corrigido".
- **`PasswordInput` (`shared/password-input.tsx`) existia com zero consumidores** enquanto o
  `/reset-password/[token]` — a única tela onde o usuário digita, às cegas e duas vezes, uma
  senha que nunca digitou antes — ia sem botão de olho, que o DESIGN §4 exige. Agora as duas
  senhas usam o componente, e o componente ganhou o que faltava para o §4: `aria-label`
  ("Mostrar senha"/"Ocultar senha"), `aria-pressed` e alvo de 40×40 (era 20×20, sem nome
  acessível). Verificado no HTML: 2 botões com rótulo e estado, e o `for` do label continua
  casando com o `id` do input.
- **`reset-password` não tinha saída nenhuma** — sem "Voltar para o login", diferente da tela
  irmã. Ganhou.
- **Spinner empurrava a largura do botão.** As duas telas tinham `{isSubmitting && <Loading />}`
  depois do rótulo, crescendo ~32px no envio; o `/sign-in` faz o contrário (spinner troca o
  rótulo). Agora as três usam a mesma gramática — DESIGN §4, "loading mostra spinner e mantém a
  largura".
- **`error.tsx` escondia o `digest` atrás do disclosure**, junto do stack trace. O digest é a
  única coisa que serve ao suporte: subiu para dentro do alerta, como "Código do erro: …".
- Rótulos de botão que se repetiam entre duas telas diferentes ("Recuperar senha" nas duas)
  viraram "Enviar link de recuperação" e "Salvar nova senha" (DESIGN §8).
- `select-none` saiu do `/forbidden` (impedia copiar a mensagem para mandar ao administrador),
  `rounded-2xl` cru virou `rounded-lg` (token `--r-lg`), `/forbidden` ganhou `metadata` (a aba
  dizia só "Sellou") e o parágrafo do 404 encolheu de ~85ch para ~65ch, perdendo a frase que
  mandava "entrar em contato conosco" sem oferecer nenhum contato.

### 🔴 Não corrigido — precisa da sua decisão (blast radius fora desta frente)

1. **`body.overflow-hidden` no `app/layout.tsx:44`.** A correção de raiz é tirar o lock do
   `body` e deixar a rolagem para o shell autenticado, que já tem `overflow-auto` na coluna de
   conteúdo (`(sellou)/layout.tsx`). Toca todas as telas do app — não fiz.
2. **Alvos de toque abaixo do mínimo, em todo o app.** `ui/button.tsx:20` é `h-10 md:h-9`
   (40px no mobile, 36 no desktop); DESIGN §11.3 pede 44×44 e §4 pede 48 no primário de
   formulário. `ui/input.tsx` é `h-12 md:h-9` contra os 52 do §4.
3. **Contraste do botão primário no escuro: 3.20:1.** `--action` cai para `--brand-600`
   (`#2E9E45`) e o rótulo é `#f8f7eb`. AA pede 4.5:1. Atinge todo botão primário do app.
4. **Foco fora do padrão.** `ui/button.tsx:8` usa `focus-visible:ring-1` sem offset; o DESIGN
   §2.5 manda `outline: 2px solid var(--brand-600); outline-offset: 2px`.
5. **`prefers-reduced-motion`: zero ocorrências no projeto inteiro** (§1.5 e §11.7 exigem).
   O spinner do `components/loading.tsx` gira incondicionalmente.
6. **`ToastContainer` (`app/layout.tsx:47`) sem props** — o react-toastify fica no tema claro
   mesmo com o app no escuro, e o toast nasce no canto superior direito, que é o ponto mais
   longe do polegar. Hoje o toast é o **único** feedback de sucesso do `/forgot-password`.
7. **Negação de permissão destrói o shell.** `(sellou)/layout.tsx:61` e
   `company/[companyId]/layout.tsx:97` devolvem `<NonAuthorizedPage />` **no lugar** do layout,
   então o usuário perde sidebar e topbar — §11.2 pede navegação em todos os tamanhos.
8. **`shop/not-found.tsx` continua sem nenhuma ação** (§4 e §11.6 pedem "título curto + uma
   ação"). Mantive sem, porque a instrução era não mexer na loja além das cores — mas neutro
   não deveria significar beco sem saída.
9. **As quatro telas de falha ainda são quatro arquivos sem componente comum.** A revisão
   sugere `shared/state-screen.tsx` com prop `tone` — o que também absorveria a decisão
   pendente de "cartão ou sóbrio" numa mudança de um arquivo só, em vez de quatro.
10. **`/reset-password/[token]` valida só `min(8)`**, enquanto a tela irmã de troca de senha
    exige 5 critérios; e o erro do servidor é escrito no campo `passwordConfirmation`,
    culpando o campo errado. É **lógica de formulário** — fora do "moldura nova, miolo
    intocado" desta fase, mas é o achado de UX mais sério que sobrou.
11. **`/forgot-password` não tem estado de sucesso na página** e o token do
    `/reset-password/[token]` só é validado no submit (a rota devolve 200 com formulário vivo
    para qualquer token). São mudanças de fluxo, não de casca.

### 🔴 Três classes que compilam e não pintam nada (achado transversal, decisão do dono)

Confirmado lendo o CSS gerado em `.next/static/css` e o HTML renderizado — não por leitura de
código. Não corrigi nenhuma das três: as correções são de arquivo compartilhado e mudariam de
uma vez telas que estão nas mãos de outras frentes agora.

1. **`bg-app` não gera regra CSS.** Em `tailwind.config.ts:26` a cor se chama `'bg-app'`, então
   a utilitária é `.bg-bg-app`. São **14 usos** de `bg-app` em `src/` — Produtos, Usuários,
   Empresas, os dois Dashboards, Pedidos, `product-form`, `order-form`, o `auth-template` e as
   telas desta fase — todos herdando o fundo do `body`. A prova de que o nome é esse: o token
   irmão está escrito certo em `admin/side-bar.tsx:169`, como **`bg-bg-sidebar`**, e esse
   aparece no CSS gerado. Hoje passa despercebido porque `--background` e `--bg-app` coincidem
   nos dois temas. **Correção (aditiva, não quebra nada):** acrescentar `app: 'var(--bg-app)'`
   em `theme.extend.colors` — aí as 14 chamadas passam a valer sem tocar em nenhuma tela.
2. **`bg-brand-050`, `border-brand-200` e `bg-brand-300` não geram regra.** A escala declarada
   é `50/100/500/600/700/800`. Ficam sem fundo: o grupo do seletor de visualização
   (`shared/listing-page-header.tsx:141`), o chip de ícone do KPI
   (`shared/dashboard/dashboard-kpi.tsx:28`), `shared/searchable-select.tsx:126`,
   `shared/record-page-layout.tsx:94,103`, o chip "ACESSO À PLATAFORMA" do
   `auth/sign-in-form.tsx:89` e os dois bullets de check do `auth/auth-template.tsx:30,38`.
   **Correção:** escrever `bg-brand-50`, ou declarar os apelidos `050/200/300` na config.
3. **`cn()` descarta um dos dois `text-*`.** `cn` é `twMerge(clsx(...))`; o tailwind-merge não
   sabe que `text-h1`, `text-h3`, `text-caption`, `text-label`, `text-body` e `text-eyebrow`
   são tamanhos e os coloca no mesmo grupo de `text-text`/`text-text-muted`/`text-brand-700`,
   mantendo só o último. Medido: `ui/card.tsx` renderiza `<div class="text-text">Segurança</div>`
   — o `text-h3` do `CardTitle` some, e o `text-caption` do `CardDescription` também. Isso
   atinge **todo Card do app**. **Correção de raiz, um arquivo (`src/lib/utils.ts`):**
   ```ts
   import { extendTailwindMerge } from 'tailwind-merge'
   const twMerge = extendTailwindMerge({
     extend: { classGroups: { 'font-size': [{ text: ['display','h1','h2','h3','metric','metric-frac','body','label','caption','eyebrow'] }] } }
   })
   ```
   ⚠️ **Não apliquei porque isso devolve o tamanho pretendido a muitos títulos de uma vez** —
   é mudança visual ampla, em telas de outras frentes, e precisa do seu olho antes de subir.

### ❓ Pergunta aberta (bloqueia fechar o bloco de autenticação)

**`/sign-in` e o `AuthTemplate` adotam a linguagem em cartão ou ficam no padrão sóbrio?**
Enquanto não houver resposta, as telas de recuperação de senha seguem o sóbrio — que é o que
garante que elas e o login sejam a mesma tela. Se a resposta for "cartão", as três migram
juntas, num lote só (metade nova + metade antiga lê como quebrado, DESIGN §12).

### Não verificado / limites honestos

- **Sem navegador.** Nada foi conferido a olho. O que foi medido: `tsc`, `build`, `npm test`,
  as rotas respondendo 200/404 sem `__next_error__` num `npm run dev` na porta 8021, o HTML
  renderizado das telas que fazem SSR, e a existência de cada classe Tailwind no CSS gerado.
  `error.tsx` e `/settings` não entregam o miolo no SSR (boundary de cliente / layout preso na
  sessão) — foram renderizados fora do Next, com `react-dom/server`, para conferir o HTML.
- **`/shop/[fantasyName]/forgot-password` não foi visto renderizado**: o layout da loja depende
  do backend para resolver o tenant e o backend não estava no ar. A rota responde 200 e o
  contrato de props (`pathname`, `hideLogo`, `className`) foi preservado, mas o cartão da loja
  ficou sem o `bg-white`/`p-10` que o `<form>` aplicava — vale um olhar quando o back subir.
- **`settings/change-password-form.tsx:26`** ainda tem `text-gray-500` nos critérios de senha
  já atendidos. É o miolo compartilhado com `company/[companyId]/settings`, arquivo de outra
  frente — deixei para quem estiver naquela branch, é troca de uma linha para `text-text-muted`.
- **`ui/screen-loading.tsx`** (`bg-gray-50`, `text-green-950`) e o `variant='link'` do
  `ui/button.tsx` (`text-gray-950`) continuam fora dos tokens. Não são desta fase.
- **`next build` imprime `⨯ ESLint: Failed to load config "prettier"`** e pula o lint:
  `eslint-config-prettier` não está no `package.json` nem no `node_modules`. Pré-existente, o
  build passa mesmo assim.

---

## Sessão 2026-08-15 (continuação) — Topo do Dashboard da Empresa migra para o cartão

Branch: `chore/next-improvements`. O dono viu a tela ao vivo (logado como `joao.silva@alfa.com`,
já que não tem acesso ao `/dashboard` do Superadmin) e apontou o topo inteiro (cabeçalho,
"Aba atual"/"Exportar", painel "Filtros") como fora do padrão. Plano completo em
`~/.claude/plans/luminous-dancing-stroustrup.md`.

**Achado que já era esperado, mas confirmou-se real: `shared/filter-drawer.tsx` (usado por
Produtos, Pedidos, Empresas e Usuários) tinha um bug de rolagem** — `SheetContent` não era
`flex flex-col`, então o miolo `overflow-y-auto` nunca ativava. Com poucos campos não aparecia;
com os 7 campos deste dashboard, o rodapé "Aplicar/Limpar" cairia fora da tela em janela baixa.
Corrigido no componente compartilhado, verificado nas 5 telas (screenshot confirma rodapé visível
e rolagem funcionando em `/company/1/dashboard`).

**O que mudou:**
- `DashboardHeader` ganhou `onFilterClick`/`filterCount`/`secondaryActions` (aditivo — o Dashboard
  do Admin não passa essas props, continua idêntico).
- `ExportDock` virou um botão único com `DropdownMenu` (Painel completo / Somente a aba atual,
  com o nome certo agora / Relatórios), em vez de 2 `Select` soltos. **Corrigido de passagem: a
  exportação ignorava os filtros ativos** — o backend já aceitava (`@Query(DashboardQueryPipe)`
  no `dashboard-tables.controller.ts`, mesmos 8 params que os GETs usam), só o front não
  encaminhava. 100% frontend, sem deploy de backend.
- `company-dashboard-filters.tsx` (os 7 campos, ~1080 linhas) manteve toda a lógica de
  estado/fetch/URL intacta — só o container mudou, de painel inline recolhível para
  `FilterDrawer`. Corrigido de passagem: o `useEffect` de ressincronização não limpava
  mês/ano/clientes/vendedores/gerentes quando o param sumia da URL (Voltar do navegador ficava
  com seleção presa); as 6 listas agora só carregam na primeira abertura do drawer, não no load
  da página inteira; os 6 combobox ganharam busca (`CommandInput`, faltava).
- Novo `CompanyDashboardToolbar` (orquestrador) + `CompanyDashboardFilterSummary` (faixa
  "Filtros ativos: X" que só aparece com filtro na URL, substituindo os badges antigos que
  contavam a seleção pendente em vez da aplicada).
- `DashboardTabNav` ganhou visual em cápsula — achou um bug real nesse retoque: `overflow-x-auto`
  removeu a proteção de tamanho mínimo automático do item flex, colapsando o `<nav>` a 10px
  (texto certo no DOM, invisível na tela). Corrigido com `min-h-[52px]` explícito no `<nav>`.

**Verificado:** `tsc --noEmit`, `npm run build` e `npm test` (37/37) limpos; e ao vivo no
navegador, logado como `joao.silva@alfa.com` em `/company/1/dashboard` — cabeçalho em cartão,
abas em cápsula, drawer abrindo/rolando/aplicando (testado: filtrar por 2 estados mudou
Faturamento de R$253.513 para R$141.193, confirma que o filtro chega até os dados), badge de
contagem no botão, faixa de resumo, "Limpar". Regressão do `FilterDrawer` conferida em Produtos
(abre normal, sem quebra estrutural).

**Não verificado / achado sem fechar:**
- **Exportar com filtro ativo não foi clicado de verdade** — dispara download de arquivo, ação
  que não faço sem pedido explícito no momento. Falta confirmar que o CSV baixado reflete o
  filtro (a correção do código está feita e o mecanismo foi conferido lendo o backend).
- **Modo escuro do `FilterDrawer` deu resultado contraditório**: a captura de tela mostra o
  painel branco mesmo com o app em modo escuro, mas `getComputedStyle` no DOM confirma
  `background-color: rgb(15,17,20)` (o valor escuro correto) no mesmo elemento. Reproduzido
  também em Produtos — **é pré-existente, não foi introduzido nesta sessão** (não mexi em cor no
  `filter-drawer.tsx`, só em `flex`/`overflow`). Não sei dizer com confiança se é bug real de
  renderização ou artefato da ferramenta de captura remota — precisa de um humano olhando a tela
  de verdade antes de tratar como bug ou como não-bug.

---

## Sessão 2026-08-15 (continuação) — Imagens leves: otimizador nativo + motor de crop/resize

Branch: `chore/next-improvements` (front, commits `084e18e`/mais um a seguir), branch própria no
back (`feat/accept-webp-uploads`, commit `c63141b`). Plano completo em
`~/.claude/plans/luminous-dancing-stroustrup.md`.

**Pedido do dono**: "as imagens estão muito grandes" + "são fotos que podemos atualizar no
futuro" (dá pra tratar agressivamente) — com um pedido explícito de portar o componente de
crop/resize que já existe no beta (`_Sellou/packages/ui/.../envio-de-imagem`). A investigação
achou que eram **dois problemas independentes** e dois bloqueadores reais:

1. `/_next/image` estava desligado em **14 arquivos** (`unoptimized`) + 1 `loader` customizado
   equivalente — uma miniatura de 48px baixava o arquivo original inteiro.
2. Fotos de Produto (5-12MB) subiam cruas pro Wasabi — só um teto de 5MB no client, sem
   compressão nenhuma; a logo da Empresa não tinha limite nenhum.
3. **Bloqueador**: o backend rejeitava `image/webp` com 400 (`FileContentType` só tinha
   Png/Jpg/PDF) — bug pré-existente, a dropzone já anunciava "PNG, JPG ou WEBP".
4. **Bloqueador**: a CSP do projeto (`script-src` sem `worker-src`/`blob:`) bloquearia o Worker
   se portado do jeito que o beta faz (via `Blob` — necessário lá porque `@sellou/ui` compila
   com `tsc` puro, sem bundler). Aqui, `new Worker(new URL(...))` nativo do webpack resolve sem
   tocar na CSP — confirmado no bundle de produção (chunk próprio, mesma origem).

**Fases 0b + 0 (vitória retroativa) + 1 (motor automático) + 2 (recorte interativo) — todas
fechadas nesta sessão**, com o dono aprovando escopo completo de uma vez:

- **0b** — `FileContentType.Webp` adicionado (backend).
- **0** — `sharp` instalado, `unoptimized`/loader removidos em 15 pontos com `sizes` derivado
  do container real, `minimumCacheTTL` de 30 dias, 3 usos da API legada do Next 12
  (`layout='fill'`) migrados, vazamento de blob da logo corrigido de passagem.
- **1** — `crop-plan.util.ts` (geometria pura, 13 testes portados do beta, todos verdes),
  `image-processing.worker.ts` + `.util.ts` (Worker + `OffscreenCanvas`, WebP com fallback de
  formato, HEIC tratado como foto de verdade, 3 degraus de fallback), integrado em Produto
  (fila sequencial, `clientKey` estável) e Logo.
- **2** — `image-crop-dialog.tsx` (arrastar + zoom, mesma geometria da Fase 1, sem lib nova),
  botão "Ajustar" em cada foto de Produto e ao lado da Logo. Precisou de um campo novo
  (`originalFile`/`originalLogoFile`) para reprocessar sempre a partir do arquivo bruto, nunca
  de um resultado já cortado.

**Pelo meio, o dono pediu explicitamente componentização** ("crie como um componente
reutilizável") — resultado: `useImageProcessingQueue` (mesmo hook em Produto e Logo, não uma
cópia por tela) e `ImageUploadPreview` (overlay de processando/falha compartilhado). Padrão
registrado em `[[padroes-de-componente-reutilizavel]]`.

**Achado lateral corrigido**: `uploadFileToAws` monta a chave S3 com o nome do arquivo cru, sem
encoding — um arquivo com espaço/acento gravava URL quebrada no banco. Como a Fase 1 já renomeia
o arquivo, o nome também é slugificado ali (só corrige uploads novos).

**Verificado**: `tsc --noEmit` limpo, `npm run build` limpo em cada fase (chunk do Worker
confirmado no bundle final), `npm test` 33/33 (20 pré-existentes + 13 novos da geometria).
**Não verificado ainda**: navegador real (upload de fotos grandes, HEIC de iPhone, arrastar
durante processamento, o diálogo de recorte em touch/teclado) — só HTTP/build/testes até aqui.

---

## Sessão 2026-08-15 (continuação) — Dashboard, Empresas e Usuários migram para o cartão

Branch: `chore/next-improvements`. Plano completo em
`~/.claude/plans/luminous-dancing-stroustrup.md`.

**As 3 telas do painel Administrador que ainda estavam no visual sóbrio (prints trazidos pelo
dono) foram migradas para o padrão em cartão de Produtos** — Dashboard, Empresas e Usuários.
Passo 0 preparou o terreno compartilhado antes de tocar em qualquer tela:

- `shared/listing-page-header.tsx` — busca e toolbar agora são condicionais (só renderizam se
  `onSearch`/`onFilterClick`/etc. forem passados). Antes, o `Input` de busca era incondicional;
  usar `card` sozinho (caso do Dashboard, que não tem lista) deixava uma caixa de busca órfã.
  Produtos e Pedidos não mudam (sempre passam `onSearch`).
- **Bug real corrigido em `admin/advanced-filter.tsx`** (compartilhado por Produtos, Pedidos,
  Empresas e Usuários): `updateURL` apagava o parâmetro `sort` da URL sempre que nenhuma condição
  de filtro carregava ordenação própria — mesmo quando o `sort` tinha vindo de um clique em
  cabeçalho de coluna, fora do domínio do `AdvancedFilter`. Cenário: ordenar por uma coluna, abrir
  o filtro, aplicar uma condição → a ordenação sumia sem aviso. Já existia (e ainda existe como
  comportamento, só que agora correto) em Produtos; ao dar ordenação por cabeçalho a Empresas e
  Usuários, o mesmo bug nasceria nelas também. Corrigido preservando o `sort` quando ele não
  pertence a nenhuma das condições sendo reescritas.
- Novo `shared/advanced-filter-drawer.tsx` (wrapper genérico do `AdvancedFilter embedded` dentro
  do `FilterDrawer`, usado por Empresas e Usuários — Pedidos mantém wrapper próprio por injetar
  selects de mês/ano) e dois hooks novos para não duplicar pela 3ª/4ª vez:
  `hooks/use-url-sorting.ts` (ordenação server-side controlada pela URL — o jeito certo, que
  Pedidos hoje não faz apesar de parecer visualmente) e `hooks/use-delayed-url-search.ts` (busca
  com debounce, com o bug de reset de página corrigido: Produtos/Pedidos mantêm `page` intacto ao
  buscar e podem renderizar lista vazia buscando a partir da página 3+ — não retrofitado agora,
  fica de dívida).

**Achado lateral corrigido de passagem:** `companies-field-mapping.ts` tinha `corporateName`
rotulado "Nome Fantasia" e `fantasyName` rotulado "Razão Social" — trocados, e o erro ficaria
visível no drawer novo.

**Dashboard:** `DashboardHeader` (compartilhado com o Dashboard da Empresa) ganhou props opcionais
`card`/`icon`/`eyebrow`, preservando o branch sóbrio original byte a byte quando `card` é falso —
o Dashboard da Empresa não foi tocado.

**Empresas e Usuários:** cada uma virou `AdminCompanies`/`AdminUsers` (container cliente) +
página server delegando; `CompanyTable`/`UsersTable` ganharam `ColumnVisibilityToggle` (persistido
em `localStorage`) e ordenação por cabeçalho de coluna server-side real; `CompanyRowOptions`/
`UserRowOptions` trocaram o `DropdownMenu` por `RowActionButton` em linha (Empresas manteve
"Acessar" com texto — troca de domínio inteiro, regra do `DESIGN.md` §4); Status virou
`StatusBadge` (cápsula) nas duas telas. Em Usuários, a coluna "Perfil de Acesso" fica oculta por
padrão (`extraColumnIds`) porque o backend (`GET /user`) força `role=ADMINISTRATOR` — a coluna é
constante hoje; escondida, não removida. `companies-header.tsx`/`create-company-button.tsx` e
`users-header.tsx`/`create-user-button.tsx` foram removidos (absorvidos pelo header + container,
mesmo movimento já feito em Produtos).

**Verificado:** `npx tsc --noEmit` limpo e `npm run build` completo (20 rotas, incluindo
`/dashboard`, `/companies`, `/users`) sem erro — só o aviso pré-existente de ESLint
(`eslint-config-prettier` ausente, dívida já registrada, não é desta sessão).

**Não verificado ainda — pendente de navegador real:** clicar de fato nas 3 telas (claro/escuro,
320-1440px, ordenar→filtrar preservando a ordenação, `localStorage` de colunas, teclado). Só HTTP/
build foram provados até aqui.

---

## Sessão 2026-08-15 — Produtos + nova linguagem visual

Branch: `feature/dashboard-visual-redesign` (criada a partir de `chore/front-deploy-workflow`).
Trabalho **não commitado** no fim da sessão — commitar antes de qualquer coisa.

### Frontend

- **Nova linguagem visual em cartão** — `ListingPageHeader` ganhou props opcionais
  `card`/`icon`/`eyebrow`. **Sem elas o componente renderiza o visual sóbrio de antes**, que é o
  que mantém as telas não migradas intactas. Ligada em Produtos e Pedidos.
- **Tela de Produtos** reconstruída: tabela com ordenação server-side, colunas configuráveis
  (salvas em `localStorage`), ações em linha, cards em grade até 5 colunas, drawer de filtros,
  modal de visualização com carrossel de fotos, formulário com imagens arrastáveis.
- **Componentes novos reutilizáveis:** `ProductStockBadge`, `ProductViewModal`,
  `ProductsFilterDrawer`, `SortableProductImages`, hook `usePersistedViewMode`.
- **Modo escuro** — varredura convertendo cores fixas para tokens nos arquivos desta sessão.
  Adicionados 5 tokens `--glass-*` em `globals.css` (par claro/escuro).
- **Removidos:** `products-header.tsx`, `create-product-button.tsx`,
  `product-stock-row-options.tsx` (absorvidos por componentes compartilhados).

### Backend

- `buildSortQuery` (compartilhado por ~19 services) ganhou parâmetro opcional `model`. Quando
  informado e o campo é texto, ordena por `unaccent(lower(campo))` — sem isso, acentos vão para
  o fim da lista (Água/Álcool depois de Teclado). **Só Produtos passa o model hoje**; os demais
  services seguem com o comportamento antigo.
- Ordenação por categoria (relação N:N) via subconsulta correlacionada em `products.service.ts`.
- `order: [['photos','id','ASC']]` nos includes de foto — a ordem define capa e carrossel.

### ⚠️ Pendências e riscos desta sessão

Revisão de código (Opus) rodada em 2026-08-15 antes de fechar a branch. O que ela achou de
grave já foi corrigido; o que sobrou está listado abaixo.

**🔴 Antes do deploy — obrigatório**

1. ~~**Extensão `unaccent` não tem migration.**~~ **✅ Concluído em 2026-08-15.** Rodada e
   verificada em produção via SSH (`CREATE EXTENSION IF NOT EXISTS unaccent;` — `docker compose
   exec db psql`), confirmada com `SELECT extname FROM pg_extension` e teste funcional
   (`unaccent('Água') = 'Agua'`). O projeto **não tem sistema de migrations** (sem
   `sequelize-cli`, sem `umzug`, sem pasta `migrations/`), então isso precisa ser refeito à mão em
   qualquer outro ambiente (staging novo, disaster recovery).

**🟡 Resolver em seguida**

2. **`unaccent(lower())` não é indexável** — a função é `STABLE`, não `IMMUTABLE`, então
   `CREATE INDEX` falha. Toda ordenação por texto vira varredura sequencial. Invisível com 15
   produtos, problema com catálogo real. Saída: função wrapper `IMMUTABLE` + índice de expressão.
   Mesma dívida já registrada para o `iLike` da busca.
3. **ESLint quebrado** — `.eslintrc.js` estende `prettier`, que não está instalado; `npm run lint`
   falha. Ou seja, **nada desta sessão passou por lint**. `npm i -D eslint-config-prettier` resolve.
4. **`favorite DESC` vem antes da ordenação escolhida** (`products.service.ts`, pré-existente).
   Hoje invisível — não há produtos favoritados no dev. Em produção com favoritos, ordenar por
   preço vai parecer quebrado. Decidir: documentar como intencional ou mover para depois do sort.
5. **Ordem das fotos não tem coluna no banco.** Depende do backend apagar e recriar as fotos na
   ordem enviada. Se essa lógica mudar, a ordem se perde sem aviso. Blindagem: coluna de posição
   em `ProductPhotos`.
6. **Bug no `Dialog` compartilhado:** `h-full` abaixo de 1280px faz modais simples esticarem para
   a tela toda. Contornado só em `remove-product-modal.tsx`; outros modais de confirmação do app
   provavelmente sofrem o mesmo em telas estreitas.
7. **Dashboard da Empresa está pela metade** — KPIs e tabelas na linguagem nova; cabeçalho, abas
   e filtros no visual antigo. O estado intermediário lê como quebrado; migrar a tela inteira.
8. **Duas linguagens visuais convivendo** — 2 de 25 telas migradas; 23 ainda usam
   `GenericHeaderTitle` (ver `DESIGN.md` seção 12).

**🟢 Quando sobrar tempo**

9. `coverage-map.tsx` é código morto confirmado (zero importadores) e carrega 3 dependências
   inúteis: `leaflet`, `react-leaflet`, `@types/leaflet`. `company-dashboard-header.tsx` também
   nasceu nesta sessão e nunca foi ligado. Apagar ambos.
10. 36 hex fixos da marca (`#008440`, `#35DD48`) em 10 arquivos. Defensável para cor de acento,
    mas inconsistente: como os `--glass-*` viraram token, o verde é justamente o que não dá para
    re-tematizar. Considerar `--brand-green` / `--brand-green-bright`.

### Sem cobertura de teste

Os dois repos **têm** infraestrutura (back: Jest, 18 suítes / 171 testes — todos passando;
front: Vitest, 3 arquivos). Nada desta sessão veio com teste. Maior valor, em ordem:

1. **`buildSortQuery`** — função pura, protege o raio de 19 services. Garantir que a chamada com
   1 argumento continua idêntica e que só campos de texto ganham o `unaccent`.
2. **Ordem padrão da listagem de produtos** — teria pego na hora o bug de ordenação abaixo.
3. **`ProductStockBadge`** — 4 ramos de render + a flag `hideInactiveState`, usado em dois lugares.

### Corrigido durante a revisão

- **🔴 Ordenação das fotos vazou para a ordenação do catálogo.** O `order` de fotos foi parar no
  nível da consulta principal, fazendo a lista de produtos ser ordenada pelo menor id de foto.
  Como salvar um produto apaga e recria suas fotos, **cada edição empurrava o produto para o fim
  do catálogo**. Corrigido com `separate: true` no include (consulta própria para as fotos).
  Verificado: ordem do catálogo estável, fotos ainda ordenadas, paginação sem duplicatas.
- Imports não usados (`ListingViewMode` em dois arquivos).
- `text-gray-950` restante em `insert-product-stock-modal` e `stock-movements-modal`.
- Id de arraste das fotos passou a usar `photoId` quando existe — duas fotos com a mesma url
  colidiriam e travariam o arraste.

### Ambiente — descobertas

- **Chrome do usuário não salva cookies de `localhost`** (nem em aba anônima). O login falha
  silenciosamente e volta para a tela de entrada, parecendo senha errada. **Não é bug do código**
  — backend e fluxo NextAuth verificados por chamada direta. Testar no **Safari**.
- Postgres local: container `sellou2025-postgres` (porta 5434), `docker start` se preciso.

---

## ⚠️ Risco de negócio (grave, decisão pendente)

**Pedido pode ser editado em qualquer status, inclusive Faturado/Expedido/Entregue — sem trava em lugar nenhum.**

- Front: nenhum lugar checa `order.status` antes de abrir a edição (`orders-table.tsx`, `order-card.tsx`, `order-form.tsx`)
- Back: `PATCH /orders/:id` só valida autenticação. Ao salvar, **apaga e recria todos os itens** e recalcula `totalValue`, sem olhar status
- Não há campo de nota fiscal na entidade — "Faturado" é rótulo interno do Kanban, sem documento fiscal vinculado. Risco é de auditoria/negócio, não de corromper fiscal

**Caminho:** decidir política (bloquear tudo após Faturado? liberar só observação?) e aplicar **no backend primeiro** (front sozinho não protege). Guard no `updateOrder` por status + espelhar no front desabilitando campos.

---

## Melhorias de UX para representantes/vendedores (investigado 2026-08-14)

Itens 1, 2 e 5 do diagnóstico **já implementados** (busca server-side, duplicação irrestrita, histórico de compra no seletor). Os abaixo ficaram para depois:

### Sem suporte offline (impacto alto)
`manifest.json` tem `display: standalone` + ícones → o celular oferece "instalar", mas **não existe service worker**, nem `next-pwa`/Workbox/Serwist, nem IndexedDB. O rep instala, entra no depósito do cliente sem sinal, e o app fica em branco.

**Caminho:** não precisa ser offline completo. Cachear catálogo + carteira do rep e permitir **rascunho de pedido offline que sincroniza depois** resolve a maior parte. Avaliar `serwist` (sucessor mantido do `next-pwa`) + IndexedDB (`dexie`) para fila de sincronização. Cuidado com conflito: pedido criado offline precisa de id temporário e reconciliação no sync.

### Rotas/visitas e Pedidos são ilhas (impacto alto)
Existem `my-routes`, `routes`, `my-goals`, mas **nenhuma referência a `tripId`/`visitId` em pedido** (grep confirmou). O rep em visita não cria pedido a partir dela, e a visita não registra que gerou venda. Perde-se a métrica-chave do propagandista: **conversão visita→pedido**.

**Caminho:** adicionar `tripId`/`visitId` opcional na entidade Order (migration), botão "Criar pedido" dentro da visita passando o contexto, e exibir pedidos gerados na tela da visita/rota. Depois disso dá pra ter relatório de conversão.

### Meta invisível durante a venda (impacto médio)
`my-goals` é tela separada. O rep não vê "faltam R$ 3.200 pra bater a meta" enquanto monta o pedido — que é justamente quando essa informação muda o comportamento dele (sobe mix, oferece mais um item).

**Caminho:** widget compacto de progresso de meta no resumo lateral do formulário de pedido, reaproveitando os dados que `my-goals` já busca.

---

## Pendências técnicas

- **Arrasto do Kanban precisa de um teste manual.** O card do Kanban foi unificado com o da grade
  (`kanban-card.tsx` virou wrapper de `useSortable` sobre `OrderCard`). Verificado estaticamente que
  o caminho do drop está intacto: `handleDragEnd`/`canMoveStatus`/`updateOrderStatus` não foram
  tocados no commit `a44c400`, e `useSortable({id: order.id, data: {order, type:'Order'}})` continua
  idêntico. O arrasto **ativa** (o card fantasma aparece). Mas nem `left_click_drag` nem eventos de
  ponteiro sintéticos completam o drop — limitação conhecida do `dnd-kit`, cuja detecção de colisão
  não é alimentada por eventos sintéticos. **Fazer um arrasto manual entre colunas antes de fechar.**
- **Modo escuro incompleto fora de Pedidos/Dashboard.** Já corrigidos: `badge.tsx` (causa-raiz — `text-foreground` era hardcoded `#1A1A1A` no `tailwind.config.ts`), `select`, `multi-select`, `textarea`, status de pedido e crédito (agora via tokens em `globals.css`). Ainda restam ~24 arquivos com `bg-white`/`text-gray-*` fixos — rodar `grep -rl "bg-white\b" src --include="*.tsx"` para a lista atual. Padrão de correção: trocar por `bg-surface`/`text-text`/`border-border`.
- **Filtro de categoria do seletor de produtos continua client-side.** A busca virou server-side, mas
  a categoria filtra dentro dos resultados já retornados, não do catálogo inteiro. Ex.: buscar
  "detergente" e filtrar categoria restringe entre os ~30 resultados, não entre todos. Não é
  regressão (antes tudo era client-side dentro de 100 itens), mas é inconsistente — resolver quando
  essa tela for mexida de novo, mandando a categoria como parâmetro junto da busca.
- **Para reconferir o teto de catálogo, é preciso recriar dados de escala.** Os 150 produtos / 60
  clientes usados para provar a correção foram removidos (o banco voltou ao seed: 15 produtos / 5
  clientes) para não poluir testes concorrentes. Recriar inserindo linhas nomeadas
  `Produto Escala NNN` / `ClienteEscala NNN` — `Customers` exige `phoneNumber` e `email`.
- **Aviso de ref no `InputCurrency`** (`Controller` do react-hook-form passando ref pra componente sem `forwardRef`) aparece no console das telas de pedido. Pré-existente, não introduzido no redesign.

---

## ⚠️ Integridade do valor do pedido (grave — o mais sério achado até agora)

Três problemas encadeados. Isolados já são ruins; juntos, o valor de uma venda histórica não é estável.

**1. `OrderItem` não guarda o preço praticado.** Colunas: `quantity`, `discount`, `orderId`,
`productId`. Não há preço unitário. Logo, o detalhamento por item é sempre renderizado com o preço
**atual** do produto — não existe registro do que foi de fato cobrado naquela linha.

**2. O total é recalculado a partir do preço atual.** `Order.totalValue` é coluna persistida
(snapshot na criação), mas `calculateTotalOrderValue()` usa `product.price` e é chamado no update
(`orders.service.ts:1227`), e `recalculateOrderTotal()` roda em split/faturamento (1434, 1534).
Se o preço do produto mudar e o pedido for editado depois, o `totalValue` é **reescrito com o preço
novo**, alterando silenciosamente o valor de uma venda passada.

**3. Somado à ausência de trava por status** (ver seção acima — pedido é editável mesmo Faturado/
Entregue), um pedido já entregue pode ter seu valor alterado sem intenção.

**Preço de tabela do cliente também não chega aqui.** Existe motor completo (`pricing.service.ts`:
`calculateEffectivePrice()`, `findApplicablePriceTable()` com score de regras, preço manual por item),
consumido por `products.controller.ts` (vitrine) e `price-tables.controller.ts` (admin) — mas
`orders.service.ts` **não o importa** (grep: zero). Todos os totais usam `product.price` (linhas 697,
713, 789, 1362, 1384, 1409, 1451, 1485). Ou seja: o preço exibido no catálogo pode divergir do
gravado no pedido, na loja **e no formulário do representante**.

**Verificado em código; não reproduzido empiricamente.** Falta o teste: mudar o preço de um produto,
editar um pedido antigo que o contenha, e observar o `totalValue` mudar.

**Caminho (ordem importa):**
1. Adicionar `unitPrice` (e talvez `priceTableId`) em `OrderItem` via migration, **congelando** o preço
   no momento da venda. Backfill dos existentes com o preço atual do produto — imperfeito, mas é a
   única informação disponível hoje.
2. Trocar os cálculos para usar `orderItem.unitPrice` em vez de `product.price`.
3. Injetar `PricingService` no `OrdersService` para resolver o preço correto (tabela do cliente) no
   momento da criação/edição, e gravar o resultado no `unitPrice`.
4. Só então a trava por status faz sentido completo.

---

## Loja do cliente (`/shop/[fantasyName]`) — diagnóstico, tratar no futuro

**Bloqueador: nenhum cliente consegue logar.** `auth.service.ts:66-69` barra login quando
`getCompaniesForLogin()` volta vazio (isentando só ADMINISTRATOR); essa função lê apenas a tabela
`UserCompanies`; e `users.service.ts:62-100` (`createUser`) grava `User.companyId`/`customerId` mas
**nunca cria a linha em `UserCompanies`**. Confirmado no banco: 3 usuários CUSTOMER_CLIENT, 0 com
vínculo. Reproduzido: login devolve 401 `UNA001`. Não é problema de seed — o fluxo real
(`request-access` → aprovar) cai no mesmo buraco. Existe `migrate-user-companies.ts`, mas não é
chamado de lugar nenhum.

**Lacunas B2B:** sem "repetir pedido" no histórico; sem limite de crédito visível (o representante
vê, o cliente não); área da conta só tem "Meus Pedidos" e "Alterar Senha".

**Está bom, não mexer:** busca e paginação da vitrine são **server-side com scroll infinito**
(`product-grid.tsx:113-147`) — a loja não tem o teto de 100 produtos do formulário interno; preço
oculto para deslogado; janela de data de entrega vinda do `orderSetup`; bloqueio de cliente inativo
no checkout; estados vazios contextuais.

**Visual:** zero tokens do design system (`grep bg-surface|text-text|border-border` em
`components/shop*` → 0). 31 cores fixas em 8 arquivos (`category-drawer`, `shop-header`,
`category-sidebar`, `sign-in-form`, `request-access-form`, `product-skeleton`, `checkout-skeleton`,
`shop/not-found`). O modo escuro funciona melhor que o esperado porque a loja herdou a
retokenização de `card`/`badge`/`button` feita nesta sessão.

---

## ❓ Limite de crédito do cliente — comportamento a esclarecer

`updateCustomerCreditLimitUsed` (`orders.service.ts`) é chamado em **apenas dois** lugares:

| Método | Ajusta crédito? |
|---|---|
| `createOrder` (828-934) | ❌ não |
| `updateOrder` (1142-1237) | ❌ não |
| `updateStatus` (1276-1348) | ❌ não |
| `deleteOrder` (1238-1275) | ✅ sim (linha 1263) |
| `updateAmountPaid` (~1643) | ✅ sim |

Ou seja: o consumido parece se mover por **pagamento**, não por **venda**. Isso pode ser deliberado
(crédito = saldo em aberto), mas então `deleteOrder` devolvendo crédito é inconsistente — se nunca
subiu na criação, devolver na exclusão subtrai algo que não foi somado, podendo gerar valor errado
ou negativo.

**Pergunta de negócio pendente:** o consumido deve subir ao criar o pedido (e baixar ao pagar), ou
refletir só o que está em aberto? A resposta define se isso é bug grave ou desenho com uma
inconsistência pontual.

**Antes de mexer:** rodar reconciliação em produção comparando `creditLimitUsed` de cada cliente com
o que a soma dos pedidos/pagamentos diria — para saber se já existem clientes com crédito errado hoje.

---

## Implantação — CONCLUÍDA em 2026-08-14

**Os dois PRs #4 foram mergeados e os deploys rodaram com sucesso, na ordem correta**
(backend 12:43:41 → deploy ok em 2m12s; frontend 12:46:19 → deploy ok). A dependência de ordem foi
respeitada, então a regressão de busca não chegou a acontecer.

**Validação em produção ainda não feita** — conferir quando puder:
1. Buscar produto que **não** esteja nos 100 primeiros do catálogo → deve aparecer
2. Buscar cliente pelas primeiras letras → deve filtrar (antes isso **esvaziava** a lista)
3. Abrir pedido antigo com produto "profundo" no catálogo → nome e preço preenchidos
4. Duplicar pedido Faturado → cópia nasce nova, sem herdar status
5. Um arrasto no Kanban entre colunas (a verificação que a automação não alcança)

Referência do que foi para produção:

| Repo | PR | Commits |
|---|---|---|
| `sellou-back2025` | https://github.com/anderssilva/sellou-back2025/pull/4 | 3 |
| `sellou-front2025` | https://github.com/anderssilva/sellou-front2025/pull/4 | 19 |

São repositórios diferentes, cada um com seu próprio PR #4 — com um só repo aberto no GitHub você vê
apenas um deles.

O merge na `main` é o que **dispara o deploy automático** (GitHub Actions → SSH → `docker compose up -d --build`).

### ⚠️ Ordem obrigatória: backend primeiro

A busca server-side do front **depende** da correção de casamento parcial do back:

| Ordem | Resultado |
|---|---|
| Só o front | **Regressão visível** — a busca passa a consultar um servidor que só casa palavra inteira: digitar "note" não acha "Notebook". Hoje, mesmo limitado a 100 itens, o filtro local acha por substring. |
| Só o back | Seguro — apenas amplia o que a API casa, nenhum consumidor quebra. |
| Back → Front | Correto. |

**Validar em produção depois do back, antes de subir o front:**
`GET /company/:id/products?query=<3 primeiras letras de um produto real>` precisa retornar resultado.
Se vier vazio, **parar** — o front não pode subir.

### Validação em produção depois do front (~10 min)
1. Buscar produto que **não** esteja nos 100 primeiros do catálogo → deve aparecer
2. Buscar cliente pelas primeiras letras → deve filtrar (hoje isso **esvazia** a lista)
3. Abrir pedido antigo com produto "profundo" no catálogo → nome e preço preenchidos, não em branco
4. Duplicar pedido Faturado → cópia nasce nova, sem herdar status
5. Um arrasto no Kanban entre colunas (verificação ainda devida, ver Pendências)

### Rollback
`git revert` do merge + push na `main` redispara o deploy anterior. Como as mudanças do back só
*ampliam* o casamento da busca, reverter só o front é seguro — e é o rollback mais provável.

### ⚠️ Performance: a busca não tem índice
O `iLike '%termo%'` adicionado **não usa índice** — faz varredura sequencial. Testado só com 165
produtos; com catálogo real de milhares de SKUs pode ficar lento. Pior: `createFullTextIndexSql`
existe em `src/utils/fulltext-utils.ts:36` mas **nunca é chamado** — a busca full-text também roda
sem índice hoje. Não há índice trigram no projeto.

Se ficar lento, criar (sem travar a tabela):
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY idx_products_name_trgm ON "Products" USING gin (name gin_trgm_ops);
```

---

## 🔖 Onde paramos (2026-08-15)

**Ponto exato:** trabalho da sessão de Produtos **não commitado** na branch
`feature/dashboard-visual-redesign` (front e back). Uma revisão de código com Opus foi disparada
para avaliar o que subir antes de fechar a branch.

### Ao voltar, retomar por aqui

1. **Subir os ambientes locais:**
   - Back: `cd sellou-back2025 && eval "$(fnm env)" && fnm use v20.20.2 && npm run start:dev` (:8000)
   - Front: `cd sellou-front2025 && npm run dev -- --port 8001` (:8001)
   - Postgres: container `sellou2025-postgres` (porta 5434) — `docker start` se preciso
   - **Testar no Safari** — o Chrome do usuário não salva cookies de localhost (ver seção da sessão)
2. **Commitar e fechar a branch** — ver achados da revisão e as 5 pendências da seção
   "Sessão 2026-08-15" antes.
3. ~~**Antes do deploy do backend:** rodar `CREATE EXTENSION IF NOT EXISTS unaccent;` em
   produção.~~ **✅ Feito em 2026-08-15** — ver item 1 da seção "Corrigido durante a revisão" /
   "🔴 Antes do deploy" acima.

### Decisão pendente, aberta desde 2026-08-14

Eu tinha acabado de propor um plano em 4 etapas para o **risco de edição de pedido faturado**
(seções ⚠️ acima). Faltava você responder duas perguntas de negócio:

1. **A partir de qual status trava a edição?** Sugestão: "Aprovado" (o cliente já concordou com
   aquilo). Mas se na operação de vocês é comum ajustar pedido aprovado antes de faturar, o corte
   deveria ser "Faturado".
2. **Administrador pode furar a trava?** É comum ter override com registro em auditoria, para
   corrigir erro genuíno de digitação. Sem isso, a única saída é cancelar e refazer o pedido.

**Plano proposto** (ordem importa — mas ver a seção "Integridade do valor do pedido" antes, porque
o congelamento de preço deveria vir junto ou antes):

1. **Estancar** — guard no `updateOrder` (backend) bloqueando alteração de itens/valores após o
   status decidido. Observação e data de entrega continuam editáveis. Backend primeiro: a API está
   exposta independente da tela.
2. **Refletir na UI** — campos desabilitados com o motivo visível, em vez de deixar editar e falhar
   ao salvar.
3. **Corrigir o crédito** — ver seção "Limite de crédito" acima; a pergunta de negócio de lá
   (consumido = venda ou saldo em aberto?) precisa ser respondida junto, senão o guard trava a
   edição mas o crédito continua inconsistente.
4. **Auditoria** — estender o `statusHistory` (JSONB já existente na entidade) para registrar também
   edições de valor/itens, em vez de criar estrutura nova.

### Alternativa, se preferir seguir no redesign visual

Passo 4 (Empresas) ou Passo 6 (Clientes) — os componentes compartilhados já estão prontos e
testados em Produtos (`ListingPageHeader` com `card`, `FilterDrawer`, `ColumnVisibilityToggle`,
`RowActionButton`, `usePersistedViewMode`), então essas telas são composição, não decisão de
design nova. **Migrar a tela inteira de uma vez** — metade nova + metade antiga lê como quebrado.

Também vale terminar o **Dashboard da Empresa**, que ficou pela metade.
