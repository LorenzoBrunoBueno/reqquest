import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { useToast } from '../contexts/ToastContext';
import { confetti } from '../lib/confetti';
import { loginSchema } from '../lib/validation/loginSchema';

const FALAS = [
  'Eu sou o Reqi! Bora começar sua jornada?',
  'Oi de novo! Preenche o formulário e vem jogar comigo.',
  'Toda consultoria precisa de um bom requisito bem classificado!',
  'Clica em "Iniciar jornada" quando estiver pronto(a).',
];

export default function LoginPage({ onLoggedIn }) {
  const { login } = useAuth();
  const sound = useSound();
  const { showToast } = useToast();
  const [bubble, setBubble] = useState(FALAS[0]);
  const [bounce, setBounce] = useState(0);
  const falaIndex = useRef(0);

  function handleMascotClick() {
    sound.click();
    setBounce((b) => b + 1);
    falaIndex.current = (falaIndex.current + 1) % FALAS.length;
    setBubble(FALAS[falaIndex.current]);
    confetti(14);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const email = form.email.value.trim();

    const result = loginSchema.safeParse({ nome, telefone, email });
    if (!result.success) {
      showToast(result.error.issues[0].message);
      return;
    }

    try {
      await login(result.data.nome, result.data.telefone, result.data.email);
      onLoggedIn();
    } catch (err) {
      showToast(err.message || 'Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <section id="login-screen" className="screen">
      <div className="login-wrap">
        <div className="login-side">
          <div className="login-side-glow"></div>
          <div className="login-side-sparkle s1">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fde68a" /></svg>
          </div>
          <div className="login-side-sparkle s2">
            <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fde68a" /></svg>
          </div>
          <div className="login-side-sparkle s3">
            <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fde68a" /></svg>
          </div>
          <div className="login-brand">
            <span className="brand-mark"><img src="/assets/logo-symbol.png" alt="ReqQuest" /></span>
            <span className="brand-name">Req<span className="accent">Quest</span></span>
          </div>
          <img
            key={bounce}
            className={`login-mascot-img${bounce > 0 ? ' bounce' : ''}`}
            id="login-mascot-wave"
            src="/assets/mascot/reqi-login-idle.gif"
            alt="Reqi, o mascote do ReqQuest, acenando animado — clique pra ele acenar de novo"
            onClick={handleMascotClick}
          />
          <div className="login-bubble" id="login-bubble">{bubble}</div>
          <div className="login-feature-chips">
            <span className="login-chip"><svg width="13" height="13"><use href="#ic-worlds" /></svg>6 mundos</span>
            <span className="login-chip"><svg width="13" height="13"><use href="#ic-trophy" /></svg>Conquistas</span>
            <span className="login-chip"><svg width="13" height="13"><use href="#ic-nav-rank" /></svg>Cargos</span>
          </div>
        </div>
        <div className="login-card">
          <p className="login-eyebrow">Consultoria de Engenharia de Requisitos</p>
          <p className="login-subtitle">Classifique requisitos, suba de cargo e vire referência na consultoria.</p>
          <form id="login-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label htmlFor="nome">Nome completo</label>
                <div className="input-icon-wrap">
                  <svg width="16" height="16"><use href="#ic-user" /></svg>
                  <input type="text" id="nome" name="nome" required placeholder="Seu nome completo" />
                </div>
              </div>
              <div>
                <label htmlFor="telefone">Telefone</label>
                <div className="input-icon-wrap">
                  <svg width="16" height="16"><use href="#ic-phone" /></svg>
                  <input type="tel" id="telefone" name="telefone" required placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>
            <label htmlFor="email">E-mail</label>
            <div className="input-icon-wrap">
              <svg width="16" height="16"><use href="#ic-mail" /></svg>
              <input type="email" id="email" name="email" required placeholder="voce@email.com" />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-shine">Iniciar jornada</button>
          </form>
        </div>
      </div>
    </section>
  );
}
