import { RANKS } from '../../data/db';

export default function WorldSelectGrid({ temas, requisitos, onSelect, tier = 5 }) {
  return (
    <div className="panel">
      <h3>Escolha um mundo para jogar</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Classifique os requisitos antes que o tempo acabe.</p>
      <div className="theme-grid" id="theme-grid">
        {temas.length === 0 ? (
          <p>Nenhum mundo cadastrado ainda. Vá em &quot;Requisitos&quot; e crie um.</p>
        ) : temas.map((t) => {
          const qtd = requisitos.filter((r) => r.temaId === t.id).length;
          const style = t.fundo
            ? { background: `linear-gradient(180deg, rgba(10,12,25,.2), rgba(10,12,25,.55)), url('${t.fundo}') center/cover` }
            : { background: `linear-gradient(160deg, ${t.gradStart}, ${t.gradEnd})` };
          const necessario = t.unlockTier || 1;
          const bloqueado = necessario > tier;
          const rank = RANKS.find((r) => r.tier === necessario);
          return (
            <div
              key={t.id}
              className={`theme-card${t.fundo ? ' has-preview' : ''}${bloqueado ? ' locked' : ''}`}
              style={style}
              onClick={() => { if (!bloqueado) onSelect(t, qtd); }}
            >
              {bloqueado && (
                <div className="theme-card-lock-badge">
                  <svg width="13" height="13"><use href="#ic-lock" /></svg>
                  Libera no cargo {rank ? rank.title.split(' ')[0] : necessario}
                </div>
              )}
              <img src={t.icone} alt="" />
              <h4>{t.nome}</h4>
              <p>{t.descricao || ''}</p>
              <p>{qtd} requisitos</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}