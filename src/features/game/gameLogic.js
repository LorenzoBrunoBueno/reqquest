/**
 * gameLogic.js
 * Funções puras + reducer do núcleo do jogo, portados de js/views/game.js.
 * Mantidas fora do componente para serem testáveis isoladamente e pra manter
 * o componente GamePage focado em efeitos/eventos, não em regras de pontuação.
 */
export const GAME_SECONDS = 60;
export const BASE_QUESTION_TIME = 8;
export const MIN_QUESTION_TIME = 3;
export const LEVEL_UP_EVERY = 5; // acertos seguidos p/ subir de nível de dificuldade

export function multiplierForStreak(streak) {
  if (streak >= 8) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function questionTimeForLevel(nivel) {
  return Math.max(MIN_QUESTION_TIME, BASE_QUESTION_TIME - (nivel - 1) * 0.7);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const initialGameState = { screen: 'setup' };

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const { tema, powerups } = action;
      return {
        screen: 'playing', tema,
        pool: shuffle(action.requisitos), poolIndex: 0,
        score: 0, acertos: 0, erros: 0,
        streak: 0, maxStreak: 0, respostasRapidas: 0,
        nivel: 1, timeLeft: GAME_SECONDS, locked: false,
        current: null, selectedId: null,
        powerups,
      };
    }
    case 'GAME_TICK':
      return { ...state, timeLeft: state.timeLeft - 1 };
    case 'NEXT_QUESTION': {
      const current = state.pool[state.poolIndex];
      return {
        ...state,
        current,
        poolIndex: state.poolIndex + 1,
        selectedId: null,
        locked: false,
        currentQTime: questionTimeForLevel(state.nivel),
        currentElapsed: 0,
      };
    }
    case 'QUESTION_TICK':
      return { ...state, currentElapsed: state.currentElapsed + 0.1 };
    case 'SELECT_CARD':
      return { ...state, selectedId: state.selectedId ? null : action.id };
    case 'ANSWER_CORRECT': {
      const multiplier = multiplierForStreak(state.streak);
      const streak = state.streak + 1;
      const nivelUp = streak > 0 && streak % LEVEL_UP_EVERY === 0;
      return {
        ...state,
        score: state.score + 10 * multiplier,
        acertos: state.acertos + 1,
        streak,
        maxStreak: Math.max(state.maxStreak, streak),
        respostasRapidas: state.respostasRapidas + (action.foiRapido ? 1 : 0),
        nivel: nivelUp ? state.nivel + 1 : state.nivel,
        locked: true,
      };
    }
    case 'ANSWER_WRONG':
      return {
        ...state,
        score: Math.max(0, state.score - 5),
        erros: state.erros + 1,
        streak: 0,
        locked: true,
      };
    case 'USE_POWERUP_DICA':
      return { ...state, powerups: { ...state.powerups, dica: state.powerups.dica - 1 } };
    case 'USE_POWERUP_TEMPO':
      return {
        ...state,
        powerups: { ...state.powerups, 'tempo-extra': state.powerups['tempo-extra'] - 1 },
        timeLeft: state.timeLeft + 10,
      };
    case 'USE_POWERUP_PULAR':
      return { ...state, powerups: { ...state.powerups, pular: state.powerups.pular - 1 } };
    case 'END_GAME':
      return { ...state, screen: 'over', score: state.score + action.bonusTempo };
    case 'RESET_TO_SETUP':
      return { screen: 'setup' };
    default:
      return state;
  }
}
