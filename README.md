# ReqQuest

Aplicação web gamificada para ensino e prática da classificação de Requisitos
Funcionais (RF) e Requisitos Não Funcionais (RNF) em Engenharia de Software.
O usuário assume o papel de consultor(a) e evolui de cargo ao classificar
corretamente requisitos apresentados em diferentes cenários ("mundos"),
acompanhando desempenho, conquistas e progresso ao longo do tempo.

Projeto desenvolvido para a disciplina de Full Stack (Frontend Masters).

## Tecnologias utilizadas

- HTML5, CSS3 e JavaScript puro (ES6+), sem frameworks e sem etapa de build
- Web Audio API para efeitos sonoros gerados por código
- Canvas API para o gráfico de evolução de desempenho
- `localStorage` como camada de persistência local (mock de backend)

## Funcionalidades

### Requisitos Funcionais implementados

| Código | Descrição |
|--------|-----------|
| RF01 | Login do usuário (nome, telefone e e-mail) |
| RF02 | Exibição do nome do usuário logado e opção de logout no menu de perfil |
| RF03 | Navegação entre seções via menu lateral, incluindo reinício de progresso ("Nova Jornada") |
| RF04 | Dashboard com indicadores de desempenho do usuário |
| RF05 | Acesso a relatórios de desempenho pelo menu lateral |
| RF06 | Listagem de requisitos e mundos em tabela, com paginação |
| RF07 | Filtro e pesquisa de requisitos por texto, mundo e tipo |
| RF08 | Logout |
| RF09 | Pontuação do usuário ao classificar requisitos corretamente |
| RF10 | Aumento progressivo de dificuldade por nível (redução do tempo por requisito) |

### Requisitos Não Funcionais atendidos

| Código | Descrição |
|--------|-----------|
| RNF01 | Usabilidade — modo claro/escuro, feedback visual e sonoro nas interações |
| RNF02 | Portabilidade — não requer instalação nem build; executa em qualquer navegador moderno |
| RNF03 | Compatibilidade — ícones vetoriais próprios (SVG), sem uso de emoji, garantindo aparência consistente entre sistemas operacionais |
| RNF04 | Responsividade — layout adaptado para desktop, tablet e dispositivos móveis |
| RNF05 | Acessibilidade — imagens com texto alternativo descritivo |
| RNF06 | Persistência de dados — progresso do usuário mantido em `localStorage` entre sessões |

### Funcionalidades adicionais

- 6 mundos temáticos com identidade visual própria (cores, ícones e imagem de fundo configuráveis)
- Sistema de combo com multiplicador de pontuação
- 3 power-ups utilizáveis durante as partidas (dica, tempo extra, pular)
- 4 conquistas (badges) com critérios próprios de desbloqueio
- Sistema de XP e progressão de cargo (Estagiário(a) → Mestre dos Requisitos), com página dedicada mostrando a trilha de progressão; cada promoção concede cargas extras de power-up
- Página de guia de referência sobre RF x RNF, com categorias de qualidade e exemplos extraídos dos dados cadastrados
- Gráfico de evolução de pontuação
- Mascote interativo com reações contextuais (acerto, erro, combo, nível)

## Estrutura do projeto

```
reqquest/
├── index.html
├── css/
│   └── style.css
├── assets/
│   ├── mascot/           # ilustrações do mascote (poses e expressões)
│   └── icons/             # ícones de menu, mundos, power-ups e conquistas
├── docs/
│   └── design-reference/  # material de referência de identidade visual
└── js/
    ├── data.js             # camada de dados (mock): temas, requisitos, progresso, XP
    ├── badges.js            # regras de desbloqueio das conquistas
    ├── sound.js             # efeitos sonoros via Web Audio API
    ├── mascot.js            # componente do mascote (poses e mensagens)
    ├── auth.js              # autenticação (login/logout)
    ├── router.js            # roteamento entre telas (hash routing)
    ├── main.js               # inicialização da aplicação, perfil, tema, reset de progresso
    └── views/
        ├── dashboard.js
        ├── game.js           # lógica principal do jogo
        ├── crud.js           # cadastro e listagem de mundos e requisitos
        ├── relatorios.js     # ranking e gráfico de evolução
        ├── guia.js           # guia de referência RF x RNF
        └── cargos.js         # trilha de progressão de cargo
```

## Como executar

Não há dependências ou etapa de build. Duas formas de execução:

**1. Abertura direta**

Abrir o arquivo `index.html` diretamente no navegador.

**2. Servidor local (recomendado)**

```bash
cd reqquest
python3 -m http.server 8080
```

Em seguida, acessar `http://localhost:8080`.

## Persistência de dados e integração futura

Os dados são mantidos em `localStorage`, simulando uma camada de backend
ainda não integrada. Todo o acesso a dados passa pelo objeto `DB`, definido
em `js/data.js` (por exemplo: `DB.getTemas()`, `DB.addRequisito()`,
`DB.getPlayerProgress()`). Quando a API estiver disponível, a integração deve
ser feita substituindo a implementação interna de cada método por uma
chamada `fetch`, sem necessidade de alterar as telas que consomem `DB`. Caso
a API seja assíncrona, as chamadas a `DB.*` devem ser adaptadas com `await`.

## Testes

O fluxo principal (login, jogo nos 6 mundos, CRUD de requisitos com
paginação, relatórios, guia, reinício de progresso e logout) foi validado por
meio de testes automatizados de fumaça (smoke tests). Recomenda-se uma
validação manual complementar em navegador antes da entrega final.

## Limitações e itens em aberto

- Integração com a API de backend ainda não realizada (dependência de outra
  frente da equipe).
- Documentação complementar do projeto (diagrama de banco de dados, casos de
  uso, mapa do site) é entrega separada e ainda não foi produzida.

## Autoria

Desenvolvido por Natália, como parte da disciplina de Full Stack.
