import { useMemo, useState } from 'react';
import { useTemas } from '../hooks/useTemas';
import { usePartidas } from '../hooks/usePartidas';
import { usePlayerProgress } from '../contexts/PlayerProgressContext';
import { LIST as BADGES_LIST } from '../data/badges';
import ScoreChart from '../features/relatorios/ScoreChart';

export default function RelatoriosPage() {
  const { temas } = useTemas();
  const { partidas } = usePartidas();
  const { progress } = usePlayerProgress();
  const [filtroTema, setFiltroTema] = useState('');

  const desbloqueadas = progress.badges.length;

  const ordenadas = useMemo(() => {
    let lista = partidas;
    if (filtroTema) lista = lista.filter(p => p.temaId === filtroTema);
    return [...lista].sort((a, b) => b.score - a.score);
  }, [partidas, filtroTema]);

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <h3>Evolução de pontuação</h3>
        <br></br>
        <p className="section-intro">Pontuação de cada partida jogada, em ordem cronológica.</p>
        <ScoreChart partidas={partidas} />
      </div>

      <div className="panel relatorios-conquistas-panel" style={{ marginBottom: 20 }}>
        <img className="relatorios-mascot-peek" src="/assets/mascot/reqi-debrucado-alt.png" alt="Reqi acompanhando suas conquistas" />
        <h3>Conquistas</h3>
        <br></br>
        <p className="section-intro">{desbloqueadas} de {BADGES_LIST.length} conquistas desbloqueadas até agora.</p>
        <div className="badges-grid" id="rel-badges">
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

      <div className="panel">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Ranking de partidas</h3>
          <select id="f-tema" value={filtroTema} onChange={(e) => setFiltroTema(e.target.value)}>
            <option value="">Todos os mundos</option>
            {temas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Jogador</th><th>Mundo</th><th>Pontos</th><th>Acertos</th><th>Erros</th><th>Nível</th><th>Data</th></tr></thead>
            <tbody id="rank-tbody">
              {ordenadas.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma partida registrada ainda. Vá jogar!</td></tr>
              ) : ordenadas.map((p, i) => (
                <tr key={p.id}>
                  <td>{i < 3 ? <span className={`rank-pos rank-pos-${i + 1}`}>{i + 1}</span> : i + 1}</td>
                  <td>{p.usuarioNome}</td>
                  <td>{p.temaNome}</td>
                  <td><b>{p.score}</b></td>
                  <td>{p.acertos}</td>
                  <td>{p.erros}</td>
                  <td>{p.nivel}</td>
                  <td>{new Date(p.dataJogo).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
