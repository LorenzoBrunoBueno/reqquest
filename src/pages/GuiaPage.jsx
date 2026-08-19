import { useMemo, useState } from 'react';
import { useRequisitos } from '../hooks/useRequisitos';
import { useTemas } from '../hooks/useTemas';
import { useSound } from '../contexts/SoundContext';
import { categoriaDoRequisito, explicarClassificacao } from '../data/db';

const CATEGORIAS = ['Desempenho', 'Confiabilidade', 'Segurança', 'Usabilidade', 'Compatibilidade', 'Manutenibilidade'];

function amostra(lista, n) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n);
}

export default function GuiaPage() {
  const { requisitos } = useRequisitos();
  const { temas } = useTemas();
  const temasById = useMemo(() => Object.fromEntries(temas.map((t) => [t.id, t])), [temas]);
  const sound = useSound();
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [openIds, setOpenIds] = useState(() => new Set());

  const contagem = useMemo(() => {
    const naoFuncionais = requisitos.filter(r => r.tipo === 'nao-funcional');
    const c = {};
    CATEGORIAS.forEach(cat => { c[cat] = 0; });
    naoFuncionais.forEach(r => {
      const cat = categoriaDoRequisito(r);
      if (cat) c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [requisitos]);

  const itensCategoria = useMemo(() => {
    if (!categoriaAtiva) return [];
    return requisitos.filter(r => categoriaDoRequisito(r) === categoriaAtiva);
  }, [requisitos, categoriaAtiva]);

  const exemplos = useMemo(() => {
    const funcionais = amostra(requisitos.filter(r => r.tipo === 'funcional'), 3);
    const naoFuncionais = amostra(requisitos.filter(r => r.tipo === 'nao-funcional'), 3);
    return [...funcionais, ...naoFuncionais];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requisitos, shuffleSeed]);

  function toggleOpen(id) {
    sound.click();
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCategoriaClick(cat) {
    sound.click();
    setCategoriaAtiva((prev) => (prev === cat ? null : cat));
  }

  return (
    <>
      <div className="panel guia-intro-panel" style={{ marginBottom: 20 }}>
        <img className="guia-mascot-peek" src="/assets/mascot/reqi-debrucado-semfio.png" alt="Reqi apoiado no painel, acompanhando a explicação" />
        <h3>O que é um Requisito de Software?</h3>
        <br></br>
        <p className="section-intro">Algo que um sistema precisa fazer, ou uma qualidade que ele precisa ter. É a base de tudo que você classifica no ReqQuest.</p>
      </div>

      <div className="guia-compare">
        <div className="guia-card guia-func">
          <div className="guia-card-head">
            <svg width="22" height="22"><use href="#ic-check" /></svg>
            <h4>Requisito Funcional (RF)</h4>
          </div>
          <p>O que o sistema <b>faz</b>: uma ação ou funcionalidade. Geralmente começa com um verbo — &quot;permitir&quot;, &quot;cadastrar&quot;, &quot;gerar&quot;.</p>
          <p className="guia-example">&quot;O sistema deve permitir cadastrar pratos no cardápio.&quot;</p>
        </div>
        <div className="guia-card guia-naofunc">
          <div className="guia-card-head">
            <svg width="22" height="22"><use href="#ic-gear" /></svg>
            <h4>Requisito Não Funcional (RNF)</h4>
          </div>
          <p>Quão <b>bem</b> o sistema faz: uma qualidade — desempenho, segurança, usabilidade. Costuma vir com números ou padrões técnicos.</p>
          <p className="guia-example">&quot;O sistema deve responder em até 2 segundos.&quot;</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h3>Categorias de qualidade</h3>
        <p className="section-intro">Clique numa categoria pra ver quantos requisitos não funcionais do ReqQuest se encaixam nela, com exemplos reais.</p>
        <div className="guia-categorias" id="guia-categorias">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={`guia-categoria-chip ${categoriaAtiva === c ? 'active' : ''}`}
              onClick={() => handleCategoriaClick(c)}
            >
              <b>{c}</b><span>{contagem[c] || 0} requisito{contagem[c] === 1 ? '' : 's'}</span>
            </button>
          ))}
        </div>
        <div className="guia-categoria-detalhe" id="guia-categoria-detalhe">
          {categoriaAtiva && (
            itensCategoria.length === 0
              ? <p className="guia-exemplo-meta" style={{ marginTop: 10 }}>Nenhum requisito dessa categoria cadastrado ainda.</p>
              : (
                <div className="guia-exemplos" style={{ marginTop: 14 }}>
                  {itensCategoria.map((r) => {
                    const tema = temasById[r.temaId];
                    return (
                      <div className="guia-exemplo-item" key={r.id}>
                        <svg width="16" height="16"><use href="#ic-gear" /></svg>
                        <div><p>{r.texto}</p><span className="guia-exemplo-meta">{tema ? tema.nome : ''}</span></div>
                      </div>
                    );
                  })}
                </div>
              )
          )}
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Exemplos reais do ReqQuest</h3>
          <button className="btn btn-secondary btn-sm" id="guia-embaralhar" onClick={() => { sound.click(); setShuffleSeed(s => s + 1); }}>
            <svg width="15" height="15"><use href="#ic-refresh" /></svg> Ver outros exemplos
          </button>
        </div>
        <p className="section-intro">Puxados ao vivo dos requisitos cadastrados nos mundos do jogo. Clique num item pra ver por quê.</p>
        <div className="guia-exemplos" id="guia-exemplos">
          {exemplos.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>Nenhum requisito cadastrado ainda.</p>
            : exemplos.map((r) => {
              const tema = temasById[r.temaId];
              const isOpen = openIds.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`guia-exemplo-item guia-exemplo-toggle${isOpen ? ' open' : ''}`}
                  onClick={() => toggleOpen(r.id)}
                >
                  <svg width="16" height="16"><use href={`#${r.tipo === 'funcional' ? 'ic-check' : 'ic-gear'}`} /></svg>
                  <div>
                    <p>{r.texto}</p>
                    <span className="guia-exemplo-meta guia-exemplo-hint">
                      {tema ? tema.nome + ' · ' : ''}Por que é {r.tipo === 'funcional' ? 'funcional' : 'não funcional'}? <span className="guia-exemplo-arrow">▾</span>
                    </span>
                    <span className="guia-exemplo-explicacao">{explicarClassificacao(r)}</span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </>
  );
}
