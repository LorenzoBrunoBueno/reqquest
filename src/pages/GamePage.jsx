import { useEffect, useReducer, useRef, useState } from 'react';
import { useTemas } from '../hooks/useTemas';
import { useRequisitos } from '../hooks/useRequisitos';
import { usePartidas } from '../hooks/usePartidas';
import { usePlayerProgress } from '../contexts/PlayerProgressContext';
import { useSound } from '../contexts/SoundContext';
import { useMascot } from '../contexts/MascotContext';
import { useToast } from '../contexts/ToastContext';
import { confetti } from '../lib/confetti';
import { powerupsForTier, explicarClassificacao } from '../data/db';
import { LIST as BADGES_LIST } from '../data/badges';
import {
  gameReducer, initialGameState, multiplierForStreak, LEVEL_UP_EVERY,
} from '../features/game/gameLogic';
import WorldSelectGrid from '../features/game/WorldSelectGrid';
import GameOverPanel from '../features/game/GameOverPanel';

const POWERUP_DEFS = [
  { key: 'dica', icon: 'ic-powerup-dica', cls: 'pw-dica', label: 'Dica' },
  { key: 'tempo-extra', icon: 'ic-powerup-tempo', cls: 'pw-tempo', label: 'Tempo Extra' },
  { key: 'pular', icon: 'ic-powerup-pular', cls: 'pw-pular', label: 'Pular' },
];

export default function GamePage() {
  const { temas } = useTemas();
  const { requisitos: todosRequisitos } = useRequisitos();
  const { partidas, addPartida } = usePartidas();
  const { tier, applyPartidaResult } = usePlayerProgress();
  const sound = useSound();
  const mascot = useMascot();
  const { showToast } = useToast();

  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const [feedback, setFeedback] = useState(null); // { tipo, correct }
  const [hintZone, setHintZone] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    mascot.say('Escolha um mundo pra começar sua missão!', 'neutro', 3500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
<br></br>
  // ---------------- timer do jogo (1s) ----------------
  useEffect(() => {
    if (state.screen !== 'playing') return;
    const id = setInterval(() => {
      const s = stateRef.current;
      const newTimeLeft = s.timeLeft - 1;
      if (newTimeLeft <= 10 && newTimeLeft > 0) sound.countdown();
      dispatch({ type: 'GAME_TICK' });
      if (newTimeLeft <= 0) endGame({});
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen]);

  // ---------------- timer da pergunta (100ms) ----------------
  useEffect(() => {
    if (state.screen !== 'playing' || !state.current) return;
    const id = setInterval(() => {
      const s = stateRef.current;
      if (s.locked) return;
      const newElapsed = s.currentElapsed + 0.1;
      dispatch({ type: 'QUESTION_TICK' });
      if (newElapsed >= s.currentQTime) registerAnswer(null);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen, state.current]);

  // primeira pergunta ao entrar em "playing"
  useEffect(() => {
    if (state.screen === 'playing' && state.current === null && state.poolIndex === 0) {
      nextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen]);

  function startGame(tema, qtd) {
    if (qtd === 0) { showToast('Esse mundo não tem requisitos cadastrados.'); return; }
    sound.click();
    const requisitos = todosRequisitos.filter((r) => r.temaId === tema.id);
    const powerups = powerupsForTier(tier);
    dispatch({ type: 'START_GAME', tema, requisitos, powerups });
    mascot.say(`Bem-vindo(a) ao ${tema.nome}! Vamos lá!`, 'neutro', 3000);
  }

  function nextQuestion() {
    const s = stateRef.current;
    if (s.screen !== 'playing') return;
    if (s.poolIndex >= s.pool.length) { endGame({ deckCompleto: true }); return; }
    dispatch({ type: 'NEXT_QUESTION' });
  }

  function registerAnswer(tipoEscolhido) {
    const s = stateRef.current;
    if (!s.current || s.locked) return;
    const correto = tipoEscolhido === s.current.tipo;
    const foiRapido = s.currentElapsed < s.currentQTime * 0.5;

    if (tipoEscolhido === null) showToast('Tempo esgotado!');

    setFeedback({ tipo: s.current.tipo, correct: correto });

    if (correto) {
      const streak = s.streak + 1;
      dispatch({ type: 'ANSWER_CORRECT', foiRapido });
      sound.acerto();
      if (streak > 0 && streak % LEVEL_UP_EVERY === 0) {
        sound.levelUp();
        confetti(24);
        mascot.say(`Nível ${s.nivel + 1}! Ficou mais rápido!`, 'empolgado', 2600);
      } else if (streak >= 3) {
        mascot.say(`Sequência x${multiplierForStreak(streak)}!`, 'empolgado', 1600);
      } else {
        mascot.say('Boa! Acertou.', 'empolgado', 1400);
      }
    } else {
      dispatch({ type: 'ANSWER_WRONG' });
      sound.erro();
      const explicacao = explicarClassificacao(s.current);
      mascot.say(`Ops, não foi essa. ${explicacao}`, 'confuso', 4200);
    }

    setTimeout(() => { setFeedback(null); nextQuestion(); }, 400);
  }

  function activatePowerup(key) {
    const s = stateRef.current;
    if (s.powerups[key] <= 0) return;
    sound.powerUp();
    if (key === 'dica') {
      dispatch({ type: 'USE_POWERUP_DICA' });
      setHintZone(s.current.tipo);
      setTimeout(() => setHintZone(null), 1400);
      mascot.say('Presta atenção nessa caixa que brilhou...', 'pensativo', 2200);
    } else if (key === 'tempo-extra') {
      dispatch({ type: 'USE_POWERUP_TEMPO' });
      mascot.say('+10 segundos pra você!', 'empolgado', 2000);
    } else if (key === 'pular') {
      dispatch({ type: 'USE_POWERUP_PULAR' });
      mascot.say('Bora pular esse!', 'neutro', 1800);
      nextQuestion();
    }
  }

  async function endGame(opts = {}) {
    const s = stateRef.current;
    const deckCompleto = !!opts.deckCompleto;
    const melhorAnterior = partidas.reduce((max, p) => Math.max(max, p.score), 0);
    const bonusTempo = deckCompleto ? s.timeLeft * 2 : 0;
    const scoreFinal = s.score + bonusTempo;
    const novoRecorde = scoreFinal > melhorAnterior;

    dispatch({ type: 'END_GAME', bonusTempo });

    // Uma única chamada transacional: o backend calcula XP/nível e badges
    // novos e devolve tudo junto (ver data/db.js::addPartida e
    // .claude/docs/integration-plan.md §3) — sem usuário logado, `progresso`
    // volta null e a partida ainda é registrada no ranking global (anônima).
    let progresso = null;
    let badgesNovas = [];
    try {
      const resultado = await addPartida({
        temaId: s.tema.id,
        score: scoreFinal, acertos: s.acertos, erros: s.erros, nivel: s.nivel,
        maiorSequencia: s.maxStreak, respostasRapidas: s.respostasRapidas,
        deckCompleto,
      });
      progresso = resultado.progresso;
      badgesNovas = resultado.badgesNovas;
    } catch {
      showToast('Não foi possível salvar a partida — verifique sua conexão.');
    }
    applyPartidaResult(progresso, badgesNovas);

    const xpGanho = s.acertos * 10 + (deckCompleto ? 20 : 0);
    const leveledUp = !!(progresso && progresso.leveledUp);
    const novasBadgesObjs = badgesNovas.map((id) => BADGES_LIST.find((b) => b.id === id)).filter(Boolean);

    sound.gameOver(scoreFinal);
    confetti(leveledUp || novasBadgesObjs.length > 0 ? 40 : 16);

    let pose;
    if (deckCompleto && s.erros === 0) pose = 'comemorando';
    else if (novoRecorde && scoreFinal > 0) pose = 'surpreso';
    else if (s.erros === 0 && s.acertos > 0) pose = 'empolgado';
    else if (s.acertos >= s.erros) pose = 'neutro';
    else pose = 'triste';

    setResult({
      score: scoreFinal, acertos: s.acertos, erros: s.erros, maxStreak: s.maxStreak,
      deckCompleto, timeLeft: s.timeLeft, bonusTempo, novoRecorde, xpGanho,
      leveledUp, novasBadges: novasBadgesObjs, pose,
    });

    let falaFinal = 'Boa partida! Bora ver os próximos mundos?';
    if (novasBadgesObjs.length > 0) falaFinal = 'Mandou bem, desbloqueou conquista nova!';
    else if (deckCompleto) falaFinal = 'Uau, você limpou o baralho inteiro!';
    else if (novoRecorde && scoreFinal > 0) falaFinal = 'Novo recorde de pontuação, uau!';
    mascot.say(falaFinal, pose, 3500);
  }

  function playAgain() {
    setResult(null);
    dispatch({ type: 'RESET_TO_SETUP' });
  }

  // ================= RENDER =================
  if (state.screen === 'setup') {
    return <WorldSelectGrid temas={temas} requisitos={todosRequisitos} onSelect={startGame} />;
  }

  if (state.screen === 'over') {
    return result ? <GameOverPanel result={result} onPlayAgain={playAgain} /> : null;
  }

  // screen === 'playing'
  const t = state.tema;
  const temFundo = !!t.fundo;
  const gameScreenStyle = temFundo
    ? { backgroundImage: `url('${t.fundo}')` }
    : { background: `linear-gradient(160deg, ${t.gradStart}, ${t.gradEnd})` };
  const multiplier = multiplierForStreak(state.streak);
  const pontos = state.current ? 10 * multiplier : 0;
  const total = state.pool.length;
  const posicao = state.current ? (((state.poolIndex - 1) % total) + 1) : 0;
  const questionPct = state.current ? Math.max(0, 100 - (state.currentElapsed / state.currentQTime) * 100) : 100;

  function zoneClassName(tipo) {
    const base = `drop-zone ${tipo === 'funcional' ? 'func' : 'nao-func'}`;
    const classes = [base];
    if (dragOverZone === tipo || hintZone === tipo) classes.push('drag-over');
    if (feedback && feedback.tipo === tipo) classes.push(feedback.correct ? 'correct' : 'wrong');
    return classes.join(' ');
  }

  function handleZoneAnswer(tipo) {
    if (state.selectedId) registerAnswer(tipo);
  }

  return (
    <div className={`game-screen${temFundo ? ' has-bg-image' : ''}`} id="game-screen" style={gameScreenStyle}>
      <div className="game-hud">
        <div className="hud-left"><img src={t.icone} alt="" /><span>{t.nome}</span></div>
        <div className="hud-stats">
          <div className="hud-item"><span>PONTOS</span><span id="hud-score">{state.score}</span></div>
          <div className="hud-item"><span>NÍVEL</span><span id="hud-level">{state.nivel}</span></div>
          <div className="hud-item"><span>ACERTOS</span><span id="hud-acertos">{state.acertos}</span></div>
        </div>
        <div className={`hud-timer${state.timeLeft <= 10 ? ' low' : ''}`} id="hud-time-wrap"><span id="hud-time">{state.timeLeft}s</span></div>
        <div className="hud-powerups" id="hud-powerups">
          {POWERUP_DEFS.map((d) => (
            <button
              key={d.key}
              className="powerup-btn"
              title={d.label}
              disabled={state.powerups[d.key] <= 0}
              onClick={() => activatePowerup(d.key)}
            >
              <span className={`powerup-icon-wrap ${d.cls}`}><svg width="18" height="18"><use href={`#${d.icon}`} /></svg></span>
              <span className="powerup-count">{state.powerups[d.key]}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" id="quit-game" onClick={() => endGame({})}>Encerrar</button>
      </div>

      <div className="question-progress"><div id="question-bar" className="question-progress-fill" style={{ width: `${questionPct}%` }}></div></div>

      <div className="game-arena" id="game-arena">
        {state.current && (
          <div
            className={`req-card${feedback && !feedback.correct ? ' shake' : ''}${state.selectedId ? ' selected' : ''}`}
            id="req-card"
            key={state.current.id}
            draggable="true"
            onDragStart={(e) => { e.dataTransfer.setData('text/plain', state.current.id); dispatch({ type: 'SELECT_CARD', id: state.current.id }); }}
            onClick={() => dispatch({ type: 'SELECT_CARD', id: state.current.id })}
          >
            <div className="req-meta">Carta {posicao} de {total} · arraste para classificar</div>
            {state.current.texto}
            <div className="req-points">+{pontos} pts</div>
          </div>
        )}
        {state.streak >= 3 && <div className="combo-badge">Sequência x{multiplier}</div>}
      </div>

      <div className="drop-zones">
        <div
          className={zoneClassName('funcional')}
          id="zone-funcional"
          onDragOver={(e) => { e.preventDefault(); setDragOverZone('funcional'); }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={(e) => { e.preventDefault(); setDragOverZone(null); registerAnswer('funcional'); }}
          onClick={() => handleZoneAnswer('funcional')}
        >
          <svg width="34" height="34"><use href="#ic-check" /></svg>
          <span className="zone-title">Requisito Funcional</span>
        </div>
        <div
          className={zoneClassName('nao-funcional')}
          id="zone-nao-funcional"
          onDragOver={(e) => { e.preventDefault(); setDragOverZone('nao-funcional'); }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={(e) => { e.preventDefault(); setDragOverZone(null); registerAnswer('nao-funcional'); }}
          onClick={() => handleZoneAnswer('nao-funcional')}
        >
          <svg width="34" height="34"><use href="#ic-gear" /></svg>
          <span className="zone-title">Requisito Não Funcional</span>
        </div>
      </div>
    </div>
  );
}
