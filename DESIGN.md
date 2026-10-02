# design.md — Sellou Vendas (padrão mestre de interface)

> Baseline visual das telas **Entrar** (`/entrar`), **Dashboard** (`/dashboard`) e **Pedidos** (`/pedidos`).
> O protótipo `pedidos.html` é a referência executável do shell autenticado, listagens, filtros e comportamento responsivo.
> Este documento descreve o **modo claro**, seleção inicial obrigatória, e serve de contrato para o redesenho de toda a plataforma.
> O usuário pode escolher o modo escuro exclusivamente em **Perfil › Aparência**; a preferência do sistema operacional não substitui o modo claro na primeira carga.

> ⚠️ **Leia a seção 12 antes de mexer em qualquer tela.** A partir de 2026-08-15 a plataforma
> adotou uma segunda linguagem visual (cabeçalho em cartão, acento verde). As seções 1–11
> continuam válidas como base (tokens, tipografia, responsivo, acessibilidade); a seção 12
> descreve o que mudou por cima delas e quais telas já migraram.

---

## 1. Princípios

1. **Ferramenta de trabalho, não vitrine.** O usuário é representante comercial e opera a tela várias vezes ao dia. Densidade média, leitura rápida, zero animação decorativa.
2. **Verde só onde importa.** O verde da marca marca ação primária, item ativo e indicador positivo. Superfícies de conteúdo são neutras.
3. **Número antes de gráfico.** O dado principal é tipografia grande; o gráfico é contexto, não protagonista.
4. **Urgência tem cor própria.** Pendências usam a família âmbar/vermelha — nunca verde — para não competir com o significado de "ok".
5. **Piso de qualidade:** contraste AA (4.5:1 em texto, 3:1 em ícone/borda), foco visível em todo elemento interativo, `prefers-reduced-motion` respeitado, layout funcional até 360px.
6. **Não me faça pensar.** Ação primária tem texto explícito; ícones operacionais têm tooltip e nome acessível; telas privilegiam convenções conhecidas em vez de inovação sem ganho.
7. **Design centrado no humano.** A interface deve ser compreensível por usuários com diferentes níveis de familiaridade digital, incluindo pessoas acima de 55 anos. Texto, alvo de toque e feedback nunca podem depender de precisão ou memória excessivas.
8. **Minimalismo funcional.** Remover o que não ajuda a decisão atual. Indicadores gerenciais pertencem ao Dashboard; páginas operacionais começam pela tarefa.
9. **Mobile first sem empobrecer o desktop.** O conteúdo essencial funciona primeiro em 360px; desktop aumenta densidade e capacidade de comparação, sem criar outro produto.
10. **Consistência antes de personalização.** Tabelas, filtros, estados, botões e navegação repetem o mesmo contrato em todos os módulos.

---

## 2. Design tokens — light

### 2.1 Marca

| Token | Valor | Uso |
|---|---|---|
| `--brand-500` | `#3FBF52` | Logotipo, gradiente de destaque |
| `--brand-600` | `#2E9E45` | Hover de link, ponto final de série |
| `--brand-700` | `#2A7A44` | Ação primária (base), item de nav ativo |
| `--brand-800` | `#1F5C33` | Hover da ação primária, hero |
| `--brand-050` | `#EAF6ED` | Fundo de card em destaque, chip |
| `--brand-100` | `#D3EBDA` | Borda de card em destaque |

### 2.2 Neutros e superfícies

| Token | Valor | Uso |
|---|---|---|
| `--bg-app` | `#FFFFFF` | Fundo da área de conteúdo |
| `--bg-sidebar` | `#F1F4FB` | Fundo da navegação lateral |
| `--surface` | `#FFFFFF` | Cards, inputs, popovers |
| `--surface-muted` | `#F7F8FA` | Linha zebrada, estado hover de linha |
| `--border` | `#E5E7EB` | Borda padrão de card e input |
| `--border-strong` | `#D1D5DB` | Divisor de header, borda de input em hover |
| `--text` | `#111827` | Título e valor numérico |
| `--text-body` | `#374151` | Corpo, label de formulário |
| `--text-muted` | `#6B7280` | Subtítulo, eixo de gráfico, placeholder |
| `--text-inverse` | `#FFFFFF` | Texto sobre verde |

### 2.3 Semânticos

| Token | Fundo | Borda | Texto/Ícone | Uso |
|---|---|---|---|---|
| `--success` | `#EAF6ED` | `#BFE3C9` | `#1F7A3D` | Variação positiva, status ativo |
| `--warning` | `#FDF3E3` | `#EFD5A8` | `#A96A15` | Pendência média e alertas operacionais |
| `--danger` | `#FDECEC` | `#F3C4C4` | `#B42318` | Pendência crítica, erro de formulário |
| `--info` | `#EEF2FF` | `#C7D2FE` | `#3538CD` | Aviso neutro do sistema |

### 2.4 Tipografia

Família principal — **Inter**. Fallback: `system-ui`, `-apple-system`, `Segoe UI`, `sans-serif`. Usar **numerais tabulares** (`font-variant-numeric: tabular-nums`) em toda métrica e tabela.

| Token | Tamanho / linha | Peso | Uso |
|---|---|---|---|
| `--t-display` | 40 / 1.15 | 700 | H1 do hero de login |
| `--t-h1` | 32 / 1.2 | 700 | Título de página ("Dashboard") |
| `--t-h2` | 24 / 1.3 | 700 | "Bem-vindo de volta" |
| `--t-metric` | 34 / 1.1 | 700 | Valor do KPI |
| `--t-metric-frac` | 20 / 1.1 | 700 | Centavos (`,00`) — mesmo peso, tamanho menor |
| `--t-h3` | 17 / 1.4 | 600 | Título de card de gráfico |
| `--t-body` | 15 / 1.5 | 400 | Corpo, item de lista |
| `--t-label` | 14 / 1.4 | 600 | Label de campo, item de nav |
| `--t-caption` | 13 / 1.4 | 400 | Subtítulo de card, rodapé, eixo |
| `--t-eyebrow` | 11 / 1.2 | 700 | Rótulo de KPI e chip — caixa alta, `letter-spacing: .08em` |

### 2.5 Espaçamento, raio, sombra

- Escala base 4px: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 72`.
- Raios: `--r-sm 8` (chip, ícone) · `--r-md 12` (input, botão) · `--r-lg 16` (card) · `--r-full` (avatar, pílula).
- Sombras: `--shadow-card 0 1px 2px rgba(17,24,39,.04)` · `--shadow-pop 0 8px 24px rgba(17,24,39,.10)`.
- Foco: `outline: 2px solid var(--brand-600); outline-offset: 2px` — nunca removido.

---

## 3. Fundamentos de layout

- Breakpoints efetivos do shell: `mobile 560` · `tablet 900` · `conteúdo médio 1100` · `header compacto 1280`.
- Shell autenticado desktop: sidebar fixa **264px** + conteúdo fluido, `padding: 24px 32px`, largura máxima de conteúdo **1600px**, centralizada na área principal. O limite maior evita vazio lateral excessivo em monitores Full HD e superiores sem alongar indefinidamente as linhas de texto.
- A sidebar permanece congelada na viewport (`position: sticky`, `top: 0`, `height: 100vh`). A rolagem da página movimenta apenas o conteúdo principal.
- Se a altura da viewport não comportar toda a navegação, somente a área central do menu rola; logo e assinatura permanecem visíveis.
- Até **900px**, a sidebar desaparece e é substituída pela navegação inferior fixa. Não existe estado intermediário em que a navegação fique ausente.
- Até **1280px**, o título da página e a toolbar ocupam linhas separadas para evitar compressão de busca, seletor e ação principal.
- Grid de KPIs é definido por página. Páginas operacionais ocultam KPIs no mobile; o Dashboard mantém seus indicadores responsivos.
- Grid de gráficos: 2 colunas a partir de `lg`, empilhado abaixo.

---

## 4. Componentes

### Botão
- **Primário** — fundo `--brand-700`, texto branco, altura 48 (form) ou 40 (toolbar), `--r-md`, peso 700. Hover `--brand-800`; active desce 1px; disabled 40% de opacidade, sem sombra; loading mostra spinner e mantém a largura.
- **Secundário** — fundo `--surface`, borda `--border`, texto `--text-body`. Hover: fundo `--surface-muted`, borda `--border-strong`.
- **Ghost / ícone** — 36×36 no desktop e área mínima de toque 44×44 em dispositivos de toque, raio `--r-sm`. Sempre exige `aria-label`; ações desconhecidas ou primárias também precisam de texto visível.
- **Link de ação** — texto `--brand-700`, peso 600, seta `→` sempre presente (não aparece só no hover). Usado em "Revisar", "Verificar", "Decidir".

### Campo de texto
Altura 52, `--r-md`, borda `--border`, ícone à esquerda 20px em `--text-muted`, placeholder em `--text-muted`.
Estados: hover `--border-strong` · foco borda `--brand-600` + anel 3px `--brand-050` · erro borda `--danger` + mensagem 13px abaixo · disabled fundo `--surface-muted`.
Senha traz botão de olho à direita (alvo 40×40, `aria-pressed`, rótulo "Mostrar senha" / "Ocultar senha").

### Seleção e filtros
Toda caixa de seleção, filtro de seleção ou associação deve obrigatoriamente adotar o componente pesquisável, independentemente da quantidade de opções; o `<select>` nativo não é o padrão da plataforma. O gatilho tem a mesma altura e estados visuais dos campos; ao abrir, apresenta busca, lista com checkboxes, multiseleção, **Selecionar todos** e **Limpar**. Sem escolha, exibe "Todos..."; uma escolha mostra o nome; múltiplas escolhas mostram "N selecionados". A busca ignora maiúsculas e acentos. Apenas um seletor permanece aberto por vez, `Esc` fecha e o foco deve continuar previsível. Seleção única só deve existir como variante explícita quando a regra de negócio impedir múltiplas escolhas, preservando busca e o mesmo comportamento visual.

### Drawer de filtros
Filtros avançados abrem em painel lateral preso à direita, sobre backdrop escurecido, entrando da direita para a esquerda. Desktop usa largura máxima de 480px; no celular ocupa a tela inteira. Cabeçalho e rodapé permanecem fixos, conteúdo central rola, e o painel fecha pelo botão, `Esc`, clique no backdrop ou após aplicar. **Limpar** restaura todos os componentes antes de fechar.

### Tabelas e ordenação
Toda coluna com dado comparável deve ter botão de ordenação no cabeçalho. O primeiro clique ordena de **A a Z** para texto e do menor para o maior para números, datas e valores; o segundo inverte para **Z a A** ou maior para menor. A direção ativa deve ficar visualmente destacada e exposta por `aria-sort`. Somente uma coluna pode estar ativa por vez. Colunas puramente operacionais, como **Ação**, não recebem ordenação. A ordenação precisa operar sobre todo o resultado filtrado no backend; o comportamento local do protótipo apenas demonstra a interação.

Na coluna **Ação**, operações recorrentes aparecem como ícones compactos alinhados à direita. Para pedidos, o conjunto padrão é **Duplicar**, **Editar** e **Download**, nesta ordem. Cada botão deve ter área mínima de 32px no desktop, tooltip descritivo e `aria-label` contendo a ação e o identificador do registro. A tabela não é a visão inicial no celular; em cards, a ação contextual usa texto e alvo mínimo de 44px.

### Card
`--surface`, borda `--border`, `--r-lg`, `--shadow-card`, padding 20–24. Variante **destaque**: fundo `--brand-050`, borda `--brand-100` — usada só no KPI principal, no máximo um por tela.

### Card de KPI
Rótulo em `--t-eyebrow` (`--text-muted`) + ícone 32×32 em quadrado `--r-sm` no canto direito. Valor em `--t-metric`; prefixo `R$` em 15/600 alinhado à base; centavos em `--t-metric-frac`. Delta opcional: seta + percentual em `--success` (ou `--danger` quando negativo) + "vs. período anterior" em `--text-muted`. Sparkline opcional, altura 48, sem eixos.

### Banner de pendências
Card com barra vertical de 4px em `--warning` à esquerda. Título com ícone de alerta. Cada linha: bullet colorido por severidade (`--danger` crítico, `--warning` médio) + descrição + link de ação à direita. Divisor `--border` entre linhas. Máximo 4 itens visíveis, depois "Ver todas".

### Navegação lateral
O logotipo oficial Sellou Vendas fica centralizado no topo, separado da navegação por um divisor discreto. Não há banner permanente de acesso de suporte na navegação.

Item: ícone 20px + label `--t-label`, altura 44, `--r-md`, padding lateral 12.
- Repouso: texto `--text-body`, fundo transparente.
- Hover: fundo branco a 60%.
- Ativo: fundo `--brand-700`, texto e ícone brancos, sem borda extra.
O componente ocupa exatamente a altura da viewport e não acompanha a altura total do conteúdo. Logo e rodapé ficam congelados; apenas a lista de itens pode ter rolagem interna em telas de pouca altura. O rodapé contém a assinatura `Sellou · Gestão comercial` em `--t-caption`, como link externo para `https://www.sellou.com.br`.

### Header de conteúdo
Cabeçalho compacto, com altura mínima de 56px. Breadcrumb (`Empresa › Página`, último item em `--text`, peso 700) à esquerda. À direita ficam notificações e o menu do usuário. Notificações usam sino com ponto discreto quando houver itens não lidos. O perfil é um controle retangular compacto com `--r-md`, não uma cápsula: mantém apenas a foto circular de 30px, nome em `--t-label`, papel em `--t-caption` e chevron. Ao clicar, abre menu com **Meu perfil**, **Aparência** e **Sair da plataforma**. O modo claro é sempre a seleção inicial; a troca para escuro acontece somente dentro desse menu. Divisor `--border-strong` abaixo do header.

### Cabeçalho de página de listagem
Em desktop amplo, título e descrição ficam à esquerda; busca rápida, botão de filtros, seletor de visualização e ação primária ficam alinhados à direita, antes dos KPIs e da listagem. A busca cobre os campos mais recorrentes. Filtros avançados abrem no drawer lateral padronizado, preservando o foco da tarefa. O seletor pode oferecer **lista**, **cards** e **kanban** somente quando essas visualizações existirem para o módulo.

Até 1280px, título e toolbar passam a linhas separadas antes que qualquer controle seja espremido. No celular, a ordem obrigatória é: título e descrição; busca com filtro; ação primária em largura total; seletor com ícone e texto. O breadcrumb some e o topo exibe a marca, notificações e perfil, evitando repetir o nome da página.

- **Lista:** padrão inicial para comparação detalhada, ordenação por coluna e leitura de maior volume.
- **Cards:** cartões de densidade média com número, situação, cliente, localidade, responsável, data, valor e ação contextual. Usa três colunas em desktop, duas em tablet e uma no celular. É a visão inicial das listagens no celular.
- **Kanban:** colunas correspondem às situações reais do pedido. Cada cabeçalho mostra quantidade e valor consolidado; cada cartão mantém cliente, responsável, data, valor e ação. Em telas estreitas, o quadro usa rolagem horizontal deliberada, preservando a relação espacial entre etapas.

### Gráficos
Cabeçalho: ícone em quadrado `--brand-050`, título `--t-h3`, subtítulo `--t-caption`, botão de expandir à direita.
- Barras: `--brand-500` a 45% de opacidade; a barra do período atual usa gradiente `--brand-500 → --brand-800`. Raio 6 no topo.
- Linha: traço `--brand-800` de 2px, área com gradiente do `--brand-050` ao transparente, pontos 5px com miolo branco.
- Grade horizontal apenas, `--border`. Eixos em `--t-caption` / `--text-muted`.
- Tooltip: `--surface`, `--shadow-pop`, `--r-md`.
- Sem série significa estado vazio dentro do card, nunca eixo em branco.

### Estados de tela
- **Carregando:** skeletons com as mesmas medidas do conteúdo final (nunca spinner de página inteira).
- **Vazio:** título curto do que falta + uma ação. Ex.: "Nenhum pedido neste período." / "Ampliar período".
- **Erro:** o que falhou + como refazer. Ex.: "Não foi possível carregar os indicadores." / "Tentar novamente".

---

## 5. Página — Entrar (`/entrar`)

**Objetivo:** autenticar em um passo, transmitindo confiança sem ruído.

**Layout:** duas colunas 50/50 a partir de `lg`. Abaixo disso, só o formulário; o painel promocional é ocultado (não empilhado).

**Coluna esquerda — painel de marca**
Gradiente diagonal de `--brand-800` a `--brand-600`, com dois círculos de baixo contraste como textura. Conteúdo:
- Marca-símbolo 64×64 em vidro fosco (`rgba(255,255,255,.14)`, borda `rgba(255,255,255,.22)`).
- H1 em `--t-display`, duas linhas, quebra controlada.
- Subtítulo `--t-body` em branco a 82%, máx. 46ch.
- Duas provas de valor em cartões translúcidos: ícone 20px + título 15/600 + descrição 14/400.
- Rodapé: cadeado + "Sellou Vendas · ambiente seguro", 13px em branco a 70%.

**Coluna direita — formulário**
Bloco centrado, largura máx. 400px, `padding: 40px`.
1. Logotipo Sellou (altura 40).
2. Chip `ACESSO À PLATAFORMA` — `--t-eyebrow`, fundo `--brand-050`, texto `--brand-700`, raio full.
3. `Bem-vindo de volta` em `--t-h2` + linha de apoio em `--text-muted`.
4. Campo **E-mail** — `type="email"`, `autocomplete="email"`, `inputmode="email"`.
5. Campo **Senha** — label à esquerda e "Esqueci minha senha" (link `--brand-700`, 14/600) na mesma linha, à direita.
6. Botão primário largura total: **Entrar na plataforma**.
7. Nota de segurança: cadeado + "Ambiente seguro Sellou · conexão criptografada", `--t-caption`.

**Comportamento**
- Foco inicial no campo de e-mail.
- `Enter` em qualquer campo envia.
- Erro de credencial: alerta `--danger` acima do botão, com `role="alert"`, texto único — "E-mail ou senha incorretos." — e ambos os campos marcados em erro, sem limpar o e-mail digitado.
- Envio: botão em loading e campos desabilitados; nunca duplicar requisição.

---

## 6. Página — Dashboard (`/dashboard`)

**Objetivo:** responder em 5 segundos "algo precisa de mim?" e depois "como está a operação?".

**Ordem de leitura (é a ordem do DOM):**
1. Cabeçalho: `Dashboard` (`--t-h1`) + "Acompanhe os principais indicadores da operação." Sem botão manual de atualização; os dados são sincronizados automaticamente.
2. **Situações que exigem ação** — banner de pendências. Some por completo quando não há pendência; não vira card vazio.
3. **Faixa de KPIs** — Receita faturada (destaque, com delta e sparkline), Pedidos, Ticket médio, Empresas ativas, Usuários ativos.
4. **Gráficos** — "Pedidos por dia" (barras, últimos 5 dias úteis) e "Receita por dia" (linha, em milhares de reais), lado a lado.

**Responsivo**
- `xl`: 5 KPIs em linha, gráficos em 2 colunas.
- `lg`: KPIs 3+2, gráficos ainda em 2 colunas.
- `md`: KPIs 2 por linha, gráficos empilhados e navegação principal fixa no rodapé.
- `sm`: tudo em coluna única; ação do banner de pendências vai para linha própria, alinhada à esquerda, mantendo a navegação inferior.

**Comportamento**
- Na atualização automática, skeleton aparece somente nos blocos afetados, sem bloquear a página inteira.
- Cada pendência leva à tela filtrada correspondente — o texto do link nomeia a ação real ("Revisar", "Verificar", "Decidir"), não "Ver mais".
- Expandir gráfico abre modal com a mesma série e a tabela de valores.

---

## 7. Página — Pedidos (`/pedidos`)

**Objetivo:** permitir que o usuário encontre, compare, revise, crie e acompanhe pedidos com o menor número de decisões intermediárias.

**Texto de abertura:** `Pedidos` + `Acompanhe, aprove e fature seus pedidos.`

**Ordem no desktop:**
1. Título e descrição.
2. Busca por número, cliente ou representante; gatilho de filtros; visualizações; ação `+ Novo`.
3. KPIs: valor em pedidos, pedidos no período, aguardando aprovação e ticket médio.
4. Resultado em Lista, Cards ou Kanban.

**Ordem no mobile:**
1. Topo global com marca, notificações e perfil.
2. Título e descrição, sem breadcrumb repetido.
3. Busca com acesso ao drawer de filtros.
4. Ação primária `+ Novo` em largura total.
5. Seletor textual `Lista | Cards | Kanban`.
6. Filtros rápidos: Todos, Aguardando, Aprovados e Faturados.
7. Pedidos em cards, visão inicial obrigatória.
8. Navegação inferior fixa.

Os quatro KPIs ficam ocultos no mobile. Eles permanecem no desktop para apoiar comparação e migram conceitualmente para o Dashboard em experiências móveis.

**Visualizações:**
- **Lista:** padrão inicial no desktop. Tabela com ordenação em todas as colunas comparáveis e ações `Duplicar`, `Editar`, `Download`.
- **Cards:** padrão inicial no mobile. Exibe pedido, situação, cliente, localidade, representante, emissão, valor e ação contextual com texto.
- **Kanban:** agrupa pedidos por situação e consolida quantidade e valor por coluna. No mobile usa rolagem horizontal deliberada.

**Filtros e busca:**
- A busca local do protótipo filtra número, cliente e representante em todas as visualizações.
- Filtros rápidos atuam imediatamente e mantêm Cards como visualização no mobile.
- Filtros avançados usam o drawer padrão, componentes pesquisáveis e multiseleção.
- Na aplicação real, busca, ordenação, filtros e paginação operam no backend sobre o conjunto completo, não apenas sobre a página carregada.

**Responsivo:**
- Acima de 1280px, título e toolbar podem compartilhar a linha.
- Até 1280px, toolbar passa para a linha seguinte para preservar busca e ações sem compressão.
- Até 1100px, Cards passam de três para duas colunas.
- Até 900px, a sidebar dá lugar à navegação inferior.
- Até 560px, Cards passam para uma coluna, controles recebem alvo mínimo de 44px, KPIs somem e os rótulos das visualizações ficam visíveis.

### Tela interna do pedido (`/pedidos/:id`)

A tela interna preserva o shell e prioriza decisão sobre decoração. A ordem é: voltar para Pedidos; número e situação; ações; cliente e entrega; total; itens; condições comerciais; observações; histórico.

- Desktop usa duas colunas: conteúdo principal mais largo e contexto comercial/histórico na lateral.
- Cliente/itens e total/condições/histórico compartilham exatamente a mesma grade de duas colunas. A divisória vertical entre conteúdo principal e contexto lateral não pode mudar de posição entre os blocos.
- O valor total é o único card de destaque verde.
- Itens usam tabela no desktop e cards no celular; a tarefa principal não deve depender de rolagem horizontal mobile.
- Condições comerciais mostram obrigatoriamente pagamento, prazo médio de recebimento, tabela de preço, frete e limite disponível.
- Histórico registra criação, alterações, aprovações e seus responsáveis com data e hora.
- Ações desktop: `Duplicar`, `Download`, `Editar pedido`. No mobile, `Download` e `Editar pedido` permanecem fixas acima da navegação inferior.
- O botão Voltar explícito é obrigatório, mesmo quando o navegador também oferece navegação de retorno.

### Edição do pedido (`/pedidos/:id/editar`)

A edição mantém o contexto do pedido e organiza a tarefa em três blocos: cliente e responsável; itens; entrega e observações. Condições comerciais e resumo financeiro ocupam a coluna lateral no desktop.

- Seleções de cliente e produto são pesquisáveis. Quando a busca não encontra um cliente, a interface oferece cadastrá-lo sem obrigar o usuário a abandonar o fluxo.
- Quantidade, preço e desconto recalculam imediatamente cada linha, subtotal, descontos e total.
- O resumo financeiro permanece visível durante a rolagem no desktop e informa se o pedido está dentro do limite de crédito.
- Produtos são incluídos por drawer lateral com busca e multiseleção; remover um item exige botão explícito e nome acessível.
- A tela informa se existem alterações não salvas e oferece `Cancelar`, `Salvar rascunho` e `Salvar alterações`.
- No celular, itens viram cards editáveis, o resumo deixa de ser fixo e as ações de rascunho e salvamento permanecem acima da navegação inferior.

### Tela interna da empresa (`/empresas/:id`)

A empresa é apresentada como unidade operacional, sem conceito de filial. A página reúne identificação, módulos contratados, catálogo em destaque, indicadores, acessos, configurações e atividade administrativa.

- Dados cadastrais e módulos ocupam a coluna principal; indicadores, acessos e histórico ficam na coluna lateral.
- A grade lateral usa a mesma régua em todos os blocos, seguindo o padrão da tela interna de Pedidos.
- Superadmins podem acessar o ambiente da empresa e editar seus dados, herdando os poderes do administrador da empresa.
- No celular, produtos em destaque viram cards e as ações `Acessar` e `Editar empresa` permanecem acima da navegação inferior.

### Tela interna do produto (`/produtos/:id`)

O produto reúne catálogo, preço, disponibilidade e informação fiscal em uma única leitura. Identificação, descrição, dados técnicos e movimentações ficam na coluna principal; preço, estoque e tabelas de preço ficam na lateral.

- Campos preservados do legado: nome, descrição, preço, preço mínimo, comissão, NCM, marca, unidade, dimensões, peso, referência, código do fornecedor, modelo, estoque, IPI, ST, ICMS, código de barras, fabricante, fotos, categorias, favorito e situação.
- Estoque diferencia saldo físico, quantidade reservada e disponibilidade para venda.
- Movimentações informam tipo, origem, data, quantidade e vínculo com pedido quando houver.
- No celular, tabelas viram cards e as ações `Estoque` e `Editar produto` permanecem acima da navegação inferior.

---

## 8. Voz da interface

- Sentence case em títulos e botões; caixa alta só em `--t-eyebrow`.
- Verbo no infinitivo no botão, e a ação mantém o mesmo nome do começo ao fim do fluxo.
- Moeda: `R$ 106.916,00`, milhar com ponto, centavos reduzidos.
- Datas curtas em gráficos (`23/07`); tempo relativo em metadados ("há 4 min").
- Erro nunca pede desculpa e nunca é genérico: diz o que falhou e qual o próximo passo.

---

## 9. Modo escuro opcional

Nenhum valor de cor pode ser escrito direto no componente — tudo vem de token. Ao espelhar:
`--bg-app → #0F1115` · `--bg-sidebar → #14171D` · `--surface → #181C23` · `--border → #262B33` · `--text → #F3F4F6` · `--text-muted → #9AA3AF`. Verde de ação sobe para `--brand-600` (o `700` perde contraste em fundo escuro) e os fundos semânticos passam a ser a cor de texto a 12% de opacidade.

---

## 10. Arquitetura dos componentes da interface

O protótipo de Pedidos é a referência visual, mas não deve voltar a ser um arquivo monolítico. A composição padrão de cada tela é:

```text
Shell da aplicação
|-- Sidebar global
|-- Área principal
|   |-- Topo global
|   `-- Conteúdo específico da página
`-- Camadas flutuantes
    |-- Drawers de filtros
    |-- Modais
    `-- Notificações e feedbacks
```

### Responsabilidade de cada parte

- `pedidos.html`: compõe a página e contém somente o conteúdo específico de Pedidos e as camadas usadas por essa tela.
- `assets/js/components/sellou-sidebar.js`: única fonte da navegação lateral, logo e estado do item ativo.
- `assets/js/components/sellou-topbar.js`: única fonte do breadcrumb, notificações, perfil e troca de tema.
- `assets/js/components/sellou-mobile-nav.js`: única fonte da navegação inferior mobile e seu item ativo.
- `assets/css/sellou-ui.css`: tokens e estilos compartilhados do protótipo. Nenhuma cor estrutural deve ser escrita diretamente no HTML.
- `assets/js/pages/pedidos.js`: comportamento exclusivo da tela de Pedidos: lista, cards, Kanban, busca, filtros e ordenação.

### Contrato para novas telas

1. Reutilizar `<sellou-sidebar>`, `<sellou-topbar>` e `<sellou-mobile-nav>`; não copiar seu HTML para a nova página.
2. Informar o item ativo da sidebar e da navegação mobile pelo atributo `current`.
3. Informar empresa e página no topo pelos atributos `company` e `page`.
4. Colocar regras de negócio e interação da página em um arquivo próprio em `assets/js/pages/`.
5. Alterações visuais globais devem ser feitas uma única vez no componente ou no token correspondente.
6. Uma IA encarregada de revisar uma página não deve editar os componentes globais sem uma solicitação explícita.

Exemplo mínimo:

```html
<div class="shell">
  <sellou-sidebar current="pedidos"></sellou-sidebar>
  <div class="main">
    <sellou-topbar company="Alfa Distribuição" page="Pedidos"></sellou-topbar>
    <main class="content">...</main>
  </div>
</div>
<sellou-mobile-nav current="pedidos"></sellou-mobile-nav>
```

Os Web Components atuais não usam Shadow DOM para manter os tokens e estilos do protótipo compartilhados. Na migração para o framework definitivo, essa mesma fronteira deve virar componentes de layout, sem mudar a responsabilidade de cada camada.

### Padrão mobile do shell

- Navegação principal fixa no rodapé: `Dashboard | Clientes | Pedidos | Rotas | Mais`.
- Área mínima de toque: `44 × 44 px`; ação principal nunca pode depender apenas de um ícone.
- Listas de negócio usam cards como visão inicial. Tabela é a visão inicial apenas no desktop.
- O seletor de visualização deve combinar ícone e texto no celular: `Lista`, `Cards`, `Kanban`.
- A ação principal ocupa a largura disponível e usa um rótulo curto e inequívoco, como `+ Novo`.
- Não mostrar KPIs nas páginas operacionais mobile. Receita, volume, ticket médio e pendências consolidadas pertencem ao Dashboard; a tela mobile de Pedidos começa pelas ações, filtros rápidos e pedidos.
- Filtros frequentes aparecem como chips horizontais; filtros avançados permanecem no drawer.
- O topo mobile mostra marca, notificações e perfil, sem repetir breadcrumb e título da página.
- Respeitar `env(safe-area-inset-bottom)` para funcionar corretamente em iPhones com indicador de início.

---

## 11. Critérios de aceite do padrão

Uma tela só pode ser considerada aderente ao padrão Sellou quando:

1. Funciona sem rolagem horizontal acidental em 360px, 390px, 768px, 1280px e 1440px.
2. Mantém navegação principal disponível em todos os tamanhos: sidebar congelada no desktop e barra inferior até 900px.
3. Todos os alvos de toque mobile têm no mínimo 44×44px.
4. É compreensível sem treinamento para a tarefa principal; ícones isolados não escondem ações essenciais.
5. Busca, filtros, ordenação, paginação e troca de visualização compartilham o mesmo estado de consulta.
6. Possui estados de carregamento, vazio, erro, sucesso, sem permissão e indisponibilidade de rede.
7. Atende contraste AA, navegação por teclado, foco visível, nomes acessíveis e `prefers-reduced-motion`.
8. Foi validada no Safari/iOS e Chrome/Android, incluindo teclado virtual, safe area e botão Voltar.
9. Componentes globais não foram duplicados dentro da página.
10. Mudanças de comportamento foram construídas e protegidas por testes no ciclo RED → GREEN → REFACTOR; testes de usabilidade com 3 a 5 usuários reais validam decisões de interface.

---

## 12. Linguagem visual em cartão (adotada em 2026-08-15)

Origem: mockups entregues pela equipe de design (pasta `sellou-front2025v3-atualizado`, um
snapshot antigo do app — **não** um fork do código atual; por isso a adoção foi seletiva).
A decisão foi adotar essa direção como padrão da plataforma, migrando tela a tela.

### O que muda em relação às seções 1–11

Nada dos fundamentos é revogado: tokens, escala tipográfica, breakpoints, alvos de toque e
critérios de aceite continuam valendo. O que muda é a **moldura** das telas:

- **Cabeçalho em cartão.** Título, descrição e controles ficam dentro de um cartão arredondado
  (`rounded-3xl`), com borda verde-clara, fundo translúcido com `backdrop-blur` e dois círculos
  desfocados decorativos. Acompanha um ícone em chip verde (48×48) e um *eyebrow* — rótulo curto
  em maiúsculas acima do título (ex.: `CATÁLOGO E ESTOQUE`).
- **Acento verde da marca.** `#008440` (verde escuro, ações e valores) e `#35DD48` (verde vivo,
  realces e gradientes). Contraste verificado nos dois temas.
- **Cápsulas.** Status, categoria e estoque viram cápsulas arredondadas com cor semântica
  (`success`/`warning`/`danger`), em vez de badges retangulares.

### Tokens de vidro

Cores neutras continuam vindo dos tokens das seções 2 e 9. O que a linguagem em cartão
adicionou está em `globals.css`, com par claro/escuro:

| Token | Uso |
|---|---|
| `--glass-surface` | fundo translúcido do cartão de cabeçalho |
| `--glass-border` | borda verde-clara do cartão |
| `--glass-icon-bg` | fundo do chip de ícone |
| `--glass-hover-bg` / `--glass-hover-border` | estado hover de botões secundários |

**Regra:** neutros (texto, superfície, borda) **sempre** por token. Os dois verdes da marca são
a única exceção aceita como valor literal, por funcionarem nos dois temas.

### Componentes compartilhados

Toda tela de listagem compõe a partir destes — não duplicar:

| Componente | Papel |
|---|---|
| `shared/listing-page-header.tsx` | Cabeçalho + busca + filtros + seletor de visualização + ação primária. Props `card`/`icon`/`eyebrow` ligam a linguagem em cartão; **sem elas o componente renderiza o visual sóbrio original** (é o que mantém as telas ainda não migradas intactas). Busca, filtro, seletor de visualização e ações só aparecem se as props correspondentes forem passadas — dá para usar só `card`+`icon`+`eyebrow`+`title`+`description` numa tela sem lista (ex.: um dashboard). |
| `shared/filter-drawer.tsx` | Painel lateral de filtros. `AdvancedFilter` em modo `embedded` adapta o layout à largura estreita. `SheetContent` precisa ser `flex flex-col` e o miolo `flex-1 min-h-0 overflow-y-auto` — sem isso o rodapé "Aplicar/Limpar" cai fora da viewport em janelas baixas com muitos campos (achado real ao migrar o Dashboard da Empresa, corrigido; afeta as 5 telas que usam este drawer). |
| `shared/advanced-filter-drawer.tsx` | Wrapper fino de `filter-drawer.tsx` + `AdvancedFilter embedded` para telas cujo filtro é só "campo + operador + valor", sem controles extras (Empresas, Usuários). Pedidos mantém wrapper próprio por injetar selects de mês/ano. |
| `shared/column-visibility-toggle.tsx` | Escolha de colunas visíveis da tabela; preferência salva em `localStorage`. |
| `shared/row-action-button.tsx` | Botão de ação por linha, com tooltip. Ações ficam **em linha**, não em menu suspenso. |
| `shared/progress-bar.tsx` | Barra de progresso fina, verde da marca, com `role="progressbar"` e rótulo acessível. Usada em Minhas Metas (KPIs, atingimento global, lista) e na execução da viagem. **Não usar `ui/progress.tsx`** — ele ainda se pinta com `bg-gray-500/50` / `bg-green-500` / `bg-red-700` fixos. |
| `hooks/use-persisted-view-mode.ts` | Lembra a última visualização (lista/grade/kanban) por tela. |
| `hooks/use-url-sorting.ts` | Deriva `sorting` do param `sort` da URL + grava de volta ao ordenar, resetando a página. Liga `SortableColumnHeader` a ordenação server-side de verdade. **Usado hoje por Empresas, Usuários, Produtos e Pedidos** — nenhuma tela tem mais cópia local nem cabeçalho clicável sem estado. |
| `hooks/use-delayed-url-search.ts` | Busca com debounce sincronizada no param `query`, com o reset de página corrigido (só pula o reset no primeiro render). **Usado por Empresas, Usuários, Produtos e Pedidos.** O hook antigo `use-delayed-state.ts` continua válido só para busca local sem URL (ex.: o seletor de produtos dentro do formulário de Pedido). |
| `hooks/use-persisted-column-visibility.ts` | Estado + leitura/gravação em `localStorage` da escolha de colunas. Era copiado em cada tabela migrada; agora é um só. |
| `shared/segmented-tab-nav.tsx` | Cápsula de abas genérica (`<a href>` + query param). `DashboardTabNav` delega a ela. |
| `management/management-shell.tsx` | Moldura do hub de Gerenciamento: cabeçalho + cápsula de abas + conteúdo. |
| `management/management-list-tab.tsx` | Esqueleto das abas de listagem do hub (cabeçalho + busca + drawer + ação primária + paginação). As 5 listagens do hub são configurações deste componente, não cópias. |
| `constants/management-tabs.ts` | Abas do hub e `resolveManagementTab`, que normaliza a aba pedida contra o papel do usuário **antes de qualquer fetch**. |
| `shared/dashboard/dashboard-header.tsx` | Wrapper de `listing-page-header.tsx` para telas **sem lista** (dashboards e relatórios): cartão + ícone + eyebrow + botão "Atualizar" (`router.refresh()`) + gatilho de filtro. `title`/`description` são opcionais e caem no texto do Dashboard quando omitidos. |
| `shared/kpi-grid.tsx` | Grade de cartões de KPI (`grid` 1/2/3/4 colunas). `type` escolhe cor e ícone (`money`/`order`/`danger`/`warning`/`people`/`percent`); `hint` opcional acrescenta uma segunda linha sob o valor (ex.: "Período: Jan–Mar"), que é o que permite usar um KPI para "Vendedor destaque" sem perder o valor. |
| `ui/data-table.tsx` + `ui/sortable-column-header.tsx` | Tabela padrão: ordenação (client ou controlada), `aria-sort`, clique e teclado na linha, mensagem de vazio. **Não montar `useReactTable` + `<Table>` à mão** — foi assim que as telas de Relatórios ficaram sem `aria-sort` e sem ativação por teclado. |

**Ordenação só existe onde o backend sabe ordenar.** `buildSortQuery` joga o campo direto no
`order` do Sequelize, então só colunas reais da tabela podem ser ordenáveis. Em Pedidos, as cinco
colunas calculadas no cliente (cliente, responsável, nº de produtos, condição de pagamento,
progresso de pagamento) renderizam cabeçalho simples, sem botão — um cabeçalho que promete ordenar
e não ordena é pior do que não ter. Para torná-las ordenáveis é preciso mexer no backend
(ordenar por coluna de include), não no front.

### Telas de leitura e exportação (relatórios)

Relatório **não é listagem**: não tem busca rápida, não tem seletor de visualização e não tem ação
primária de criar. A composição correta é a do Dashboard, não a de Produtos:

1. `shared/dashboard/dashboard-header.tsx` com `card` + `icon` + `eyebrow` + `title`/`description`;
2. faixa de **recorte aplicado** (cápsulas do período/dimensão vindas da URL + "Limpar") logo abaixo;
3. `shared/filter-drawer.tsx` para o recorte — o relatório abre já filtrado, então o filtro é
   refinamento, não porta de entrada, e não merece ocupar a primeira dobra;
4. `shared/kpi-grid.tsx` para os números;
5. cartões de bloco (gráfico, tabela) no mesmo casco dos KPIs.

Em `components/reports/` existem os três compartilhados desse módulo: `report-toolbar.tsx`
(1+2+3 juntos), `report-filter-drawer.tsx` (ano/mês + uma dimensão opcional, contrato de
query-string `years`/`months`/`<paramName>`) e `report-blocks.tsx` (`ReportCard`,
`ReportEmptyState`, `ReportLoadingState`, `ReportScreenSkeleton`, `brandSeriesRamp`,
`truncateLabel`).

**Toda rota que faz `await` no servidor precisa de `loading.tsx` e `error.tsx` próprios.** Sem o
primeiro, o navegador fica na tela anterior durante toda a consulta e o clique parece não ter
pegado. Sem o segundo, a falha escapa para o `app/error.tsx` da raiz — tela cheia, sem navegação,
com stack trace. Os quatro relatórios compartilham um par em `reports/`.

**Vazio e falha não podem ter a mesma cara.** Estado vazio afirma um fato de negócio ("nenhum
pedido neste período"); usá-lo para esconder uma consulta que quebrou faz o produto mentir sobre
o dado. Toda leitura remota carrega os dois estados separados.

**Filtro só indica o que é escolha do usuário.** Quando o servidor tem um padrão implícito (aqui,
o ano corrente), esse padrão **não** conta no `filterCount` nem habilita "Limpar" — um ponto de
filtro sempre aceso é o mesmo que ponto nenhum. A verdade sobre "há filtro?" é a URL, não o valor
resolvido.

**Cor de série em gráfico.** Categorias sem ordem (situação do pedido) usam os tokens semânticos
já existentes — `--status-*-fg` cobre os dois temas. Séries **ordenadas** (períodos) usam
`brandSeriesRamp`, uma rampa sequencial entre os dois verdes da marca: a ordem da cor carrega a
ordem do dado. Paleta categórica arco-íris em série ordenada é erro, e as cores soltas que
existiam ali (`#2563eb`, `#16a34a`, dez hex fixos) não sobreviviam ao modo escuro.

> ⚠️ **A escala `--brand-*` não tem par escuro.** `--brand-050` … `--brand-800` estão declarados
> só em `:root` no `globals.css`. Utilitário como `bg-brand-050` fica verde-menta claro no tema
> escuro — o seletor de visualização do `listing-page-header.tsx` cai nisso e chega a ~1,5:1.
> Enquanto os valores escuros não existirem, use os tokens de vidro (`--glass-icon-bg`,
> `--glass-border`), que têm par claro/escuro e são visualmente equivalentes no claro.

> ⚠️ **Armadilha de tipografia com `twMerge`.** `cn()` usa `tailwind-merge`, que lê `text-h3`,
> `text-body`, `text-label` e `text-caption` como classes de **cor** (não estão na escala padrão
> do Tailwind) e as descarta quando aparecem no mesmo `cn()` que um `text-text*`. Consequência
> real: `ui/card.tsx` define `CardTitle` como `cn('text-h3 text-text', className)` — o `text-h3`
> nunca chega ao DOM. Em string literal de `className` as duas classes convivem sem problema
> (são propriedades CSS diferentes); o conflito só existe no modelo do `twMerge`. Ao usar a
> escala tipográfica do projeto, **não a passe por `cn()` junto com uma classe de cor de texto**.

### Estado da migração

| Tela | Situação |
|---|---|
| Produtos | ✅ migrada (referência mais completa) |
| Pedidos | ✅ migrada por completo — lista, cards, kanban, 9 modais e o formulário (create/edit/duplicate) |
| Dashboard (Admin) | ✅ migrada |
| Empresas | ✅ migrada |
| Usuários (admin da plataforma) | ✅ migrada |
| Dashboard da Empresa | ✅ migrada — cabeçalho, exportação, filtros e abas |
| Clientes | ✅ migrada — listagem (cabeçalho, cápsula de situação, cards, tabela) e perfil (cabeçalho, abas e as cinco abas). **Ressalva:** a aba **Dados** recebeu só a casca (cartão, tokens, sentence case); o formulário em si (`zodResolver` + 4 server actions de pagamento) não foi reestruturado |
| **Gerenciamento — hub** (`settings?tab=…`) | ✅ migrado: Categorias, Segmentos, Condições de pagamento, Métodos de pagamento, Usuários da empresa, Prazos de pedido e Preferências, as 7 abas |
| Subcategorias / Subsegmentos | ✅ migradas (telas-filhas do hub, rota própria) |
| Requisições de Acesso | ✅ migrada (rota própria — workflow de aprovação) |
| Hierarquia | ✅ migrada (rota própria — árvore) |
| Tabelas de Preço | ✅ moldura migrada; grid de preços recebeu polimento visual pontual (cabeçalho fixo ao rolar, coluna Produto com corte visual, indicador de variação vs. preço base, botão de salvar sempre visível); editor de regras e modais satélite ainda sóbrios |
| Rotas | ✅ moldura e tabela migradas; sheets/modais de rota intocados |
| Metas | ✅ moldura e cores migradas; KPIs, gráfico e edição inline intocados |
| Minhas Metas (`my-goals`) | ✅ migrada — cabeçalho, período, KPIs, gráfico e lista |
| Minhas Rotas (`my-routes`) | ✅ migrada — cabeçalho, cartões de rota, sheet de nova rota e modal de detalhe |
| Execução da viagem (`my-routes/trips/[tripId]`) | ✅ migrada — cabeçalho, progresso, cartões de cliente e os dois modais |
| Relatórios — Pedidos, Vendas, Produtos, Personalizável | ✅ migradas (as 4, inteiras) |
| Preferências (Superadmin, `/settings`) | ✅ migrada em 2026-08-16 — casco `bg-app` + `ListingPageHeader card` |
| Recuperar senha / Alterar senha | ✅ tokenizadas em 2026-08-16 — **visual sóbrio**, ver §12.1 |
| Sem permissão / Erro / 404 | ✅ tokenizadas em 2026-08-16 — **visual sóbrio**, ver §12.1 |
| Loja do cliente | ⚠️ parcial — capa, rodapé, grade, carrinho, produto e checkout revistos em 2026-08-18 (mobile, imagens e identidade); ainda há cores fixas em `category-drawer` e nos skeletons |

### Abas: um mecanismo, duas ligações

A cápsula de abas é `shared/segmented-tab-nav.tsx`. Ela navega por `<a href>` + query param —
é o caminho certo quando cada aba é renderizada no servidor (Dashboard da Empresa, hub de
Gerenciamento): a aba fica linkável e sobrevive ao recarregamento.

Telas que buscam os próprios dados no client (**Rotas** e **Metas**) repetem hoje só as classes
da cápsula, com `useState`/Radix, porque um `<a href>` faria navegação dura e refaria todos os
fetches a cada troca de aba. Isso é **dívida conhecida**: o componente compartilhado deve ganhar
um modo controlado opcional (`value`/`onChange`) — e contagem por aba, de que Clientes precisa —
e as três cópias somem.

**Pedidos não tem rota de detalhe** — o "detalhe" que o usuário alcança é o próprio formulário de
edição (`/orders/edit/[orderId]`). Existe um `order-view-modal.tsx` migrado, mas hoje ele não tem
nenhum importador (ver HANDOFF).

### Telas do representante (migradas em 2026-08-16)

São as únicas telas que o vendedor de campo usa no celular o dia inteiro, então
o alvo de toque e a ausência de rolagem horizontal pesam mais aqui que em tela de
escritório. Convenções adotadas nas três, para quem migrar telas parecidas:

- **Tabela vira cartão abaixo de `md`.** A lista de metas tem 6 colunas; em 360px
  isso é rolagem horizontal garantida. `hidden md:block` para a tabela, `md:hidden`
  para a lista de cartões, alimentadas pelo **mesmo array já calculado** — nunca dois
  cálculos paralelos.
- **Altura 44px explícita nos controles.** O `Button` compartilhado nasce `h-10 md:h-9`
  (40px no celular) e `size='sm'` nasce 32px; nas telas do representante os botões
  levam `className='h-11'`. O mesmo vale para item de `CommandItem` (`min-h-[44px]`)
  e para linhas com `Switch`, onde o `<Label>` estica para a altura toda da linha.
- **Cartão inteiro clicável = `<button>` sobreposto**, nunca `<div onClick>`: botão
  `absolute inset-0 z-10` com `aria-label`, conteúdo por cima com `pointer-events-none`
  e a ação real com `pointer-events-auto`. Mantém o toque em qualquer ponto **e** o
  acesso por teclado.
- **Dropdown dentro do cabeçalho em cartão precisa de portal.** O `<header>` do
  `ListingPageHeader` é `overflow-hidden`; um dropdown `absolute` (como o de
  `shared/searchable-select.tsx`) é cortado. Usar `Popover` + `Command` do shadcn,
  que renderizam em portal — é o que o filtro do Dashboard da Empresa já faz.
- **Telefone e e-mail viram `tel:`/`mailto:`.** O representante estava redigitando o
  número na mão no meio da visita.
- **Estado de erro existe.** Nas três telas, uma falha de rede caía no estado vazio
  ("Nenhuma meta encontrada", "Nenhuma rota encontrada"), culpando o usuário por uma
  falha de conexão. Erro agora é estado próprio, com "Tentar novamente".

### 12.1 Bloco de autenticação, erro e 404 — sóbrio por decisão

`/sign-in`, `/forgot-password`, `/reset-password/[token]`, `/forbidden`, `error.tsx`, `not-found.tsx`
e `shop/not-found.tsx` **não** usam a linguagem em cartão. Não é atraso de migração: é decisão
consciente, com uma pergunta ainda aberta para o dono (ver `HANDOFF.md`) sobre se o bloco de
autenticação adota o cartão ou fica no padrão sóbrio.

O que vale hoje para essas telas:

- **Um único template de autenticação.** `auth/auth-template.tsx` é a casca de `/sign-in`,
  `/forgot-password` e `/reset-password/[token]`: painel de marca à esquerda em gradiente
  `brand-800 → brand-600` (some abaixo de `lg`) + coluna de formulário `max-w-sm` à direita.
  O `auth/aside-content.tsx`, que criava uma segunda tela de login divergente, foi apagado.
  A classe CSS `.aside-content-pattern` continua em `globals.css` — quem a usa agora é
  `admin/side-bar-company.tsx`.
- **Telas de estado seguem uma composição só:** ícone em quadrado com cor semântica
  (`bg-danger`/`bg-warning` + `text-*-foreground`), `text-h1 text-text`, apoio em
  `text-body text-text-muted`, ação primária e uma saída secundária (`variant='link'`).
- **Verde de ação vem de `text-primary`, não de `text-brand-700`.** `text-primary` resolve
  `var(--custom-color, var(--action))`, e `--action` já cai para `--brand-600` no escuro
  (§9). Escrever `text-brand-700` direto entrega 3.2:1 no modo escuro — abaixo do AA.
- **`shop/not-found.tsx` fica neutro** (sem cartão, sem vidro) enquanto a decisão de acento
  por tenant da loja não estiver tomada.
- **Tela de estado carrega a própria rolagem.** `app/layout.tsx` trava o `body` com
  `overflow-hidden` e, como o `html` fica em `overflow: visible`, isso tira a rolagem da
  viewport inteira. Toda tela de tela cheia usa `h-screen overflow-y-auto`, nunca
  `min-h-screen` sozinho — senão o stack trace do `error.tsx` e o botão de enviar do
  `reset-password` com o teclado aberto ficam inalcançáveis.
- **Campo de senha usa `shared/password-input.tsx`**, nunca `<Input type='password'>` cru. É
  ele que entrega o botão de olho que o §4 exige, com `aria-label` e `aria-pressed`.
- **Link e botão não se aninham.** `<Link><Button>` renderiza `<a><button>`: HTML inválido,
  dois pontos de tabulação para o mesmo controle e leitura dupla no leitor de tela. Use
  `<Button asChild><Link/></Button>`.

### 12.2 Armadilhas de classe já medidas (não repita)

Três formas de escrever uma classe que **compila, aparece no DOM e não pinta nada**. Todas
confirmadas lendo o CSS gerado em `.next/static/css` e o HTML renderizado, não por leitura:

1. **`bg-app` não existe.** Em `tailwind.config.ts` a cor se chama `'bg-app'`, então a
   utilitária gerada é `.bg-bg-app`. Toda tela que "migrou para `bg-app`" está, na verdade,
   herdando o fundo do `body`. Hoje é inofensivo (os dois valores coincidem nos dois temas),
   mas o token não está fazendo o trabalho dele.
2. **`bg-brand-050`, `border-brand-200` e `bg-brand-300` não existem.** A escala declarada é
   `50/100/500/600/700/800`. O correto é `bg-brand-50`.
3. **`cn()` come um dos dois `text-*`.** `cn` é `twMerge(clsx(...))` e o tailwind-merge não
   sabe que `text-h1`, `text-h3`, `text-caption`, `text-label`, `text-body` e `text-eyebrow`
   são tamanhos — trata todos no mesmo grupo de `text-text`, `text-text-muted`,
   `text-brand-700` e mantém só o último. Efeito medido: `CardTitle` renderiza
   `<div class="text-text">`, sem o `text-h3`. **Regra prática:** dois tokens `text-*` no
   mesmo elemento só sobrevivem em string literal no JSX; se passarem por `cn`, separe-os
   (um no componente, outro na prop) ou não use `cn`.

4. **`text-primary-foreground/80` não escurece o token — quebra ele.** O modificador de
   opacidade do Tailwind compila para `rgb(var(--custom-text-color) / 0.8)`, mas
   `primary.foreground` guarda uma **cor inteira** (`var(--custom-text-color, #f8f7eb)`), não
   canais RGB separados. A declaração fica inválida e o elemento cai para a cor herdada.
   Medido ao vivo na capa da loja: o `<h1>` com `text-primary-foreground` renderizou branco
   enquanto o parágrafo com `text-primary-foreground/90` renderizou `rgb(17,24,39)` sobre um
   fundo verde escuro — ilegível. Vale para `primary`, `primary-foreground` e qualquer token
   declarado como cor completa. **Regra prática:** para clarear/escurecer esses tokens use
   `opacity-*` no elemento, nunca a sintaxe `/NN`. (`text-white/80` funciona, porque `white` é
   cor nativa do Tailwind.) De quebra: `opacity-85` **não existe** na escala padrão.

**Consequência a assumir:** enquanto a migração não termina, convivem duas linguagens visuais.
Ao migrar uma tela, migre-a inteira — o estado intermediário (metade nova, metade antiga) foi
testado e lê como quebrado.
