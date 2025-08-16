// /js/partials.js
// Injects /partials/sidebar.html and /partials/topbar.html into placeholders.
// Then loads user-app behaviors (user dropdown, sidebar state, active link).
(async function () {
  const insert = async (sel, url) => {
    const host = document.querySelector(sel);
    if (!host) return;
    try {
      const html = await (await fetch(url, { cache: 'no-cache' })).text();
      host.innerHTML = html;
    } catch (e) { console.error('Load partial failed:', url, e); }
  };

  await Promise.all([
    insert('#inject-sidebar', 'partials/sidebar.html'),
    insert('#inject-topbar',   'partials/topbar.html'),
  ]);

  // After partials exist, boot the common user/side behaviors
  const s = document.createElement('script');
  s.src = 'js/user-app.js';
  document.body.appendChild(s);
})();