/**
 * badges.js
 * Sistema de conquistas do ReqQuest. Cada badge tem uma condição avaliada ao
 * fim de cada partida (ver GameView.endGame -> Badges.checkAfterGame).
 */

const Badges = (() => {
  const LIST = [
    {
      id: 'primeira-vitoria', name: 'Primeira Vitória', icon: 'assets/icons/badge-primeira-vitoria.png',
      desc: 'Termine sua primeira partida.',
      check: (stats) => stats.totalPartidas >= 1,
    },
    {
      id: 'perfeccionista', name: 'Perfeccionista', icon: 'assets/icons/badge-perfeccionista.png',
      desc: 'Termine uma partida com pelo menos 5 acertos e nenhum erro.',
      check: (stats) => stats.acertos >= 5 && stats.erros === 0,
    },
    {
      id: 'speedrunner', name: 'Speedrunner', icon: 'assets/icons/badge-speedrunner.png',
      desc: 'Responda 5 requisitos rápido, com mais da metade do tempo sobrando.',
      check: (stats) => stats.respostasRapidas >= 5,
    },
    {
      id: 'sequencia-fogo', name: 'Sequência de Fogo', icon: 'assets/icons/badge-sequencia-fogo.png',
      desc: 'Alcance uma sequência de 5 acertos seguidos numa partida.',
      check: (stats) => stats.maiorSequencia >= 5,
    },
  ];

  function checkAfterGame(stats) {
    const progress = DB.getPlayerProgress();
    const novas = [];
    LIST.forEach(b => {
      if (progress.badges.includes(b.id)) return;
      if (b.check(stats)) {
        DB.unlockBadge(b.id);
        novas.push(b);
      }
    });
    return novas;
  }

  return { LIST, checkAfterGame };
})();
