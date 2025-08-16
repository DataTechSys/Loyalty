/* js/app-user.js
   Session helper + auth guard + userchip (avatar dropdown) for the topbar.
   Now robust: waits for .userchip-wrap (inserted by includes) before mounting.
*/
(function () {
  // ---------- Session store ----------
  const KEY = 'dt_session';

  const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY)||'null'); } catch { return null; } };
  const write = (s) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  const clear = () => { try { sessionStorage.removeItem(KEY); } catch {} };

  window.UserSession = {
    get: read,
    set: write,
    clear,
    isAuthenticated() {
      const s = read();
      return !!(s && s.user && s.user.email);
    }
  };

  // Seed demo user for design
  if (!read()) {
    write({ user:{
      name:'Demo Admin',
      email:'demo@datatech.local',
      role:'Owner',
      isAdmin:true,
      avatar:''     // set by profile.html after upload
    }});
  }

  // ---------- Guard (no loops) ----------
  try {
    if (!window.__dt_guard_done__) {
      window.__dt_guard_done__ = true;
      const file = (location.pathname.split('/').pop() || '').toLowerCase();
      const isLogin = (file === '' || file === 'login.html' || file === 'index.html');
      if (!isLogin && !UserSession.isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', file || 'dashboard.html');
        location.replace('login.html');
        return;
      }
    }
  } catch {}

  // ---------- User chip ----------
  function initials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).slice(0,2);
    return parts.map(p=>p[0]).join('').toUpperCase();
  }

  function renderInto(host) {
    const sess = read() || {user:{}};
    const u = sess.user || {};
    const name   = u.name  || 'User';
    const email  = u.email || '';
    const role   = u.role  || 'User';
    const avatar = u.avatar || '';
    const isAdmin = !!(u.isAdmin || /^(owner|admin)$/i.test(role));

    host.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-light border rounded-pill px-2 py-1 d-flex align-items-center gap-2"
                id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false" type="button">
          <span class="rounded-circle d-inline-flex align-items-center justify-content-center"
                style="width:28px;height:28px;background:#e8eefc;border:1px solid #cfe0ff;overflow:hidden;">
            ${avatar
              ? `<img src="${avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
              : `<span class="small fw-bold" style="line-height:28px;">${initials(name)}</span>`}
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
                  : `<span class="small fw-bold" style="line-height:28px;">${initials(name)}</span>`}
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

    host.querySelectorAll('[data-action]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const act = a.getAttribute('data-action');
        if (act==='profile')   location.href = 'profile.html';
        else if (act==='settings') location.href = 'settings.html';
        else if (act==='admin')    location.href = 'admin.html';
        else if (act==='logout') { clear(); location.replace('login.html'); }
      });
    });
  }

  function mountWhenReady() {
    const existing = document.querySelector('.userchip-wrap');
    if (existing) { renderInto(existing); return; }

    // Wait for includes to inject the topbar
    const obs = new MutationObserver((_m, o)=>{
      const target = document.querySelector('.userchip-wrap');
      if (target) { o.disconnect(); renderInto(target); }
    });
    obs.observe(document.documentElement, { childList:true, subtree:true });

    // Safety: force one last check after DOM ready
    document.addEventListener('DOMContentLoaded', ()=>{
      const t = document.querySelector('.userchip-wrap');
      if (t) { obs.disconnect(); renderInto(t); }
    });
  }

  // Re-render if session is changed from another tab/page (e.g. avatar updated)
  window.addEventListener('storage', (e)=>{
    if (e.key === KEY) {
      const host = document.querySelector('.userchip-wrap');
      if (host) renderInto(host);
    }
  });

  mountWhenReady();
})();