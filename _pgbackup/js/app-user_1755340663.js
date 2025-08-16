/* js/app-user.js
   Session helper + auth guard + userchip (avatar dropdown) for the topbar.
   - Stores session in sessionStorage under "dt_session"
   - Injects a user menu into `.userchip-wrap`
   - Safe routing to profile/settings/admin/logout
*/

(function () {
  // ---------- Session store ----------
  const KEY = 'dt_session';

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch { return null; }
  }
  function write(s) {
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }
  function clear() {
    try { sessionStorage.removeItem(KEY); } catch {}
  }

  // Public API (optional but handy)
  window.UserSession = {
    get: read,
    set: write,
    clear,
    isAuthenticated() {
      const s = read();
      return !!(s && s.user && s.user.email);
    }
  };

  // Seed a demo user once (handy for static/design mode)
  if (!read()) {
    write({
      user: {
        name: 'Demo Admin',
        email: 'demo@datatech.local',
        role: 'Owner',
        isAdmin: true,              // toggles Admin link in the menu
        avatar: ''                  // set a URL after upload (profile.html)
      }
    });
  }

  // ---------- Lightweight guard (no loops) ----------
  try {
    if (!window.__dt_guard_done__) {
      window.__dt_guard_done__ = true;

      const file = (location.pathname.split('/').pop() || '').toLowerCase();
      const isLogin = (file === '' || file === 'login.html' || file === 'index.html');
      const authed  = window.UserSession.isAuthenticated();

      if (!isLogin && !authed) {
        sessionStorage.setItem('redirectAfterLogin', file || 'dashboard.html');
        location.replace('login.html');
        return;
      }
    }
  } catch {}

  // ---------- User chip (avatar dropdown) ----------
  const mount = document.querySelector('.userchip-wrap');
  if (!mount) return; // nothing to do if topbar hasn't rendered yet

  function initialsFrom(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).slice(0,2);
    return parts.map(w => w[0]).join('').toUpperCase();
  }

  function renderUserchip() {
    const sess = read() || { user: {} };
    const u = sess.user || {};
    const name   = u.name  || 'User';
    const email  = u.email || '';
    const role   = u.role  || 'User';
    const avatar = u.avatar || '';
    const isAdmin = !!(u.isAdmin || /^(owner|admin)$/i.test(role));

    // Build the dropdown
    mount.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-light border rounded-pill px-2 py-1 d-flex align-items-center gap-2"
                id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false" type="button">
          <span class="rounded-circle d-inline-flex align-items-center justify-content-center"
                style="width:28px;height:28px;background:#e8eefc;border:1px solid #cfe0ff;overflow:hidden;">
            ${avatar
              ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
              : `<span class="small fw-bold" style="line-height:28px;">${initialsFrom(name)}</span>`}
          </span>
          <span class="text-start d-none d-sm-block">
            <span class="d-block lh-1 fw-semibold">${name}</span>
            <small class="d-block lh-1 text-muted">${role}</small>
          </span>
          <i class="fa-solid fa-chevron-down ms-1 d-none d-sm-inline"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown" style="min-width:220px;">
          <li class="px-3 py-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="rounded-circle d-inline-flex align-items-center justify-content-center"
                    style="width:28px;height:28px;background:#e8eefc;border:1px solid #cfe0ff;overflow:hidden;">
                ${avatar
                  ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                  : `<span class="small fw-bold" style="line-height:28px;">${initialsFrom(name)}</span>`}
              </span>
              <div class="small">
                <div class="fw-semibold">${name}</div>
                <div class="text-muted">${email || role}</div>
              </div>
            </div>
          </li>

          <li><a class="dropdown-item" data-action="profile" href="#"><i class="fa-regular fa-user me-2"></i>Profile</a></li>
          <li><a class="dropdown-item" data-action="settings" href="#"><i class="fa-solid fa-gear me-2"></i>Settings</a></li>
          ${isAdmin ? `<li><a class="dropdown-item" data-action="admin" href="#"><i class="fa-solid fa-user-shield me-2"></i>Admin</a></li>` : ''}

          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" data-action="logout" href="#"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i>Logout</a></li>
        </ul>
      </div>
    `;

    // Wire actions
    mount.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const action = el.getAttribute('data-action');
        if (action === 'profile') {
          location.href = 'profile.html';        // ✅ Profile
        } else if (action === 'settings') {
          location.href = 'settings.html';       // ✅ Settings
        } else if (action === 'admin') {
          location.href = 'admin.html';          // ✅ Admin (only for owner/admin)
        } else if (action === 'logout') {
          clear();
          location.replace('login.html');        // ✅ Logout
        }
      });
    });
  }

  // Initial render
  renderUserchip();

  // Update chip live if session changes (e.g., avatar updated on profile.html)
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) renderUserchip();
  });

  // Optional: expose a manual refresh if other scripts want to update the chip
  window.refreshUserChip = renderUserchip;
})();



<div class="userchip-wrap"></div>