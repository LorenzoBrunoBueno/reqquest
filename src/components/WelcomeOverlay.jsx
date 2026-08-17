import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMascot } from '../contexts/MascotContext';
import { confetti } from '../lib/confetti';

export default function WelcomeOverlay({ onDismiss }) {
  const { usuario } = useAuth();
  const mascot = useMascot();
  const primeiro = usuario ? usuario.nome.split(' ')[0] : 'consultor(a)';
  const texto = `Chegou gente nova na consultoria! Bem-vindo(a), ${primeiro}. Eu sou o Reqi — bora classificar uns requisitos e subir de cargo?`;
  const [typed, setTyped] = useState('');

  useEffect(() => {
    confetti(26);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTyped(texto.slice(0, i));
      if (i >= texto.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    onDismiss();
    mascot.show();
    mascot.say(`Clica em mim quando quiser uma dica, ${primeiro}.`, 'neutro', 3600);
  }

  return (
    <div id="welcome-overlay" className="welcome-overlay">
      <div className="welcome-card">
        <div className="welcome-chat">
          <img src="/assets/mascot/reqi-acenando.png" alt="Reqi" />
          <div className="welcome-bubble">
            <p id="welcome-text" className="welcome-text">{typed}</p>
          </div>
        </div>
        <button className="btn btn-primary" id="welcome-start-btn" onClick={dismiss}>Vamos começar</button>
      </div>
    </div>
  );
}
