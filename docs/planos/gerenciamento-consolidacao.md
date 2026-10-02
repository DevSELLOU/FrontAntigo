# Gerenciamento — consolidação em hub + migração para a linguagem em cartão

> Plano da sessão de 2026-08-15/16. Branch: `deploy/gerenciamento-consolidado`.
> Referências obrigatórias: `DESIGN.md` §12 (linguagem em cartão e estado da migração) e `HANDOFF.md`.
>
> ✅ **Executado por completo em 2026-08-16** — os 8 lotes abaixo estão commitados, cada um com
> `tsc --noEmit` + `npm test` (44/44) + `npm run build` limpos. O resumo do que ficou por verificar
> (tudo que depende de navegador) está no `HANDOFF.md`, seção da sessão.

## 1. O pedido

O dono olhou o submenu **Gerenciamento** da sidebar da empresa (12 links) e apontou duas coisas:

1. as 12 telas continuam no visual sóbrio antigo — só Produtos, Empresas, Usuários (admin global),
   Pedidos (cabeçalho) e os dois Dashboards migraram para a linguagem em cartão;
2. "dava pra unir várias dessas telas numa página só, com subabas".

## 2. Decisão de escopo

O pedido nasceu olhando para uma **sidebar**, não para o código. Aplicando julgamento em cima da
leitura real de cada tela, o agrupamento vale para as telas que são **estruturalmente a mesma
coisa** (lista paginada + filtro + 3 modais de CRUD) ou um **formulário curto**; não vale para
feições de produto com lógica de negócio própria.

### 2.1 Entram no hub (7 abas, uma rota)

| Aba | Rota antiga | Por quê |
|---|---|---|
| Categorias | `categories` | `page.tsx` de 66 linhas: `Header + AdvancedFilter + Table + Pagination`. |
| Segmentos | `segments` | Idêntica a Categorias, campo a campo (inclusive o modal de sub-itens). |
| Condições de pagamento | `payment-conditions` | Mesma estrutura + botão "Importar" (CSV). |
| Métodos de pagamento | `payment-methods` | Espelho exato de Condições de pagamento. |
| Usuários | `users` | Mesma estrutura; CRUD por modal, sem tela de detalhe. |
| Prazos de pedido | `orders-setup` | Formulário de 2 campos (mín/máx de dias do pedido programado). |
| Preferências | `settings` | 2 cards: customização da empresa + troca de senha. |

As cinco primeiras compartilham literalmente o mesmo esqueleto — por isso viram **uma** implementação
(`ManagementListTab`) parametrizada, não cinco cópias.

### 2.2 Ficam em rota própria (só migração visual)

| Tela | Rota | Por que não vira aba |
|---|---|---|
| Requisições de Acesso | `access-requests` | Fluxo de aprovação/rejeição (`update-access-request-status.tsx`, 276 l) — é workflow, não cadastro. Convive mal com "aba de configuração". |
| Hierarquia | `hierarchy` | Árvore recursiva de usuários (`user-hierarchy/tree`), UI própria, sem `AdvancedFilter`/`Table`/`Pagination`. |
| Metas | `goals` | 949 linhas em arquivo único: KPIs, gráfico, edição inline célula a célula, POST/PATCH/DELETE por tipo de meta e por produto. É uma feição de produto. |
| Rotas | `routes` | 3 fontes client-side mescladas (rotas, histórico de visitas, visitas agendadas), abas internas próprias e sub-forms pesados (576 + 327 + 326 + 266 l). Já tem um mecanismo de abas interno — empilhar abas dentro de abas seria pior que o problema. |
| Tabelas de Preço | `price-tables` | Grid editável de preços com salvamento em lote + editor de regras (521 + 368 + 245 l). Não é CRUD. |

**Registro explícito da recusa parcial:** Metas, Rotas e Tabelas de Preço somam ~3.500 linhas de
lógica de negócio. Forçá-las para dentro de uma página de abas numa madrugada sem supervisão troca
um ganho cosmético (menos itens na sidebar) por risco real de regressão em precificação, roteirização
e metas. Elas ganham a mesma linguagem visual, cada uma na sua rota.

**Resultado na sidebar:** o grupo Gerenciamento cai de **12 para 6 itens** — Configurações (hub),
Hierarquia, Metas, Requisições de Acesso, Rotas, Tabelas de Preço.

## 3. Arquitetura do hub

### 3.1 Rota

O hub **ocupa a rota que já existe**, `/company/[companyId]/settings`, com a aba no query param:

```
/company/1/settings?tab=categorias|segmentos|condicoes-pagamento|metodos-pagamento|usuarios|pedidos|preferencias
```

Motivo: `settings` já é uma das abas (Preferências) e já é a rota que o **representante** (não
administrador) usa. Nenhum link existente quebra.

As 6 rotas que saem de uso viram **redirect** em `next.config.mjs` (`permanent: false`), não 404 —
protege bookmark e link antigo, e é mais barato que manter `page.tsx` de casca:

```
/company/:companyId/categories          → /company/:companyId/settings?tab=categorias
/company/:companyId/segments            → ...?tab=segmentos
/company/:companyId/payment-conditions  → ...?tab=condicoes-pagamento
/company/:companyId/payment-methods     → ...?tab=metodos-pagamento
/company/:companyId/users               → ...?tab=usuarios
/company/:companyId/orders-setup        → ...?tab=pedidos
```

Os dois pontos do app que empurravam para as rotas antigas (`back-to-categories-button.tsx` e
`back-to-segments-button.tsx`, usados pelas telas de sub-categorias/sub-segmentos) passam a apontar
direto para a aba, sem passar pelo redirect.

### 3.2 Permissão e aba padrão

O hub é **server component** e resolve o papel do usuário no servidor
(`getServerSession(authOptions)` → `session.user.role`), porque as abas de gerenciamento só existem
para administrador:

- **administrador** → vê as 7 abas; aba padrão (sem `?tab=`) = a primeira, `categorias`;
- **não administrador** → vê **só** Preferências; qualquer `?tab=` de gerenciamento é normalizado
  para `preferencias` **antes** de qualquer fetch (não vaza dado nem cai em `/forbidden`);
- com uma aba só visível, a barra de abas não é renderizada — a tela continua sendo "Preferências",
  como hoje, só que no visual novo.

Regra única: **a aba padrão é sempre a primeira aba visível para aquele papel.**

### 3.3 Composição

```
settings/page.tsx (server, force-dynamic)
├── resolveManagementTab(searchParams.tab, isAdministrator)
├── busca APENAS os dados da aba ativa (uma aba = um fetch)
└── <XTab …>                                   (client, um wrapper fino por aba)
      └── <ManagementListTab>  ou  <ManagementShell>
            ├── <ListingPageHeader card icon eyebrow='Gerenciamento' …>
            ├── <SegmentedTabNav …>            (cápsula, <a href='?tab=…'>)
            ├── conteúdo da aba
            └── <AdvancedFilterDrawer> + modal de criação
```

Arquivos novos:

| Arquivo | Papel |
|---|---|
| `constants/management-tabs.ts` | `ManagementTabId`, lista de abas, `resolveManagementTab`, rótulos. Fonte única. |
| `components/shared/segmented-tab-nav.tsx` | Navegação em cápsula **genérica**, extraída de `DashboardTabNav` (que passa a delegar, sem mudar sua API). Evita reimplementar o padrão de abas. |
| `components/management/management-shell.tsx` | Moldura da página: header + abas + conteúdo. |
| `components/management/management-list-tab.tsx` | `ManagementShell` + busca + drawer de filtros + ação primária. É o esqueleto das 5 abas de listagem. |
| `components/management/*-tab.tsx` | Um wrapper fino por aba (props de dados → configuração do esqueleto). |

Motivo de existir um wrapper client por aba: `renderCreateModal` é função e **não atravessa** a
fronteira server→client; o wrapper é o lugar onde ela nasce.

### 3.4 O que "migrar a tela inteira" significa aqui

Seguindo o padrão de Produtos/Empresas/Usuários (DESIGN.md §12), cada aba de listagem recebe:

- cabeçalho em cartão (`card`/`icon`/`eyebrow`) com busca e ação primária;
- filtro avançado no `AdvancedFilterDrawer` (em vez do painel `AdvancedFilter` solto);
- tabela com ordenação server-side por cabeçalho (`useUrlSorting` + `SortableColumnHeader`);
- escolha de colunas (`ColumnVisibilityToggle`, persistida em `localStorage`);
- ações da linha **em linha** com tooltip (`RowActionButton`), nunca menu suspenso;
- status/papel em cápsula (`StatusBadge`).

Trocar de aba **reinicia** `page`/`query`/`filters`/`sort` — filtro de Categorias não pode vazar
para Segmentos.

## 4. Ordem de execução

Do mais barato e mais parecido para o mais arriscado. Cada lote fecha com
`npx tsc --noEmit` + `npm run build` + `npm test` + `npm run lint` e um commit próprio.

| Lote | Conteúdo | Por que nessa posição |
|---|---|---|
| 0 | Base compartilhada: `management-tabs.ts`, `SegmentedTabNav` (+ `DashboardTabNav` delegando), `ManagementShell`, `ManagementListTab` | Valida o mecanismo de aba antes de qualquer tela depender dele. |
| 1 | Aba **Categorias** + aba **Segmentos** (tabelas migradas) | As duas mais simples e idênticas entre si — prova o esqueleto barato. |
| 2 | Abas **Condições de pagamento** e **Métodos de pagamento** | Mesmo esqueleto + ação secundária (Importar CSV). |
| 3 | Abas **Usuários**, **Prazos de pedido**, **Preferências**; sidebar reduzida; redirects; remoção das páginas/headers antigos | Fecha o hub inteiro de uma vez — estado meio-novo/meio-antigo é proibido. |
| 4 | **Requisições de Acesso** (rota própria) | Migração visual isolada; workflow intocado. |
| 5 | **Hierarquia** (rota própria) | UI própria, sem esqueleto de listagem. |
| 6 | **Tabelas de Preço** (rota própria) | Primeira das "grandes": só moldura, sem tocar no grid de preços. |
| 7 | **Rotas** (rota própria) | Abas internas viram a cápsula compartilhada; dados intocados. |
| 8 | **Metas** (rota própria) | A mais arriscada por último: só cabeçalho/moldura, zero mudança de cálculo. |

Em 4–8 a regra é a mesma: **moldura nova, miolo intocado** — nenhum fetch, cálculo ou fluxo de
negócio é reescrito.

## 5. Riscos conhecidos

- **`revalidateTag` inócuo (pré-existente).** As actions de CRUD chamam
  `revalidateTag('/company/1/categories')`, mas `serverFetch` nunca registra tags — a chamada não
  invalida nada. O hub usa `export const dynamic = 'force-dynamic'` (mesmo recurso que o Dashboard
  da Empresa já usa), o que garante lista fresca a cada carga. Não altero as actions.
- **`FilterDrawer`** já corrigido nesta sessão (`flex flex-col` + `flex-1 min-h-0`) — reusar o
  componente, nunca remontar um `Sheet` do zero.
- **Homônimos que não se pode confundir:** `(sellou)/users` (admin global, já migrada) ≠
  `company/[id]/users`; `orders` (tela de Pedidos) ≠ `orders-setup` (prazos).
- **Verificação viva** limitada a HTTP/build/testes: navegador com humano ao vivo não está
  disponível nesta sessão. Nada será declarado "conferido na tela" sem isso.
