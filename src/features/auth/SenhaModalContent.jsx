import { useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { useToast } from '../../contexts/ToastContext';
import { senhaSchema } from '../../lib/validation/loginSchema';

export default function SenhaModalContent({ modo, nome, telefone, email, onSuccess }) {
  const { registrar, login } = useAuth();
  const { close } = useModal();
  const { showToast } = useToast();
  const senhaRef = useRef(null);
  const confirmarSenhaRef = useRef(null);

  async function handleSubmit() {
    const senha = senhaRef.current.value;
    const result = senhaSchema.safeParse(senha);
    if (!result.success) { showToast(result.error.issues[0].message); return; }

    if (modo === 'registro' && senha !== confirmarSenhaRef.current.value) {
      showToast('As senhas não coincidem.');
      return;
    }

    try {
      const usuario = modo === 'registro'
        ? await registrar(nome, telefone, email, senha)
        : await login(email, senha);
      close();
      onSuccess(usuario);
    } catch (err) {
      showToast(err.message || 'Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <>
      <h3>{modo === 'registro' ? 'Crie sua senha' : 'Digite sua senha'}</h3>
      {modo === 'registro' && (
        <p style={{ color: 'var(--text-muted)' }}>
          Primeiro acesso com <strong>{email}</strong> — escolha uma senha pra proteger sua conta.
        </p>
      )}
      <label htmlFor="senha-modal-input">Senha</label>
      <input
        ref={senhaRef}
        id="senha-modal-input"
        type="password"
        autoFocus
        placeholder="Mínimo 8 caracteres"
      />
      {modo === 'registro' && (
        <>
          <label htmlFor="confirmar-senha-modal-input">Confirmar senha</label>
          <input ref={confirmarSenhaRef} id="confirmar-senha-modal-input" type="password" />
        </>
      )}
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={close}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {modo === 'registro' ? 'Criar conta' : 'Entrar'}
        </button>
      </div>
    </>
  );
}
