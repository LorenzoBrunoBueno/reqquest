/**
 * sound.js — portado de js/sound.js.
 * Efeitos sonoros gerados 100% via Web Audio API — sem depender de nenhum
 * arquivo de áudio externo. Módulo não-React; SoundContext expõe isso via hook.
 */
let ctx = null;
let enabled = true;

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
    // ambiente sem suporte a áudio — ignora.
  }
}

export function setEnabled(v) { enabled = v; }
export function isEnabled() { return enabled; }

export function acerto() {
  tone(660, 0, 0.09, { type: 'triangle' });
  tone(880, 0.07, 0.14, { type: 'triangle' });
}
export function erro() {
  tone(220, 0, 0.16, { type: 'sawtooth', gain: 0.12, glideTo: 140 });
}
export function levelUp() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.18, { type: 'triangle', gain: 0.15 }));
}
export function powerUp() {
  tone(440, 0, 0.08, { type: 'square', gain: 0.1, glideTo: 880 });
  tone(880, 0.08, 0.12, { type: 'square', gain: 0.08 });
}
export function badge() {
  [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.11, 0.22, { type: 'sine', gain: 0.16 }));
}
export function click() {
  tone(500, 0, 0.04, { type: 'square', gain: 0.06 });
}
export function countdown() {
  tone(300, 0, 0.06, { type: 'square', gain: 0.09 });
}
export function gameOver(score) {
  const good = score >= 50;
  if (good) [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', gain: 0.14 }));
  else tone(330, 0, 0.4, { type: 'sine', gain: 0.12, glideTo: 220 });
}

// ---------------------------------------------------------------------
// Música ambiente — loop suave gerado por código (mesma técnica das outras
// funções, sem arquivo de áudio externo). Toca baixinho por trás de qualquer
// tela do site, respeitando o botão de mutar (checa `enabled` a cada
// compasso, então mutar corta o próximo em no máximo ~2.5s, sem cancelar nada).
//
// Progressão I-IV-V-vi em dó maior — a mesma "cara" alegre/aventura do resto
// do jogo (o levelUp() logo acima já é um arpejo maior C-E-G-C ascendente).
// Timbre 'triangle', igual aos outros efeitos, pra soar como parte do mesmo
// universo sonoro em vez de uma trilha à parte tipo suspense/escape room.
// ---------------------------------------------------------------------
const AMBIENT_PROGRESSION = [
  { bass: 130.81, arp: [261.63, 329.63, 392.00, 329.63] },  // C   (Dó maior)
  { bass: 196.00, arp: [392.00, 493.88, 587.33, 493.88] },  // G   (Sol maior)
  { bass: 110.00, arp: [440.00, 523.25, 659.25, 523.25] },  // Am  (Lá menor)
  { bass: 174.61, arp: [349.23, 440.00, 523.25, 440.00] },  // F   (Fá maior)
  { bass: 130.81, arp: [329.63, 392.00, 523.25, 392.00] },  // C   (variação)
  { bass: 174.61, arp: [440.00, 523.25, 698.46, 523.25] },  // F   (variação, oitava acima)
  { bass: 196.00, arp: [493.88, 587.33, 783.99, 587.33] },  // G   (variação, oitava acima)
  { bass: 130.81, arp: [261.63, 329.63, 392.00, 523.25] },  // C   (fecha subindo até o C5)
];
const AMBIENT_STEP_SECONDS = 2.6;
const AMBIENT_ARP_NOTE = AMBIENT_STEP_SECONDS / 4;
let ambientTimer = null;
let ambientOn = false;

export function startAmbient() {
  if (ambientOn) return;
  ambientOn = true;
  let step = 0;
  const playStep = () => {
    if (!ambientOn) return;
    if (enabled) {
      const chord = AMBIENT_PROGRESSION[step % AMBIENT_PROGRESSION.length];
      tone(chord.bass, 0, AMBIENT_STEP_SECONDS - 0.15, { type: 'triangle', gain: 0.045 });
      chord.arp.forEach((freq, i) => {
        tone(freq, i * AMBIENT_ARP_NOTE, AMBIENT_ARP_NOTE * 0.9, {
          type: 'triangle', gain: 0.06 - i * 0.006,
        });
      });
    }
    step++;
    ambientTimer = setTimeout(playStep, AMBIENT_STEP_SECONDS * 1000);
  };
  playStep();
}

export function stopAmbient() {
  ambientOn = false;
  if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; }
}