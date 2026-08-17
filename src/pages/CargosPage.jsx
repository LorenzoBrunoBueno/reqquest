import { usePlayerProgress } from '../contexts/PlayerProgressContext';
import { RANKS, XP_PER_LEVEL, powerupsForTier } from '../data/db';

const POWERUP_LABEL = { dica: 'Dica', 'tempo-extra': 'Tempo Extra', pular: 'Pular' };
const POWERUP_ICON = { dica: 'ic-powerup-dica', 'tempo-extra': 'ic-powerup-tempo', pular: 'ic-powerup-pular' };
const POWERUP_CLS = { dica: 'pw-dica', 'tempo-extra': 'pw-tempo', pular: 'pw-pular' };

export default function CargosPage() {
  const { level, xpIntoLevel, tier: tierAtual } = usePlayerProgress();

  return (
    <>
      <div className="panel cargos-intro-panel" style={{ marginBottom: 20 }}>
        <img className="cargos-mascot-sticker" src="/assets/mascot/reqi-cargos-peek.png" alt="Reqi apoiado no painel, acompanhando sua trilha de carreira" />
        <h3>Sua trilha de carreira</h3>
        <p className="section-intro">
          Todos os mundos já estão liberados pra você jogar. Cada acerto rende XP e, a cada
          {' '}{XP_PER_LEVEL} XP, você sobe de nível — ao atingir certos níveis, é promovido(a) de cargo
          e ganha mais cargas de power-up pra usar nas partidas.
        </p>
        <div className="cargo-current">
          <div className="cargo-current-value">{xpIntoLevel} / {XP_PER_LEVEL} XP no nível {level}</div>
          <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${xpIntoLevel}%` }}></div></div>
        </div>
      </div>

      <div className="cargo-ladder" id="cargo-ladder">
        {[...RANKS].reverse().map((rank) => {
          const alcancado = tierAtual >= rank.tier;
          const atual = tierAtual === rank.tier;
          const powerups = powerupsForTier(rank.tier);
          return (
            <div key={rank.tier} className={`cargo-card${alcancado ? ' reached' : ''}${atual ? ' current' : ''}`}>
              <div className="cargo-badge">{rank.tier}</div>
              <div className="cargo-info">
                <div className="cargo-title">
                  {rank.title} {atual && <span className="cargo-you">você está aqui</span>}
                </div>
                <div className="cargo-range">Nível {rank.min}{rank.max === Infinity ? '+' : ` a ${rank.max}`}</div>
                <div className="cargo-worlds">
                  {Object.entries(powerups).map(([key, qtd]) => (
                    <span key={key} className={`cargo-world-chip ${alcancado ? '' : 'locked'}`}>
                      <span className={`powerup-icon-wrap sm ${POWERUP_CLS[key]}`}><svg width="13" height="13"><use href={`#${POWERUP_ICON[key]}`} /></svg></span>{qtd}x {POWERUP_LABEL[key]}
                    </span>
                  ))}
                </div>
                {rank.tier === 5 && <div className="cargo-worlds-empty">No topo da carreira, sua reputação vira lenda na consultoria.</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
