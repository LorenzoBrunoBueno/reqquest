import { useEffect, useRef, useState } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useToast } from '../../contexts/ToastContext';
import { RANKS } from '../../data/db';
import { temaSchema } from '../../lib/validation/temaSchema';

const ICONE_PADRAO = '/assets/icons/world-detetives.svg';
const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const TAMANHO_MAX_BYTES = 2 * 1024 * 1024;

function revogarSePreview(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

export default function TemaModalContent({ editando, onSave }) {
  const { close } = useModal();
  const { showToast } = useToast();
  const nomeRef = useRef(null);
  const descRef = useRef(null);
  const tierRef = useRef(null);

  const [cor1, setCor1] = useState(editando ? editando.gradStart : '#2563eb');
  const [cor2, setCor2] = useState(editando ? editando.gradEnd : '#7c3aed');
  const unlockTier = editando ? (editando.unlockTier || 1) : 1;

  const [iconeFile, setIconeFile] = useState(null);
  const [iconePreview, setIconePreview] = useState(editando?.icone || ICONE_PADRAO);
  const [removerIcone, setRemoverIcone] = useState(false);

  const [fundoFile, setFundoFile] = useState(null);
  const [fundoPreview, setFundoPreview] = useState(editando?.fundo || null);
  const [removerFundo, setRemoverFundo] = useState(false);

  // Revoga as URLs de preview criadas com URL.createObjectURL ao desmontar,
  // pra não acumular blobs vivos na memória do navegador.
  useEffect(() => () => { revogarSePreview(iconePreview); revogarSePreview(fundoPreview); }, [iconePreview, fundoPreview]);

  function arquivoValido(file) {
    if (!TIPOS_ACEITOS.includes(file.type)) {
      showToast('Tipo de arquivo não suportado. Use PNG, JPEG, WEBP ou SVG.');
      return false;
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      showToast('Arquivo muito grande (máximo 2MB).');
      return false;
    }
    return true;
  }

  function handleIconeFile(e) {
    const file = e.target.files?.[0] || null;
    if (file && !arquivoValido(file)) { e.target.value = ''; return; }
    revogarSePreview(iconePreview);
    setIconeFile(file);
    setRemoverIcone(false);
    setIconePreview(file ? URL.createObjectURL(file) : (editando?.icone || ICONE_PADRAO));
  }

  function handleRemoverIcone(checked) {
    setRemoverIcone(checked);
    setIconeFile(null);
    revogarSePreview(iconePreview);
    setIconePreview(checked ? ICONE_PADRAO : (editando?.icone || ICONE_PADRAO));
  }

  function handleFundoFile(e) {
    const file = e.target.files?.[0] || null;
    if (file && !arquivoValido(file)) { e.target.value = ''; return; }
    revogarSePreview(fundoPreview);
    setFundoFile(file);
    setRemoverFundo(false);
    setFundoPreview(file ? URL.createObjectURL(file) : (editando?.fundo || null));
  }

  function handleRemoverFundo(checked) {
    setRemoverFundo(checked);
    setFundoFile(null);
    revogarSePreview(fundoPreview);
    setFundoPreview(checked ? null : (editando?.fundo || null));
  }

  async function handleSave() {
    const result = temaSchema.safeParse({
      nome: nomeRef.current.value,
      descricao: descRef.current.value,
      gradStart: cor1,
      gradEnd: cor2,
      unlockTier: tierRef.current.value,
    });
    if (!result.success) { showToast(result.error.issues[0].message); return; }

    const formData = new FormData();
    Object.entries(result.data).forEach(([campo, valor]) => {
      if (valor !== undefined && valor !== null) formData.append(campo, String(valor));
    });
    if (iconeFile) formData.append('iconeArquivo', iconeFile);
    if (fundoFile) formData.append('fundoArquivo', fundoFile);
    if (removerIcone) formData.append('removerIcone', 'true');
    if (removerFundo) formData.append('removerFundo', 'true');

    try {
      await onSave(formData);
      showToast('Mundo salvo!');
      close();
    } catch (err) {
      showToast(err.message || 'Não foi possível salvar o mundo.');
    }
  }

  return (
    <>
      <h3>{editando ? 'Editar' : 'Novo'} Mundo</h3>
      <label>Nome do mundo</label>
      <input ref={nomeRef} defaultValue={editando ? editando.nome : ''} placeholder="Ex: Sistema de Loja" />
      <label>Descrição</label>
      <input ref={descRef} defaultValue={editando ? editando.descricao || '' : ''} placeholder="Breve descrição do mundo" />

      <label>Dificuldade sugerida (só informativa — o mundo fica liberado pra todo mundo jogar)</label>
      <select ref={tierRef} defaultValue={unlockTier}>
        {RANKS.map(r => <option key={r.tier} value={r.tier}>{r.title}</option>)}
      </select>

      <label>Ícone do mundo</label>
      <div className="icon-preview-row">
        <img src={iconePreview} alt="" onError={() => setIconePreview(ICONE_PADRAO)} />
        <input type="file" accept={TIPOS_ACEITOS.join(',')} onChange={handleIconeFile} />
      </div>
      {editando?.icone && !iconeFile && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, marginTop: 8 }}>
          <input type="checkbox" checked={removerIcone} onChange={(e) => handleRemoverIcone(e.target.checked)} style={{ width: 'auto', marginTop: 0 }} />
          Remover imagem atual (usar ícone padrão)
        </label>
      )}

      <label>Cores do degradê (usado se não houver imagem de fundo)</label>
      <div className="color-row">
        <div className="color-field"><span>Início</span><input type="color" value={cor1} onChange={(e) => setCor1(e.target.value)} /></div>
        <div className="color-field"><span>Fim</span><input type="color" value={cor2} onChange={(e) => setCor2(e.target.value)} /></div>
      </div>
      <div className="gradient-preview" style={{ background: `linear-gradient(160deg, ${cor1}, ${cor2})` }}>Pré-visualização</div>

      <label>Imagem de fundo do mundo (opcional)</label>
      <div className="icon-preview-row">
        {fundoPreview
          ? <img src={fundoPreview} alt="" style={{ objectFit: 'cover' }} />
          : <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, background: `linear-gradient(160deg, ${cor1}, ${cor2})` }} />}
        <input type="file" accept={TIPOS_ACEITOS.join(',')} onChange={handleFundoFile} />
      </div>
      <p className="field-hint">Se enviada, essa imagem substitui o degradê como fundo da tela de jogo desse mundo.</p>
      {editando?.fundo && !fundoFile && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, marginTop: 8 }}>
          <input type="checkbox" checked={removerFundo} onChange={(e) => handleRemoverFundo(e.target.checked)} style={{ width: 'auto', marginTop: 0 }} />
          Remover imagem de fundo atual
        </label>
      )}

      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={close}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
      </div>
    </>
  );
}
