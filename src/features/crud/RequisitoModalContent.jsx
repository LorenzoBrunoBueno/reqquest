import { useRef } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useToast } from '../../contexts/ToastContext';
import { requisitoSchema } from '../../lib/validation/requisitoSchema';

export default function RequisitoModalContent({ temas, editando, onSave }) {
  const { close } = useModal();
  const { showToast } = useToast();
  const textoRef = useRef(null);
  const temaRef = useRef(null);
  const tipoRef = useRef(null);

  async function handleSave() {
    const result = requisitoSchema.safeParse({
      texto: textoRef.current.value,
      temaId: temaRef.current.value,
      tipo: tipoRef.current.value,
    });
    if (!result.success) { showToast(result.error.issues[0].message); return; }
    try {
      await onSave(result.data);
      showToast('Requisito salvo!');
      close();
    } catch (err) {
      showToast(err.message || 'Não foi possível salvar o requisito.');
    }
  }

  return (
    <>
      <h3>{editando ? 'Editar' : 'Novo'} Requisito</h3>
      <label>Texto do requisito</label>
      <textarea ref={textoRef} rows="3" defaultValue={editando ? editando.texto : ''}></textarea>
      <label>Mundo</label>
      <select ref={temaRef} defaultValue={editando ? editando.temaId : (temas[0] && temas[0].id)}>
        {temas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </select>
      <label>Tipo</label>
      <select ref={tipoRef} defaultValue={editando ? editando.tipo : 'funcional'}>
        <option value="funcional">Requisito Funcional</option>
        <option value="nao-funcional">Requisito Não Funcional</option>
      </select>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={close}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
      </div>
    </>
  );
}
