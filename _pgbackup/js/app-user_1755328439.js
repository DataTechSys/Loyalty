/* js/user-app.js
   Session helper, guard, user dropdown chip, and sidebar behaviors.
   Safe-by-default: no accidental reloads or navigation loops.
*/
(function () {
  // =========================================================================
  // Session store (demo) ----------------------------------------------------
  // =========================================================================
  const KEY = 'dt_session';
  const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } };
  const write = (s) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  const clear = () => { try { sessionStorage.removeItem(KEY); } catch {} };

  // Public tiny API
  window.UserSession = {
    get: read,
    set: write,
    clear,
    isAuthenticated() {
      const s = read();
      return !!(s && s.user && s.user.email);
    }
  };

  // Seed a demo user so the chip shows while designing
  if (!read()) {
    write({
      user: {
        name: 'Demo Admin',
        email: 'demo@datatech.local',
        role: 'Owner',
        avatar: '' // set to an image URL to show a real photo
      }
    });
  }

  // =========================================================================
  // Guard (once): redirect unauthenticated users from protected pages -------
  // =========================================================================
  try {
    if (!window.__dt_guard_ran__) {
      window.__dt_guard_ran__ = true;

      const file = location.pathname.split('/').pop().toLowerCase();
      const onLogin = (file === '' || file === 'login.html' || file === 'index.html');
      const authed = window.UserSession.isAuthenticated();

      if (!onLogin && !authed) {
        sessionStorage.setItem('redirectAfterLogin', file || 'dashboard.html');
        location.replace('login.html');
        return;
      }
    }
  } catch {}

  // =========================================================================
  // Topbar user chip + dropdown (safe clicks, no anchors inside) ------------
  // =========================================================================
  (function mountUserChip() {
    const mount = document.querySelector('.userchip-wrap');
    if (!mount) return;

    const sess = read() || { user: { name: 'User', role: 'User', email: '' } };
    const { name = 'User', role = 'User', avatar = '' } = (sess.user || {});
    const initials = (name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'U');

    mount.innerHTML = `
      <div class="userchip" aria-label="User menu" style="position:relative;">
        <button type="button" class="userchip-btn btn btn-light border rounded-pill px-2 py-1 d-flex align-items-center gap-2" aria-expanded="false">
          <span class="avatar rounded-circle d-inline-flex align-items-center justify-content-center"
                style="width:28px;height:28px;background:#e8eefc;border:1px solid #cfe0ff;">
            ${avatar
              ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
              : initials}
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
              ${avatar
                ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : initials}
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

    const closeMenu = () => { menu.style.display = 'none'; btn.setAttribute('aria-expanded', 'false'); };
    const toggleMenu = () => {
      const open = menu.style.display === 'block';
      if (open) closeMenu(); else { menu.style.display = 'block'; btn.setAttribute('aria-expanded', 'true'); }
    };

    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(); });
    menu.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const action = e.target.closest('[data-action]')?.getAttribute('data-action');
      if (!action) return;

      if (action === 'profile') {
        location.href = 'settings.html#profile';
      } else if (action === 'settings') {
        location.href = 'settings.html';
      } else if (action === 'logout') {
        clear();
        location.replace('login.html');
      }
    });

    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  })();

  // =========================================================================
  // Sidebar: burger, collapse, groups, active link, state persistence -------
  // =========================================================================
  (function sidebarEnhancements(){
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Burger (mobile overlay) + collapse (mini)
    document.getElementById('burger')?.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('collapseBtn')?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    sidebar.querySelectorAll('a.sb-link').forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));

    // Collapsible groups
    // Persist open/close per group via sessionStorage: key = sb.open.<data-group>
    document.querySelectorAll('.sb-group').forEach(g => {
      const key = 'sb.open.' + (g.dataset.group || '');
      if (sessionStorage.getItem(key) === '1') g.classList.add('open');
    });

    document.querySelectorAll('[data-toggle="sb-group"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const group = btn.closest('.sb-group');
        if (!group) return;
        group.classList.toggle('open');
        const key = 'sb.open.' + (group.dataset.group || '');
        sessionStorage.setItem(key, group.classList.contains('open') ? '1' : '0');
      });
    });

    // Active link marking (top links & sublinks)
    const file = location.pathname.split('/').pop().toLowerCase() || 'dashboard.html';
    const allLinks = sidebar.querySelectorAll('a.sb-link, a.sb-sublink');
    let matchedLink = null;

    allLinks.forEach(a => {
      const href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      if (href && href === file) matchedLink = a;
    });
    if (matchedLink) {
      matchedLink.classList.add('active');
      // auto-open parent groups
      let p = matchedLink.closest('.sb-group');
      while (p) {
        p.classList.add('open');
        sessionStorage.setItem('sb.open.' + (p.dataset.group || ''), '1');
        p = p.parentElement?.closest('.sb-group');
      }
    }
  })();

  // =========================================================================
  // Optional: footer year auto-inject (if you use .sb-footer-year span) -----
  // =========================================================================
  (function footerYear(){
    document.querySelectorAll('.sb-footer-year').forEach(el => el.textContent = new Date().getFullYear());
  })();
})();