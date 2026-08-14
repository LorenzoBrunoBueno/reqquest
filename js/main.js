/**
 * main.js — bootstrap do ReqQuest.
 */

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add('hidden'), 2400);
}

function refreshProfileUI() {
  const usuario = Auth.getUsuario();
  if (!usuario) return;
  const progress = DB.getPlayerProgress();
  const level = Math.floor(progress.xp / DB.XP_PER_LEVEL) + 1;
  const xpIntoLevel = progress.xp % DB.XP_PER_LEVEL;
  const rank = DB.rankForLevel(level);
  const initials = Auth.initials(usuario.nome);

  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-avatar-lg').textContent = initials;
  document.getElementById('profile-name').textContent = usuario.nome.split(' ')[0];
  document.getElementById('profile-name-lg').textContent = usuario.nome;
  document.getElementById('profile-rank').textContent = `${rank.title.split(' ')[0]} · Nv. ${level}`;
  document.getElementById('profile-rank-lg').textContent = `${rank.title} · Nível ${level}`;
  document.getElementById('profile-xp-fill').style.width = `${xpIntoLevel}%`;
  document.getElementById('profile-xp-label').textContent = `${xpIntoLevel} / ${DB.XP_PER_LEVEL} XP`;
  document.getElementById('profile-telefone').textContent = usuario.telefone || '—';
  document.getElementById('profile-email').textContent = usuario.email || '—';
}

function goToApp(showWelcome) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  refreshProfileUI();
  Router.init();
  if (showWelcome) {
    showWelcomeOverlay();
  } else {
    Mascot.show();
  }
}

function goToLogin() {
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-form').reset();
  Mascot.hide();
  window.location.hash = '';
}

// -----------------------------------------------------------------------
// Confete (usado no login, level-up e fim de partida)
// -----------------------------------------------------------------------
function confetti(count) {
  const colors = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#f59e0b'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3200);
  }
}

function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal">${html}</div></div>`;
  root.querySelector('#modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  return root.querySelector('.modal');
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

// -----------------------------------------------------------------------
// Overlay de boas-vindas: Reqi "fala" com o jogador logo após o login,
// antes de revelar o dashboard por completo.
// -----------------------------------------------------------------------
function showWelcomeOverlay() {
  const usuario = Auth.getUsuario();
  const primeiro = usuario ? usuario.nome.split(' ')[0] : 'consultor(a)';
  const overlay = document.getElementById('welcome-overlay');
  const textEl = document.getElementById('welcome-text');
  const startBtn = document.getElementById('welcome-start-btn');
  const texto = `Chegou gente nova na consultoria! Bem-vindo(a), ${primeiro}. Eu sou o Reqi — bora classificar uns requisitos e subir de cargo?`;

  overlay.classList.remove('hidden');
  textEl.textContent = '';
  Mascot.typeText(textEl, texto, { speed: 18 });
  confetti(26);

  function dismiss() {
    overlay.classList.add('hidden');
    Mascot.show();
    Mascot.say(`Clica em mim quando quiser uma dica, ${primeiro}.`, 'neutro', 3600);
    startBtn.removeEventListener('click', dismiss);
  }
  startBtn.addEventListener('click', dismiss);
}

// -----------------------------------------------------------------------
// Clicar no mascote flutuante dá uma dica de verdade (antes não fazia nada)
// -----------------------------------------------------------------------
function initMascotClick() {
  const img = document.getElementById('mascot-img');
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => {
    Sound.click();
    Mascot.idleTip(Router.currentRoute());
  });
}

// -----------------------------------------------------------------------
// Menu lateral colapsável (hambúrguer)
// -----------------------------------------------------------------------
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const collapsedSaved = localStorage.getItem('rq_sidebar_collapsed') === 'true';
  sidebar.classList.toggle('collapsed', collapsedSaved);
  toggleBtn.setAttribute('aria-expanded', String(!collapsedSaved));

  toggleBtn.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    localStorage.setItem('rq_sidebar_collapsed', collapsed);
  });
}

// -----------------------------------------------------------------------
// Botão de mudo/som no topbar
// -----------------------------------------------------------------------
function initSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  const icon = document.getElementById('sound-icon');
  const mutedSaved = localStorage.getItem('rq_sound_muted') === 'true';
  Sound.setEnabled(!mutedSaved);
  applySoundIcon(!mutedSaved, btn, icon);

  btn.addEventListener('click', () => {
    const nowEnabled = !Sound.isEnabled();
    Sound.setEnabled(nowEnabled);
    localStorage.setItem('rq_sound_muted', String(!nowEnabled));
    applySoundIcon(nowEnabled, btn, icon);
    if (nowEnabled) Sound.click();
  });
}
function applySoundIcon(enabled, btn, icon) {
  icon.querySelector('use').setAttribute('href', enabled ? '#ic-sound-on' : '#ic-sound-off');
  btn.classList.toggle('muted', !enabled);
  btn.title = enabled ? 'Desligar som' : 'Ligar som';
}

// -----------------------------------------------------------------------
// Reqi do login reage a clique: acena de novo, solta confete e troca a
// fala — só pra dar uma vida extra na tela sem precisar de outra pose.
// -----------------------------------------------------------------------
function initLoginMascotClick() {
  const img = document.getElementById('login-mascot-wave');
  const bubble = document.getElementById('login-bubble');
  if (!img || !bubble) return;
  const falas = [
    'Eu sou o Reqi! Bora começar sua jornada?',
    'Oi de novo! Preenche o formulário e vem jogar comigo.',
    'Toda consultoria precisa de um bom requisito bem classificado!',
    'Clica em "Iniciar jornada" quando estiver pronto(a).',
  ];
  let i = 0;
  img.addEventListener('click', () => {
    Sound.click();
    img.classList.remove('bounce');
    void img.offsetWidth;
    img.classList.add('bounce');
    i = (i + 1) % falas.length;
    bubble.textContent = falas[i];
    confetti(14);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginMascotClick();

  // Dark mode (persistido) — label e ícone mostram o modo PRA QUAL vai mudar
  function updateThemeSwitchLabel(isDark) {
    document.getElementById('theme-switch-label').textContent = isDark ? 'Modo claro' : 'Modo escuro';
  }
  const darkSaved = localStorage.getItem('rq_dark_mode') === 'true';
  document.body.setAttribute('data-dark', darkSaved ? 'true' : 'false');
  document.getElementById('dark-mode-toggle').checked = darkSaved;
  updateThemeSwitchLabel(darkSaved);
  document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
    document.body.setAttribute('data-dark', e.target.checked ? 'true' : 'false');
    localStorage.setItem('rq_dark_mode', e.target.checked);
    updateThemeSwitchLabel(e.target.checked);
  });

  initSidebarToggle();
  initSoundToggle();
  initMascotClick();

  // Som suave ao navegar pelo menu — reforço de feedback, sem ser irritante.
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', () => Sound.click());
  });
  document.getElementById('dark-mode-toggle').addEventListener('change', () => Sound.click());

  // Views se registram no Router
  DashboardView.register();
  GameView.register();
  CrudView.register();
  RelatoriosView.register();
  CargosView.register();
  GuiaView.register();

  // Login
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!nome || !telefone || !email) return;
    // Cada pessoa (nome + telefone + e-mail) é uma "consultoria" separada:
    // se for alguém novo (ou a primeira vez), a jornada começa do zero. Só
    // mantém XP/partidas/conquistas de onde parou se for exatamente a mesma
    // pessoa entrando de novo.
    const usuarioAnterior = Auth.getUsuario();
    const mesmaPessoa = usuarioAnterior
      && usuarioAnterior.nome.trim().toLowerCase() === nome.toLowerCase()
      && usuarioAnterior.telefone.trim() === telefone
      && usuarioAnterior.email.trim().toLowerCase() === email.toLowerCase();
    if (!mesmaPessoa) {
      DB.resetProgress();
    }
    Auth.login(nome, telefone, email);
    goToApp(true);
  });

  // Perfil (chip com dropdown) — RF02
  const chip = document.getElementById('profile-chip');
  const dropdown = document.getElementById('profile-dropdown');
  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  document.addEventListener('click', () => dropdown.classList.add('hidden'));

  // Logout — RF08
  document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.logout();
    goToLogin();
  });

  // Nova Jornada — RF03 (criativo: reseta XP/badges/partidas)
  document.getElementById('nova-jornada-btn').addEventListener('click', () => {
    const usuario = Auth.getUsuario();
    const modal = openModal(`
      <div class="modal-mascot">
        <img src="assets/mascot/reqi-confuso.png" alt="Reqi">
        <div><b>Tem certeza, ${usuario ? usuario.nome.split(' ')[0] : ''}?</b></div>
      </div>
      <p style="color:var(--text-muted);font-size:14px;">
        Isso vai reiniciar sua jornada: XP, nível, badges e histórico de partidas
        voltam a zero. Os temas e requisitos cadastrados continuam intactos.
      </p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-reset">Cancelar</button>
        <button class="btn btn-danger" id="confirm-reset">
          <svg width="14" height="14"><use href="#ic-refresh"/></svg> Recomeçar jornada
        </button>
      </div>
    `);
    modal.querySelector('#cancel-reset').addEventListener('click', closeModal);
    modal.querySelector('#confirm-reset').addEventListener('click', () => {
      DB.resetProgress();
      refreshProfileUI();
      closeModal();
      showToast('Jornada reiniciada! Vamos de novo.');
      window.location.hash = '#/dashboard';
      Router.renderCurrent();
    });
  });

  // Sessão já ativa? entra direto (sem overlay de boas-vindas de novo).
  // Se não tiver sessão, garante que o mascote flutuante comece escondido
  // (defensivo — evita ele aparecer "flutuando" em cima da tela de login).
  if (Auth.getUsuario()) goToApp(false); else Mascot.hide();
});
