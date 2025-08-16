/* js/app-user.js
   Minimal auth/session helper + user chip with safe dropdown.
   Designed to AVOID any accidental page navigations/reloads.
*/
(function () {
  // --- Simple session store (demo) -----------------------------------------
  const KEY = 'dt_session';
  const read = () => {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch { return null; }
  };
  const write = (s) => {
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  };
  const clear = () => {
    try { sessionStorage.removeItem(KEY); } catch {}
  };

  // Expose tiny API (optional)
  window.UserSession = {
    get() { return read(); },
    set(s) { write(s); },
    clear() { clear(); },
    isAuthenticated() {
      // If no session saved yet, treat as authenticated in design mode
      const s = read();
      return !!(s && s.user && s.user.email);
    }
  };

  // Seed a demo user if none exists (so the chip shows up while designing)
  if (!read()) {
    write({
      user: {
        name: 'Demo Admin',
        email: 'demo@datatech.local',
        role: 'Owner',
        avatar: '' // set to image URL if you have one
      }
    });
  }

  // --- One-time guard (prevents loops) -------------------------------------
  try {
    if (!window.__dt_guard_ran__) {
      window.__dt_guard_ran__ = true;

      const file = location.pathname.split('/').pop().toLowerCase();
      const onLogin = (file === '' || file === 'login.html' || file === 'index.html');
      const authed = window.UserSession.isAuthenticated();

      // Only redirect away from protected pages when definitely unauthenticated
      if (!onLogin && !authed) {
        sessionStorage.setItem('redirectAfterLogin', file || 'dashboard.html');
        location.replace('login.html');
        return;
      }
    }
  } catch {}

  // --- User chip (button + dropdown) ---------------------------------------
  const mount = document.querySelector('.userchip-wrap');
  if (!mount) return;

  const sess = read() || { user: { name: 'User', role: 'User', email: '' } };
  const { name = 'User', role = 'User', avatar = '' } = (sess.user || {});

  // Build chip (NO anchors here)
  mount.innerHTML = `
    <div class="userchip" aria-label="User menu" style="position:relative;">
      <button type="button" class="userchip-btn btn btn-light border rounded-pill px-2 py-1 d-flex align-items-center gap-2" aria-expanded="false">
        <span class="avatar rounded-circle d-inline-flex align-items-center justify-content-center"
              style="width:28px;height:28px;background:#e8eefc;border:1px solid #cfe0ff;">
          ${avatar ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                    : (name ? (name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()) : 'U')}
        </span>
        <span class="text-start">
          <span class="d-block lh-1 fw-semibold">${name}</span>
          <small class="d-block lh-1 text-muted">${role}</small>
        </span>
        <i class="fa-solid fa-chevron-down ms-1"></i>
      </button>

      <div class="userchip-menu dt-card p-2"
           style="display:none; position:absolute; right:0; top:calc(100% + 6px); min-width:220px; z-index:1050;">
        <div class="d-flex align-items-center gap-2 px-1 py-1 border-bottom">
          <span class="avatar rounded-circle d-inline-flex align-items-center justify-content-center"
                style="width:28px;height:28px;background:#e8eefc;border:1px solid #cfe0ff;">
            ${avatar ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                      : (name ? (name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()) : 'U')}
          </span>
          <div class="small">
            <div class="fw-semibold">${name}</div>
            <div class="text-muted">${role}</div>
          </div>
        </div>
        <button type="button" class="dropdown-item w-100 text-start btn btn-link px-2 py-2" data-action="profile">
          <i class="fa-regular fa-user me-2"></i> Profile
        </button>
        <button type="button" class="dropdown-item w-100 text-start btn btn-link px-2 py-2" data-action="settings">
          <i class="fa-solid fa-gear me-2"></i> Settings
        </button>
        <div class="border-top my-1"></div>
        <button type="button" class="dropdown-item w-100 text-start btn btn-link px-2 py-2 text-danger" data-action="logout">
          <i class="fa-solid fa-arrow-right-from-bracket me-2"></i> Logout
        </button>
      </div>
    </div>
  `;

  const chip = mount.querySelector('.userchip');
  const btn  = chip.querySelector('.userchip-btn');
  const menu = chip.querySelector('.userchip-menu');

  function closeMenu() {
    menu.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    const open = menu.style.display === 'block';
    if (open) closeMenu(); else {
      menu.style.display = 'block';
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  // Open/close without navigation
  btn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleMenu();
  });

  // Clicks inside menu never navigate
  menu.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    const action = e.target.closest('[data-action]')?.getAttribute('data-action');
    if (!action) return;

    if (action === 'profile') {
      // Example: open settings subsection
      location.href = 'settings.html#profile';
    } else if (action === 'settings') {
      location.href = 'settings.html';
    } else if (action === 'logout') {
      clear();
      // Return to login once (no loop because we are on a protected page)
      location.replace('login.html');
    }
  });

  // Close on outside click / ESC
  document.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();