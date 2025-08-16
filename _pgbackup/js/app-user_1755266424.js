/* js/app-user.js
   Lightweight session + top-right user chip renderer
   -------------------------------------------------- */

(function () {
  const KEY = 'lc_user_session';

  // ---- Session API (global) ----------------------------------------------
  function get() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch { return null; }
  }
  function set(s) {
    try { sessionStorage.setItem(KEY, JSON.stringify(s || null)); }
    catch {}
  }
  function clear() {
    try { sessionStorage.removeItem(KEY); } catch {}
  }
  function isAuthenticated() {
    const s = get();
    return !!(s && (s.token || s.email)); // token optional for demo
  }
  function profile() {
    const s = get() || {};
    return {
      name: s.name || 'Demo Admin',
      email: s.email || 'demo@example.com',
      role: s.role || 'Owner',
      photoUrl: s.photoUrl || ''
    };
  }

  // Expose minimal API for pages
  window.UserSession = {
    get, set, clear, isAuthenticated, profile
  };

  // ---- Chip Rendering -----------------------------------------------------
  // Expected HTML container in topbar:
  // <div class="userchip-wrap"></div>
  function renderUserChip() {
    const wrap = document.querySelector('.userchip-wrap');
    if (!wrap) return; // page doesn't use the chip

    // Build chip shell if not present
    if (!wrap.querySelector('.userchip')) {
      wrap.innerHTML = `
        <div class="userchip" aria-label="User menu">
          <div class="avatar">DA</div>
          <div class="name">
            <div class="fw-semibold">Demo Admin</div>
            <div class="label">Owner</div>
          </div>
          <button class="menu-btn" aria-label="Open menu"></button>
        </div>
        <div class="userchip-menu" style="display:none;"></div>
      `;
    }

    const { name, email, role, photoUrl } = profile();
    const chip = wrap.querySelector('.userchip');
    const avatar = wrap.querySelector('.avatar');
    const nameEl = wrap.querySelector('.name .fw-semibold');
    const roleEl = wrap.querySelector('.name .label');
    const menu = wrap.querySelector('.userchip-menu');
    const btn = wrap.querySelector('.menu-btn');

    // Fill text
    nameEl.textContent = name || email || 'User';
    roleEl.textContent = role || '';

    // Avatar: photo fallback to initials
    const initials = getInitials(name || email);
    if (photoUrl) {
      avatar.textContent = '';
      avatar.style.background = '#fff';
      avatar.style.boxShadow = 'inset 0 0 0 2px #e5e7eb';
      avatar.style.backgroundImage = `url("${photoUrl}")`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
    } else {
      avatar.style.backgroundImage = 'none';
      avatar.textContent = initials;
      // keep gradient from CSS
    }

    // Build dropdown menu
    menu.innerHTML = `
      <div class="dt-card p-2" style="min-width:240px;border-radius:12px;">
        <div class="px-2 pb-2 small text-muted">
          ${escapeHtml(name || 'User')} · ${escapeHtml(role || '')}<br>
          <span class="text-muted">${escapeHtml(email || '')}</span>
        </div>
        <div class="list-group list-group-flush">
          <a href="profile.html" class="list-group-item list-group-item-action py-2">
            <i class="fa-regular fa-user me-2"></i> Profile
          </a>
          <a href="settings.html" class="list-group-item list-group-item-action py-2">
            <i class="fa-solid fa-gear me-2"></i> Settings
          </a>
          <button type="button" class="list-group-item list-group-item-action py-2 text-danger" id="__logoutBtn">
            <i class="fa-solid fa-right-from-bracket me-2"></i> Logout
          </button>
        </div>
      </div>
    `;

    // Toggle menu
    let open = false;
    function closeMenu() {
      if (!open) return;
      open = false;
      menu.style.display = 'none';
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onEsc, true);
    }
    function openMenu() {
      if (open) return;
      open = true;
      menu.style.display = 'block';
      positionMenu();
      setTimeout(() => {
        document.addEventListener('click', onDocClick, true);
        document.addEventListener('keydown', onEsc, true);
      }, 0);
    }
    function onDocClick(e) {
      if (!wrap.contains(e.target)) closeMenu();
    }
    function onEsc(e) {
      if (e.key === 'Escape') closeMenu();
    }
    function positionMenu() {
      // simple right align under chip
      const rect = chip.getBoundingClientRect();
      menu.style.position = 'absolute';
      menu.style.top = `${rect.bottom + window.scrollY + 8}px`;
      menu.style.left = `${rect.right + window.scrollX - menu.offsetWidth}px`;
      menu.style.zIndex = 1050;
    }

    btn.onclick = () => (open ? closeMenu() : openMenu());
    window.addEventListener('resize', () => open && positionMenu());

    // Logout
    menu.querySelector('#__logoutBtn').addEventListener('click', () => {
      clear();
      closeMenu();
      const back = sessionStorage.getItem('redirectAfterLogin') || 'login.html';
      location.replace(back);
    });
  }

  // Helpers
  function getInitials(s) {
    if (!s) return 'U';
    // if looks like email, use first two chars
    if (/.+@.+/.test(s)) {
      const out = s.replace(/@.*/,'').replace(/[^A-Za-z0-9]/g,'').slice(0,2);
      return (out || 'U').toUpperCase();
    }
    const parts = String(s).trim().split(/\s+/).slice(0,2);
    return parts.map(p => p[0] ? p[0].toUpperCase() : '').join('') || 'U';
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
  }

  // ---- Auto-render on DOM ready ------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderUserChip);
  } else {
    renderUserChip();
  }
})();