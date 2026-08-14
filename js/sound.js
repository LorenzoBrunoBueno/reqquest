/**
 * sound.js
 * Efeitos sonoros gerados 100% via Web Audio API — sem depender de nenhum
 * arquivo de áudio externo (funciona local ou publicado, sem downloads).
 */

const Sound = (() => {
  let ctx = null;
  let enabled = true;

  // Se o navegador não suportar Web Audio (ou bloquear antes de qualquer
  // interação do usuário), o som é desativado silenciosamente — nunca deve
  // quebrar o jogo.
  function getCtx() {
    if (!window.AudioContext && !window.webkitAudioContext) { enabled = false; return null; }
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, start, duration, { type = 'sine', gain = 0.18, glideTo = null } = {}) {
    if (!enabled) return;
    try {
      const c = getCtx();
      if (!c) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + start);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + start + duration);
      g.gain.setValueAtTime(0, c.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration);
      osc.connect(g).connect(c.destination);
      osc.start(c.currentTime + start);
      osc.stop(c.currentTime + start + duration + 0.05);
    } catch (err) {
      // ambiente sem suporte a áudio (ex: alguns testes/headless) — ignora.
    }
  }

  return {
    setEnabled(v) { enabled = v; },
    isEnabled() { return enabled; },

    acerto() {
      tone(660, 0, 0.09, { type: 'triangle' });
      tone(880, 0.07, 0.14, { type: 'triangle' });
    },
    erro() {
      tone(220, 0, 0.16, { type: 'sawtooth', gain: 0.12, glideTo: 140 });
    },
    levelUp() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.18, { type: 'triangle', gain: 0.15 }));
    },
    powerUp() {
      tone(440, 0, 0.08, { type: 'square', gain: 0.1, glideTo: 880 });
      tone(880, 0.08, 0.12, { type: 'square', gain: 0.08 });
    },
    badge() {
      [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.11, 0.22, { type: 'sine', gain: 0.16 }));
    },
    click() {
      tone(500, 0, 0.04, { type: 'square', gain: 0.06 });
    },
    countdown() {
      tone(300, 0, 0.06, { type: 'square', gain: 0.09 });
    },
    gameOver(score) {
      const good = score >= 50;
      if (good) [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', gain: 0.14 }));
      else tone(330, 0, 0.4, { type: 'sine', gain: 0.12, glideTo: 220 });
    },
  };
})();
