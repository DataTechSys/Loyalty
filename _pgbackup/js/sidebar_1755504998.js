/* js/sidebar.js
   Robust sidebar include + wiring for collapse, burger and nested groups.
   Tries multiple fallback paths so pages in subfolders still work. */
(function () {
  async function loadSidebar() {
    const host = document.querySelector('.sidebar[data-include]');
    if (!host) return;

    const want = host.getAttribute('data-include') || 'sidebar.html';

    // Build candidates: current attribute as-is, same dir, parent dir, root.
    const currentDir = location.pathname.replace(/[^/]+$/, '');  // '/foo/bar/'
    const candidates = [
      want,                            // as written
      currentDir + want,               // same folder as the page
      '../' + want,                    // parent folder
      '/' + want.replace(/^\/+/, ''),  // root
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          host.innerHTML = await res.text();
          wireSidebar();
          markActive();
          return;
        }
      } catch (_) { /* ignore and try next */ }
    }

    // Fallback UI if all attempts failed
    host.innerHTML = `
      <div class="p-2 small text-danger">
        Sidebar failed to load. Check the path to <code>${want}</code>.
      </div>`;
  }

  function wireSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const burger = document.getElementById('burger');
    const collapseBtn = document.getElementById('collapseBtn');

    burger?.addEventListener('click', () => sidebar.classList.toggle('open'));
    collapseBtn?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

    // Close mobile sidebar on any nav click
    sidebar.querySelectorAll('a.sb-link')
      .forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));

    // Expand/collapse grouped parents (the ones with a chevron)
    sidebar.addEventListener('click', (e) => {
      const t = e.target.closest('.sb-toggle');
      if (!t) return;
      const parent = t.closest('.sb-parent');
      parent?.classList.toggle('open');
      e.preventDefault();
    });
  }

  function markActive() {
    const here = location.pathname.split('/').pop().toLowerCase(); // e.g. 'customer-details.html'
    document.querySelectorAll('.sidebar a.sb-link').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (href && href === here) a.classList.add('active');
    });
  }

  document.addEventListener('DOMContentLoaded', loadSidebar);
})();