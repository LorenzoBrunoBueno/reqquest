export default function GameOverPanel({ result, onPlayAgain }) {
  const {
    score, acertos, erros, maxStreak, deckCompleto, timeLeft, bonusTempo,
    novoRecorde, xpGanho, leveledUp, novasBadges, pose,
  } = result;
  const titulo = deckCompleto ? 'Baralho completo!' : 'Missão concluída!';

  return (
    <div className="game-over-panel">
      <img src={`/assets/mascot/reqi-${pose}.png`} alt="Reqi" />
      <h2>{titulo}</h2>
      <div className="score-big">{score} pts</div>
      {novoRecorde && score > 0 && <p className="xp-gain">Novo recorde de pontuação!</p>}
      <p>{acertos} acertos &nbsp;•&nbsp; {erros} erros &nbsp;•&nbsp; sequência máx. {maxStreak}</p>
      {deckCompleto && <p>Você classificou todos os requisitos desse mundo com {timeLeft}s sobrando (+{bonusTempo} pts de bônus).</p>}
      <p className="xp-gain">+{xpGanho} XP {leveledUp ? '— você subiu de nível!' : ''}</p>
      {novasBadges.length > 0 && (
        <div className="panel" style={{ margin: '18px auto', maxWidth: 420 }}>
          <h3 style={{ marginBottom: 10 }}>Nova(s) conquista(s)!</h3>
          <div className="badges-grid">
            {novasBadges.map((b) => (
              <div key={b.id} className="badge-tile">
                <img src={b.icon} alt="" />
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.desc}</div>
                <div className="badge-status">Desbloqueada</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button className="btn btn-primary" onClick={onPlayAgain}>Jogar de novo</button>
        <a className="btn btn-secondary" href="#/relatorios">Ver relatórios</a>
      </div>
    </div>
  );
}
