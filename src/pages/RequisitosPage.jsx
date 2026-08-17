import { useMemo, useState } from 'react';
import { useTemas } from '../hooks/useTemas';
import { useRequisitos } from '../hooks/useRequisitos';
import { useSound } from '../contexts/SoundContext';
import { useToast } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';
import { RANKS } from '../data/db';
import { filterRequisitos, buildPageList, REQ_POR_PAGINA } from '../features/crud/crudLogic';
import RequisitoModalContent from '../features/crud/RequisitoModalContent';
import TemaModalContent from '../features/crud/TemaModalContent';

export default function RequisitosPage() {
  const { temas, addTema, updateTema, deleteTema } = useTemas();
  const { requisitos, addRequisito, updateRequisito, deleteRequisito } = useRequisitos();
  const sound = useSound();
  const { showToast } = useToast();
  const { open } = useModal();

  const [tab, setTab] = useState('requisitos');
  const [filtro, setFiltro] = useState({ texto: '', temaId: '', tipo: '' });
  const [paginaAtual, setPaginaAtual] = useState(1);

  const temasById = useMemo(() => Object.fromEntries(temas.map(t => [t.id, t.nome])), [temas]);
  const filtrados = useMemo(() => filterRequisitos(requisitos, filtro), [requisitos, filtro]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / REQ_POR_PAGINA));
  const paginaClamped = Math.min(Math.max(1, paginaAtual), totalPaginas);
  const inicio = (paginaClamped - 1) * REQ_POR_PAGINA;
  const pagina = filtrados.slice(inicio, inicio + REQ_POR_PAGINA);
  const paginas = buildPageList(totalPaginas, paginaClamped);

  function updateFiltro(campo, valor) {
    setFiltro((f) => ({ ...f, [campo]: valor }));
    setPaginaAtual(1);
  }

  function irParaPagina(p) {
    if (p === paginaClamped) return;
    sound.click();
    setPaginaAtual(p);
  }

  function openNovoRequisito() {
    if (temas.length === 0) { showToast('Cadastre um mundo antes de criar requisitos.'); return; }
    open(<RequisitoModalContent temas={temas} editando={null} onSave={(data) => addRequisito(data)} />);
  }
  function openEditarRequisito(r) {
    open(<RequisitoModalContent temas={temas} editando={r} onSave={(data) => updateRequisito(r.id, data)} />);
  }
  async function handleDeleteRequisito(id) {
    if (!confirm('Excluir este requisito?')) return;
    try {
      await deleteRequisito(id);
      showToast('Requisito excluído.');
    } catch (err) {
      showToast(err.message || 'Não foi possível excluir o requisito.');
    }
  }

  function openNovoTema() {
    open(<TemaModalContent editando={null} onSave={(data) => addTema(data)} />);
  }
  function openEditarTema(t) {
    open(<TemaModalContent editando={t} onSave={(data) => updateTema(t.id, data)} />);
  }
  async function handleDeleteTema(id) {
    if (!confirm('Excluir este mundo e todos os seus requisitos?')) return;
    try {
      await deleteTema(id);
      showToast('Mundo excluído.');
    } catch (err) {
      showToast(err.message || 'Não foi possível excluir o mundo.');
    }
  }

  return (
    <>
      <div className="toolbar">
        <div>
          <button className={`btn ${tab === 'requisitos' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('requisitos')}>Requisitos</button>
          <button className={`btn ${tab === 'temas' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('temas')}>Mundos</button>
        </div>
        <button className="btn btn-primary" onClick={tab === 'requisitos' ? openNovoRequisito : openNovoTema}>
          + Novo {tab === 'requisitos' ? 'Requisito' : 'Mundo'}
        </button>
      </div>

      {tab === 'requisitos' ? (
        <>
          <div className="toolbar">
            <input
              type="search"
              placeholder="Pesquisar requisito..."
              value={filtro.texto}
              onChange={(e) => updateFiltro('texto', e.target.value)}
            />
            <select value={filtro.temaId} onChange={(e) => updateFiltro('temaId', e.target.value)}>
              <option value="">Todos os mundos</option>
              {temas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <select value={filtro.tipo} onChange={(e) => updateFiltro('tipo', e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="funcional">Funcional</option>
              <option value="nao-funcional">Não Funcional</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Requisito</th><th>Mundo</th><th>Tipo</th><th>Ações</th></tr></thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum requisito encontrado.</td></tr>
                ) : pagina.map((r) => (
                  <tr key={r.id}>
                    <td>{r.texto}</td>
                    <td>{temasById[r.temaId] || '—'}</td>
                    <td>
                      <span className={`badge ${r.tipo === 'funcional' ? 'badge-func' : 'badge-nao-func'}`}>
                        <svg width="13" height="13"><use href={`#${r.tipo === 'funcional' ? 'ic-check' : 'ic-gear'}`} /></svg>
                        {r.tipo === 'funcional' ? 'Funcional' : 'Não Funcional'}
                      </span>
                    </td>
                    <td className="row-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditarRequisito(r)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRequisito(r.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtrados.length > 0 && totalPaginas > 1 && (
            <div className="pagination">
              <span className="pagination-info">{filtrados.length} requisito{filtrados.length === 1 ? '' : 's'} · página {paginaClamped} de {totalPaginas}</span>
              <div className="pagination-controls">
                <button className="btn btn-secondary btn-sm" disabled={paginaClamped === 1} onClick={() => irParaPagina(paginaClamped - 1)}>‹ Anterior</button>
                {paginas.map((p, i) => p === '...'
                  ? <span key={`e${i}`} className="pagination-ellipsis">…</span>
                  : <button key={p} className={`pagination-page ${p === paginaClamped ? 'active' : ''}`} onClick={() => irParaPagina(p)}>{p}</button>
                )}
                <button className="btn btn-secondary btn-sm" disabled={paginaClamped === totalPaginas} onClick={() => irParaPagina(paginaClamped + 1)}>Próxima ›</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mundo</th><th>Descrição</th><th>Dificuldade</th><th>Requisitos</th><th>Ações</th></tr></thead>
            <tbody>
              {temas.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum mundo cadastrado.</td></tr>
              ) : temas.map((t) => {
                const tier = t.unlockTier || 1;
                const rank = RANKS.find(r => r.tier === tier);
                return (
                  <tr key={t.id}>
                    <td><div className="mundo-cell"><img src={t.icone} alt="" />{t.nome}</div></td>
                    <td>{t.descricao || '—'}</td>
                    <td><span className="tier-pill"><span className="tier-num">{tier}</span>{rank ? rank.title.split(' ')[0] : '—'}</span></td>
                    <td>{requisitos.filter((r) => r.temaId === t.id).length}</td>
                    <td className="row-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditarTema(t)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTema(t.id)}>Excluir</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
