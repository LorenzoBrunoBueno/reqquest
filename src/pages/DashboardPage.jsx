import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { usePlayerProgress } from '../contexts/PlayerProgressContext';
import { useTemas } from '../hooks/useTemas';
import { useRequisitos } from '../hooks/useRequisitos';
import { usePartidas } from '../hooks/usePartidas';
import { LIST as BADGES_LIST } from '../data/badges';
import TutorialModalContent from '../features/dashboard/TutorialModalContent';

export default function DashboardPage() {
  const { temas } = useTemas();
  const { requisitos } = useRequisitos();
  const { partidas } = usePartidas();
  const { progress, level, rank } = usePlayerProgress();
  const { usuario } = useAuth();
  const { open } = useModal();

  const funcionais = requisitos.filter(r => r.tipo === 'funcional').length;
  const naoFuncionais = requisitos.filter(r => r.tipo === 'nao-funcional').length;
  const melhorScore = partidas.reduce((max, p) => Math.max(max, p.score), 0);
  const desbloqueadas = progress.badges.length;
  const pctBadges = Math.round((desbloqueadas / BADGES_LIST.length) * 100);

  return (
    <>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        Bem-vindo(a), <b>{usuario ? usuario.nome : ''}</b> — você é <b>{rank.title}</b> (nível {level}).
        {' '}<a href="#/cargos" className="rank-link">Ver trilha de cargos</a>
      </p>

      <div className="cards-grid">
        <div className="stat-card"><span className="stat-icon-wrap wrap-blue"><svg className="stat-icon"><use href="#ic-worlds" /></svg></span><div><div className="stat-value">{temas.length}</div><div className="stat-label">Mundos disponíveis</div></div></div>
        <div className="stat-card"><span className="stat-icon-wrap wrap-green"><svg className="stat-icon"><use href="#ic-check" /></svg></span><div><div className="stat-value">{funcionais}</div><div className="stat-label">Requisitos Funcionais</div></div></div>
        <div className="stat-card"><span className="stat-icon-wrap wrap-orange"><svg className="stat-icon"><use href="#ic-gear" /></svg></span><div><div className="stat-value">{naoFuncionais}</div><div className="stat-label">Requisitos Não Funcionais</div></div></div>
        <div className="stat-card"><span className="stat-icon-wrap wrap-purple"><svg className="stat-icon"><use href="#ic-nav-play" /></svg></span><div><div className="stat-value">{partidas.length}</div><div className="stat-label">Partidas jogadas</div></div></div>
        <div className="stat-card"><span className="stat-icon-wrap wrap-gold"><svg className="stat-icon"><use href="#ic-trophy" /></svg></span><div><div className="stat-value">{melhorScore}</div><div className="stat-label">Melhor pontuação</div></div></div>
      </div>

      <div className="hero-panel">
        <div className="hero-text">
          <h3>Pronto pra próxima missão?</h3>
          <p>Escolha um mundo e arraste os requisitos pra caixa certa antes que o tempo acabe. Sequências de acertos aumentam seu multiplicador de pontos.</p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-hero" href="#/jogo"><svg width="16" height="16"><use href="#ic-nav-play" /></svg> Ir para o jogo</a>
            <button className="btn btn-ghost-light" id="btn-tutorial" onClick={() => open(<TutorialModalContent />)}>
              <svg width="16" height="16"><use href="#ic-video" /></svg> Como jogar
            </button>
          </div>
        </div>
        <div className="hero-mascot"><img src="/assets/mascot/reqi-empolgado.png" alt="Reqi" /></div>
      </div>

      <div className="panel">
        <div className="badges-head">
          <div>
            <h3 style={{ margin: 0 }}>Suas conquistas</h3>
            <p className="badges-intro">Cada conquista é desbloqueada ao cumprir um desafio específico durante as partidas.</p>
          </div>
          <div className="badges-progress">
            <span>{desbloqueadas} / {BADGES_LIST.length}</span>
            <div className="badges-progress-track"><div className="badges-progress-fill" style={{ width: `${pctBadges}%` }}></div></div>
          </div>
        </div>
        <div className="badges-grid" id="dash-badges">
          {BADGES_LIST.map((b) => {
            const unlocked = progress.badges.includes(b.id);
            return (
              <div key={b.id} className={`badge-tile${unlocked ? '' : ' locked'}`}>
                <img src={b.icon} alt="" />
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.desc}</div>
                <div className="badge-status">{unlocked ? 'Desbloqueada' : 'Ainda bloqueada'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
