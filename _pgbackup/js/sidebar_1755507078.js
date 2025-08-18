/* js/sidebar.js
   Sidebar include + robust wiring that binds burger/collapse
   even when topbar is injected after this script. */
(function () {
  async function loadSidebar() {
    const host = document.querySelector('.sidebar[data-include]');
    if (!host) return;

    const want = host.getAttribute('data-include') || 'partials/sidebar.html';
    const currentDir = location.pathname.replace(/[^/]+$/, '');
    const candidates = [
      want,
      currentDir + want,
      '../' + want,
      '/' + want.replace(/^\/+/, ''),
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          host.innerHTML = await res.text();
          wireSidebarBasics();
          markActive();
          wireTopbarButtonsWhenReady(); // <-- new
          return;
        }
      } catch (_) {}
    }

    host.innerHTML =
      `<div class="p-2 small text-danger">Sidebar failed to load. Check the path to <code>${want}</code>.</div>`;
  }

  // Wires things that are *inside the sidebar*.
  function wireSidebarBasics() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Close mobile sidebar when a link is clicked.
    sidebar.querySelectorAll('a.sb-link')
      .forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));

    // Handle expandable groups (items with .sb-toggle).
    sidebar.addEventListener('click', (e) => {
      const t = e.target.closest('.sb-toggle');
      if (!t) return;
      e.preventDefault();
      const parent = t.closest('.sb-parent');
      parent?.classList.toggle('open');
    });
  }

  // Wait for #burger and #collapseBtn (they live in topbar include) and bind once.
  function wireTopbarButtonsWhenReady() {
    const sidebar = document.getElementById('sidebar');

    const tryBind = () => {
      const burger = document.getElementById('burger');
      const collapseBtn = document.getElementById('collapseBtn');

      if (burger && !burger.__dt_bound) {
        burger.addEventListener('click', () => sidebar.classList.toggle('open'));
        burger.__dt_bound = true;
      }
      if (collapseBtn && !collapseBtn.__dt_bound) {
        collapseBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
        collapseBtn.__dt_bound = true;
      }
    };

    // Try now (in case topbar is already there)…
    tryBind();

    // …and keep watching for future inserts/re-renders.
    const mo = new MutationObserver(() => tryBind());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function markActive() {
    const here = location.pathname.split('/').pop().toLowerCase();
    document.querySelectorAll('.sidebar a.sb-link').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (href && href === here) a.classList.add('active');
    });
  }

  document.addEventListener('DOMContentLoaded', loadSidebar);
})();