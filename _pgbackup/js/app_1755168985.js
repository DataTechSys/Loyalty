/* global window, document */
(function (w, d) {
  'use strict';

  const brandEl = d.getElementById('brandTitle');
  const logoutBtn = d.getElementById('btnLogout');

  function updateBrandUI() {
    if (!brandEl) return;
    const brand = (w.APP_CONFIG && w.APP_CONFIG.BRAND) || { name: 'Console' };
    const sess = w.RBAC && w.RBAC.session;
    brandEl.textContent = sess ? `${brand.name} • ${sess.email || 'user'}` : 'Signed out';
    if (logoutBtn) logoutBtn.classList.toggle('d-none', !sess);
  }

  function bindLogout() {
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', function () {
      if (w.RBAC && typeof w.RBAC.logout === 'function') w.RBAC.logout();
    });
  }

  w.showError = function showError(msg) {
    alert(msg); // replace with a nicer toast if you want
  };

  d.addEventListener('DOMContentLoaded', () => {
    bindLogout();
    updateBrandUI();
  });

  // Update when session changes (optional place to hook events)
  w.addEventListener('storage', (e) => {
    if (e.key === 'rbac_session') updateBrandUI();
  });
}(window, document));
