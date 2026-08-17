/**
 * badges.js — catálogo de conquistas (nomes/ícones/descrições). Fica só no
 * frontend por design (ver .claude/docs/integration-plan.md na raiz): o
 * backend avalia as condições e persiste só os ids desbloqueados
 * (`badgesNovas` na resposta de `POST /partidas`, `badges` em
 * `GET /usuarios/me/progresso`) — este arquivo nunca decide mais quem
 * desbloqueia o quê, só sabe como mostrar um id de badge na tela.
 */
export const LIST = [
  {
    id: 'primeira-vitoria', name: 'Primeira Vitória', icon: '/assets/icons/badge-primeira-vitoria.png',
    desc: 'Termine sua primeira partida.',
  },
  {
    id: 'perfeccionista', name: 'Perfeccionista', icon: '/assets/icons/badge-perfeccionista.png',
    desc: 'Termine uma partida com pelo menos 5 acertos e nenhum erro.',
  },
  {
    id: 'speedrunner', name: 'Speedrunner', icon: '/assets/icons/badge-speedrunner.png',
    desc: 'Responda 5 requisitos rápido, com mais da metade do tempo sobrando.',
  },
  {
    id: 'sequencia-fogo', name: 'Sequência de Fogo', icon: '/assets/icons/badge-sequencia-fogo.png',
    desc: 'Alcance uma sequência de 5 acertos seguidos numa partida.',
  },
];
