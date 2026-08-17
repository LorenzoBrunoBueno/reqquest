import { useState } from 'react';
import { useSound } from '../../contexts/SoundContext';
import { useModal } from '../../contexts/ModalContext';
import { useNavigate } from 'react-router-dom';

const PASSOS = [
  { titulo: 'Escolha um mundo', texto: 'Vá em "Jogar" e escolha um mundo pra sua consultoria.', pose: 'neutro' },
  { titulo: 'Classifique os requisitos', texto: 'Arraste cada requisito pra "Funcional" ou "Não Funcional" antes do tempo acabar.', pose: 'empolgado' },
  { titulo: 'Aumente seu combo', texto: 'Acertos seguidos multiplicam seus pontos — um erro zera a sequência.', pose: 'neutro' },
  { titulo: 'Use os power-ups', texto: 'Dica, Tempo Extra e Pular te salvam nos requisitos mais difíceis.', pose: 'neutro' },
  { titulo: 'Suba de cargo', texto: 'Ganhe XP, suba de nível e desbloqueie mais cargas de power-up e conquistas.', pose: 'empolgado' },
];

export default function TutorialModalContent() {
  const [step, setStep] = useState(0);
  const sound = useSound();
  const { close } = useModal();
  const navigate = useNavigate();

  function goTo(i) {
    setStep(i);
    sound.click();
  }

  function handleNext() {
    if (step < PASSOS.length - 1) {
      goTo(step + 1);
    } else {
      close();
      navigate('/jogo');
    }
  }

  const p = PASSOS[step];

  return (
    <>
      <h3>Como jogar</h3>
      <div className="tutorial-dots" id="tutorial-dots">
        {PASSOS.map((_, i) => (
          <span key={i} className={`tutorial-dot${i === step ? ' active' : ''}`} onClick={() => goTo(i)}></span>
        ))}
      </div>
      <div className="tutorial-stage tutorial-stage-in" id="tutorial-stage" key={step}>
        <img src={`/assets/mascot/reqi-${p.pose}.png`} alt="Reqi" />
        <div className="tutorial-step-title">Passo {step + 1} de {PASSOS.length} — {p.titulo}</div>
        <div className="tutorial-step-text">{p.texto}</div>
      </div>
      <div className="modal-actions tutorial-actions">
        <button className="btn btn-secondary" style={{ visibility: step === 0 ? 'hidden' : 'visible' }} onClick={() => goTo(step - 1)}>Voltar</button>
        <button className="btn btn-primary" onClick={handleNext}>
          {step === PASSOS.length - 1
            ? (<>Ir jogar <svg width="14" height="14"><use href="#ic-nav-play" /></svg></>)
            : 'Próximo'}
        </button>
      </div>
    </>
  );
}
