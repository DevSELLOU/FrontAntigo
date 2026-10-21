# Agenda diária e visitas avulsas

Branch codex/agenda-visitas-homologacao baseada em homologacao
(18db86e0382a903db63a0cf66d4610ea7c92920c).
Depende do PR de mesmo escopo em DevSELLOU/BackAntigo.

O sino agora abre uma agenda do dia, em desktop e mobile. Consulta somente
ScheduledVisit pendente do usuário autenticado e empresa atual, com data local do
navegador. Exibe horário, cliente e ID, além de carregamento, erro com nova tentativa
e “Não há compromissos hoje.” Atualiza ao abrir, recuperar foco e a cada minuto
enquanto aberto.

Rotas oferece + Nova visita e a aba Visitas agendadas. O formulário pesquisa
cliente/responsável e exige data e horário; observação é opcional. A criação usa
a entidade existente. O histórico diferencia agendamentos avulsos de visitas
realizadas e clientes pulados. A action de usuários normaliza UserCompany.user,
usando userId e papel do vínculo em vez do ID da associação.

## Arquivos

- src/components/admin/daily-agenda-bell.tsx
- src/components/admin/topbar.tsx
- src/components/admin/header.tsx
- src/components/routes/create-visit-dialog.tsx
- src/components/routes/index.tsx
- src/components/routes/scheduled-visits-table.tsx
- src/components/routes/visit-history-table.tsx
- src/actions/scheduled-visit/create-scheduled-visit.action.ts
- src/actions/scheduled-visit/fetch-scheduled-visits.action.ts
- src/actions/user/fetch-users.action.ts
- src/actions/user/fetch-users.action.test.ts
- src/interfaces/history-entry.interface.ts
- src/interfaces/scheduled-visit.interface.ts
- src/utils/local-date.util.ts
- src/utils/local-date.util.test.ts
- AGENDA-VISITAS-HOMOLOGACAO.md

## Validação

19 arquivos / 136 testes Vitest passaram com TZ=America/Sao_Paulo.
npx tsc --noEmit e npm run build passaram. O build emite avisos de lint do projeto.

Chromium real em desktop e mobile, conectado ao backend e PostgreSQL 16 locais:
estado vazio correto; quatro visitas criadas pelo formulário, duas para 16/10/2026
e duas para 17/10/2026; somente as duas do dia no sino; avulsas presentes na agenda
e histórico; dez novos clientes e dez produtos fictícios disponíveis nos seletores.
O seletor de responsáveis também foi conferido com userId 2 e vínculo 99.

O relatório detalhado de arquitetura, seed, testes de API e aplicação coordenada
está em AGENDA-VISITAS-HOMOLOGACAO.md do BackAntigo.
Nenhum deploy/merge foi executado. A validação é local e não substitui a aplicação
dos dois PRs no Render de homologação. Produção permanece sem alterações.
