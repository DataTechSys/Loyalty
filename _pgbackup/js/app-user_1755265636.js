/* /js/app-user.js — render the logged-in user's name + avatar in the topbar on every page */
(function(){
  // ---- Config / storage keys -----------------------------------------------
  const KEY_USER    = 'RBAC_USER';     // { name, email, photoUrl }
  const KEY_SESSION = 'RBAC_SESSION';  // { userId, companyId, email, role, issuedAt }

  // ---- Helpers --------------------------------------------------------------
  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null'); } catch { return null; }
  }
  function setUser(userObj) {
    localStorage.setItem(KEY_USER, JSON.stringify(userObj || {}));
    renderChip(true);
  }
  function isAuthed() {
    try { return !!JSON.parse(localStorage.getItem(KEY_SESSION) || 'null'); } catch { return false; }
  }
  function logout() {
    try { localStorage.removeItem(KEY_SESSION); } catch {}
    // Optionally also clear user profile:
    // localStorage.removeItem(KEY_USER);
    location.href = 'login.html';
  }
  function initials(name) {
    if (!name) return 'U';
    const parts = String(name).trim().split(/\s+/).slice(0, 2);
    const res = parts.map(p => (p[0] || '').toUpperCase()).join('');
    return res || 'U';
  }

  // ---- Styles ---------------------------------------------------------------
  function injectStyles(){
    if (document.getElementById('dt-userchip-style')) return;
    const style = document.createElement('style');
    style.id = 'dt-userchip-style';
    style.textContent = `
      .userchip{ display:flex; align-items:center; gap:8px; border:1px solid #e5e7eb; background:#fff;
        border-radius:999px; padding:6px 10px; cursor:default; box-shadow:0 4px 12px rgba(15,23,42,.06);}
      .userchip .avatar{ width:28px; height:28px; border-radius:50%; overflow:hidden; background:#eef2ff; color:#1f3a8a;
        display:grid; place-items:center; font-weight:800; font-size:12px; }
      .userchip .avatar img{ width:100%; height:100%; object-fit:cover; }
      .userchip .name{ font-weight:600; font-size:.9rem; white-space:nowrap; max-width:160px; overflow:hidden; text-overflow:ellipsis; }
      .userchip .menu-btn{ border:0; background:transparent; padding:0 4px; line-height:0; font-size:14px; }
      .userchip-wrap{ position:relative; }
      .userchip-menu{ position:absolute; top:100%; right:0; background:#fff; border:1px solid #e5e7eb;
        border-radius:12px; box-shadow:0 10px 24px rgba(15,23,42,.12); padding:6px; display:none; min-width:180px; z-index:2000; }
      .userchip-menu a{ display:block; padding:8px 10px; border-radius:8px; text-decoration:none; color:#0f172a; font-size:.92rem; }
      .userchip-menu a:hover{ background:#f8fafc; }
    `;
    document.head.appendChild(style);
  }

  // ---- DOM target detection -------------------------------------------------
  function findTopbarRightSlot(){
    // Your pages use: .dt-topbar > .container (last child is right actions)
    let slot = document.querySelector('.dt-topbar .container .d-flex:last-child');
    if (slot) return slot;

    // Fallback: right area not found — create one
    const container = document.querySelector('.dt-topbar .container');
    if (container) {
      slot = document.createElement('div');
      slot.className = 'd-flex align-items-center gap-2';
      container.appendChild(slot);
      return slot;
    }
    return null;
  }

  // ---- Render ---------------------------------------------------------------
  let mounted = null; // keep reference to chip wrapper to avoid duplicates

  function renderChip(force){
    if (!isAuthed()) { removeChip(); return; }

    injectStyles();
    const user = getUser();
    const slot = findTopbarRightSlot();
    if (!slot) return;

    // If already mounted and not forced, do nothing
    if (mounted && !force && document.body.contains(mounted)) return;
    removeChip();

    const wrap = document.createElement('div');
    wrap.className = 'userchip-wrap';
    wrap.innerHTML = `
      <div class="userchip" aria-label="User menu">
        <div class="avatar">${user?.photoUrl ? `<img src="${user.photoUrl}" alt="avatar">` : (initials(user?.name))}</div>
        <div class="name">${user?.name || 'User'}</div>
        <button class="menu-btn" aria-label="Open menu">▾</button>
      </div>
      <div class="userchip-menu">
        <a href="settings.html">Profile & Settings</a>
        <a href="#" data-logout>Logout</a>
      </div>
    `;
    slot.prepend(wrap);
    mounted = wrap;

    const menu = wrap.querySelector('.userchip-menu');
    const btn  = wrap.querySelector('.menu-btn');

    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      menu.style.display = (menu.style.display==='block') ? 'none' : 'block';
    });
    document.addEventListener('click', ()=> (menu.style.display='none'));

    wrap.querySelector('[data-logout]').addEventListener('click', (e)=>{
      e.preventDefault(); logout();
    });
  }

  function removeChip(){
    if (mounted && mounted.parentNode) {
      mounted.parentNode.removeChild(mounted);
    }
    mounted = null;
  }

  // Update chip automatically when user/session changes in other tabs
  window.addEventListener('storage', (e)=>{
    if (e.key === KEY_USER || e.key === KEY_SESSION) renderChip(true);
  });

  // ---- Public API -----------------------------------------------------------
  window.UserSession = {
    get: getUser,
    set: setUser,                          // set({ name, email, photoUrl })
    isAuthenticated: isAuthed,
    logout,
    render: () => renderChip(true),        // force re-render
    // convenience updaters:
    updateName: (name) => { const u=getUser()||{}; u.name=name; setUser(u); },
    updatePhoto: (photoUrl) => { const u=getUser()||{}; u.photoUrl=photoUrl; setUser(u); }
  };

  // ---- Boot ----------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => renderChip(false));
})();