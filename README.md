# ReqQuest

Aplicação web gamificada para ensino e prática da classificação de Requisitos
Funcionais (RF) e Requisitos Não Funcionais (RNF) em Engenharia de Software.
O usuário assume o papel de consultor(a) e evolui de cargo ao classificar
corretamente requisitos apresentados em diferentes cenários ("mundos"),
acompanhando desempenho, conquistas e progresso ao longo do tempo.

Projeto desenvolvido para a disciplina de Full Stack (Frontend Masters).

Desde a última versão, o ReqQuest deixou de ser uma SPA vanilla com dados
mockados em `localStorage` e passou a ser uma aplicação React que fala com um
backend real (Node/Express/Prisma/MySQL, em `backend/`) — login, progresso,
XP, badges e o CRUD de mundos/requisitos agora são persistidos de verdade,
não só na sessão do navegador.

## Tecnologias utilizadas

- **React 18 + Vite** — build/dev server, sem CRA
- **Tailwind CSS** (com `clsx` + `tailwind-merge` para composição de classes) — o CSS visual original foi portado como camada base para garantir paridade, com Tailwind configurado por cima para novos componentes
- **React Router** (`HashRouter`, mantendo as URLs `#/rota` da versão original)
- **Zod** — validação do formulário de login e dos modais de CRUD
- **Web Audio API** — efeitos sonoros gerados por código, sem arquivos de áudio
- **Canvas API** — gráfico de evolução de desempenho
- Backend real em `../backend` (Node.js, TypeScript, Express, Prisma, MySQL) — ver `backend/README.md`

## Funcionalidades

### Requisitos Funcionais implementados

| Código | Descrição |
|--------|-----------|
| RF01 | Login do usuário (nome, telefone e e-mail), autenticado contra o backend (JWT sem senha) |
| RF02 | Exibição do nome do usuário logado e opção de logout no menu de perfil |
| RF03 | Navegação entre seções via menu lateral, incluindo reinício de progresso ("Nova Jornada") |
| RF04 | Dashboard com indicadores de desempenho do usuário |
| RF05 | Acesso a relatórios de desempenho pelo menu lateral |
| RF06 | Listagem de requisitos e mundos em tabela, com paginação |
| RF07 | Filtro e pesquisa de requisitos por texto, mundo e tipo |
| RF08 | Logout |
| RF09 | Pontuação do usuário ao classificar requisitos corretamente, com XP/nível calculados no backend |
| RF10 | Aumento progressivo de dificuldade por nível (redução do tempo por requisito) |

### Requisitos Não Funcionais atendidos

| Código | Descrição |
|--------|-----------|
| RNF01 | Usabilidade — modo claro/escuro, feedback visual e sonoro nas interações |
| RNF02 | Portabilidade — executa em qualquer navegador moderno; o build (Vite) e o backend rodam em Node.js, sem exigir nada além disso do lado de quem desenvolve |
| RNF03 | Compatibilidade — ícones vetoriais próprios (SVG), sem uso de emoji, garantindo aparência consistente entre sistemas operacionais |
| RNF04 | Responsividade — layout adaptado para desktop, tablet e dispositivos móveis |
| RNF05 | Acessibilidade — imagens com texto alternativo descritivo |
| RNF06 | Persistência de dados — progresso do usuário mantido no backend (MySQL via Prisma), com sessão local via token JWT; jogo sem login continua funcionando e é registrado no ranking global como "Anônimo" |

### Funcionalidades adicionais

- 6 mundos temáticos com identidade visual própria (cores, ícones e imagem de fundo configuráveis)
- Sistema de combo com multiplicador de pontuação
- 3 power-ups utilizáveis durante as partidas (dica, tempo extra, pular)
- 4 conquistas (badges) com critérios próprios de desbloqueio, avaliados no backend
- Sistema de XP e progressão de cargo (Estagiário(a) → Mestre dos Requisitos), com página dedicada mostrando a trilha de progressão; cada promoção concede cargas extras de power-up
- Página de guia de referência sobre RF x RNF, com categorias de qualidade e exemplos extraídos dos dados cadastrados
- Gráfico de evolução de pontuação
- Mascote interativo com reações contextuais (acerto, erro, combo, nível)
- Jogo anônimo (sem login) suportado nativamente pelo backend — pontua no ranking global, mas sem XP/badges

## Estrutura do projeto

```
reqquest/
├── index.html              # entry point do Vite
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── public/
│   └── assets/              # mascote, ícones, fundos dos mundos (servidos estaticamente)
├── docs/
│   └── design-reference/    # material de referência de identidade visual
└── src/
    ├── main.jsx              # bootstrap: providers globais + router
    ├── App.jsx                # gate de sessão (login vs. app) e definição de rotas
    ├── data/                  # única camada que fala com o backend (fetch)
    │   ├── db.js               # temas, requisitos, partidas, progresso
    │   ├── auth.js              # login/logout, token JWT
    │   ├── badges.js            # catálogo de conquistas (nomes/ícones/descrições)
    │   ├── sound.js             # efeitos sonoros via Web Audio API
    │   └── apiClient.js         # wrapper de fetch: URL base, Authorization, erros
    ├── hooks/                 # useTemas, useRequisitos, usePartidas, usePlayerProgress...
    ├── contexts/              # Auth, PlayerProgress, Sound, Mascot, Toast, Modal
    ├── components/            # layout (Sidebar/Topbar/ProfileChip), ui, mascote
    ├── pages/                 # uma por rota: Login, Dashboard, Game, Requisitos, Relatorios, Cargos, Guia
    ├── features/              # subcomponentes específicos de cada página (game/, crud/, dashboard/...)
    ├── lib/                   # cn(), confetti, schemas de validação (Zod)
    └── styles/                # Tailwind + CSS base portado da versão original
```

> `js/`, `css/` e a pasta `assets/` na raiz do projeto são a versão vanilla
> anterior à migração para React, mantidas temporariamente só como referência
> de comparação visual/funcional. Serão removidas após a validação final de
> paridade — não são mais usadas pela aplicação (que usa `public/assets/`).

## Como executar

O ReqQuest agora depende de um backend real para login, progresso, XP e
CRUD — não existe mais um modo "só frontend" com dados mockados.

### 1. Subir o backend

```bash
cd backend
docker compose up -d      # sobe MySQL + backend, já aplica migrations e seed
```

Instruções completas (variáveis de ambiente, rodar sem Docker, testes) em
`backend/README.md`. O backend fica disponível em `http://localhost:3000`.

### 2. Rodar o frontend

```bash
cd frontend/reqquest
npm install
npm run dev
```

Acessar a URL impressa no terminal (`http://localhost:5173` por padrão). Se
o backend estiver em outra URL, copie `.env.example` para `.env.local` e
ajuste `VITE_API_URL`.

> O backend só aceita chamadas da origem configurada em `FRONTEND_URL` (CORS)
> — o valor padrão já é `http://localhost:5173`. Rodando o frontend em outra
> porta, ajuste essa variável no `.env` do backend também.

### Build de produção

```bash
npm run build     # gera frontend/reqquest/dist
npm run preview   # serve o build localmente para conferência
```

## Arquitetura de acesso a dados

Todo acesso a dados fica isolado em `src/data/` (`db.js`, `auth.js`,
`badges.js`) — nenhum componente chama `fetch` diretamente; tudo passa pelos
hooks em `src/hooks/`, que mantêm o estado local e re-buscam os dados após
cada mutação. Essa camada existia desde a versão mock (era só `localStorage`)
e foi desenhada exatamente para que a troca por chamadas de rede não exigisse
tocar em nenhuma tela — foi o que aconteceu na prática. O mapeamento completo
endpoint a endpoint (o que cada função de `db.js` chama no backend, e as
diferenças de comportamento entre o mock antigo e a API real) está
documentado em `.claude/docs/integration-plan.md`, na raiz do monorepo.

## Testes

O fluxo principal foi validado manualmente de ponta a ponta contra o backend
real: login (criação e retomada de conta), partida completa com gravação real
no banco e desbloqueio de badge, CRUD de mundos/requisitos autenticado,
modo claro/escuro, sessão persistindo após reload, e logout. O frontend ainda
não tem suíte de testes automatizada própria; o backend tem testes de
integração via Jest + Supertest (`backend/README.md`).

## Limitações e itens em aberto

- Geração de requisitos via IA (Gemini) existe só como mock no backend
  (`POST /requisitos/gerar`); não há tela no frontend para essa funcionalidade.
- Arquivos da versão vanilla (`js/`, `css/`, `assets/` na raiz) ainda não
  foram removidos — ver nota na seção "Estrutura do projeto".
- Documentação complementar do projeto (diagrama de banco de dados, casos de
  uso, mapa do site) é entrega separada e ainda não foi produzida.
- O esquema do banco (`backend/prisma/schema.prisma`) ainda precisa ser
  validado com quem administra o banco de produção antes de qualquer
  migração fora do ambiente de desenvolvimento local.

## Autoria

Concepção, design e implementação original (vanilla JS) por Natália, como
parte da disciplina de Full Stack. Migração para React e integração com o
backend realizadas posteriormente como evolução do projeto.
