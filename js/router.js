/**
 * router.js
 * RF03 - Navegação entre seções via menu lateral. Router simples por hash.
 */

const Router = (() => {
  const routes = {};
  const container = () => document.getElementById('view-container');

  function register(name, title, renderFn) { routes[name] = { title, render: renderFn }; }

  function currentRoute() {
    const hash = window.location.hash.replace('#/', '');
    return routes[hash] ? hash : 'dashboard';
  }

  function highlightMenu(route) {
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.route === route);
    });
  }

  function renderCurrent() {
    const route = currentRoute();
    const view = routes[route];
    document.getElementById('view-title').textContent = view.title;
    highlightMenu(route);
    const c = container();
    c.innerHTML = '';
    view.render(c);
    // fadezinho suave a cada troca de view — deixa a navegação menos seca
    c.classList.remove('view-fade-in');
    void c.offsetWidth;
    c.classList.add('view-fade-in');
    if (typeof Mascot !== 'undefined' && route !== 'jogo') Mascot.idleTip(route);
  }

  function init() {
    window.addEventListener('hashchange', renderCurrent);
    if (!window.location.hash) window.location.hash = '#/dashboard';
    renderCurrent();
  }

  return { register, init, renderCurrent, currentRoute };
})();
