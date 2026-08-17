/**
 * confetti.js — portado de js/main.js. Utilitário imperativo puro (não é
 * componente React): cria e remove os próprios nós de DOM, exatamente como
 * no original. Usado no login, level-up e fim de partida.
 */
const COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#f59e0b'];

export function confetti(count) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3200);
  }
}
