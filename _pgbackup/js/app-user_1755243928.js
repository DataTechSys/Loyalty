/* app-user.js — renders the logged-in user chip in the top bar across pages */
(function(){
  const KEY_USER    = 'RBAC_USER';
  const KEY_SESSION = 'RBAC_SESSION';

  function getUser(){
    try{ return JSON.parse(localStorage.getItem(KEY_USER)||'null'); }catch{ return null; }
  }
  function isAuthed(){
    try{ return !!JSON.parse(localStorage.getItem(KEY_SESSION)||'null'); }catch{ return false; }
  }
  function initials(name){
    if (!name) return 'U';
    const parts = String(name).trim().split(/\s+/).slice(0,2);
    return parts.map(p=>p[0]?.toUpperCase()||'').join('') || 'U';
  }
  function injectStyles(){
    if (document.getElementById('dt-userchip-style')) return;
    const css = `
      .userchip{ display:flex; align-items:center; gap:8px; border:1px solid #e5e7eb; background:#fff;
        border-radius:999px; padding:6px 10px; cursor:default; box-shadow:0 4px 12px rgba(15,23,42,.06);}
      .userchip .avatar{ width:28px; height:28px; border-radius:50%; overflow:hidden; background:#eef2ff; color:#1f3a8a;
        display:grid; place-items:center; font-weight:800; font-size:12px; }
      .userchip .avatar img{ width:100%; height:100%; object-fit:cover; }
      .userchip .name{ font-weight:600; font-size:.9rem; }
      .userchip .menu-btn{ border:0; background:transparent; padding:0 4px; line-height:0; }
      .userchip .menu{ position:absolute; top:100%; right:0; background:#fff; border:1px solid #e5e7eb;
        border-radius:12px; box-shadow:0 10px 24px rgba(15,23,42,.12); padding:6px; display:none; min-width:160px; z-index:2000; }
      .userchip .menu a{ display:block; padding:8px 10px; border-radius:8px; text-decoration:none; color:#0f172a; font-size:.92rem; }
      .userchip .menu a:hover{ background:#f8fafc; }
      .userchip-wrap{ position:relative; }
    `;
    const style = document.createElement('style');
    style.id = 'dt-userchip-style';
    style.textContent = css;
    document.head.appendChild(style);
  }
  function renderChip(){
    injectStyles();
    const user = getUser();
    if (!user || !isAuthed()) return;

    // Find topbar right-side action group (your pages use: .dt-topbar .container > .d-flex:last-child)
    const slot = document.querySelector('.dt-topbar .container .d-flex:last-child');
    if (!slot) return;

    // Build chip
    const wrap = document.createElement('div');
    wrap.className = 'userchip-wrap';
    wrap.innerHTML = `
      <div class="userchip">
        <div class="avatar">${user.photoUrl ? `<img src="${user.photoUrl}" alt="avatar">` : initials(user.name)}</div>
        <div class="name">${user.name || 'User'}</div>
        <button class="menu-btn" aria-label="Open menu">▾</button>
      </div>
      <div class="menu">
        <a href="settings.html">Profile & Settings</a>
        <a href="#" id="dt-logout">Logout</a>
      </div>
    `;
    slot.prepend(wrap);

    // Menu behavior
    const menu = wrap.querySelector('.menu');
    wrap.querySelector('.menu-btn').addEventListener('click', (e)=>{
      e.stopPropagation();
      menu.style.display = (menu.style.display==='block') ? 'none' : 'block';
    });
    document.addEventListener('click', ()=> menu.style.display='none');

    // Logout
    wrap.querySelector('#dt-logout').addEventListener('click', (e)=>{
      e.preventDefault();
      try{
        localStorage.removeItem(KEY_SESSION);
        // Keep RBAC_USER so the name persists for future logins? Clear it to be safe:
        // localStorage.removeItem(KEY_USER);
      }catch(_){}
      location.href = 'login.html';
    });
  }

  // Expose minimal API if you need to set/update user elsewhere
  window.UserSession = {
    get: getUser,
    set: (userObj) => localStorage.setItem(KEY_USER, JSON.stringify(userObj || {})),
    isAuthenticated: isAuthed,
    render: renderChip
  };

  document.addEventListener('DOMContentLoaded', renderChip);
})();