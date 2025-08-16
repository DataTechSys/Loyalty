/* app.js — page bootstrap, guards, and page loaders
   Requires: app-auth.js, config.js, api.js
*/
(function (global) {
  const App = {};
  const $$ = (sel, root = document) => root.querySelector(sel);
  const $$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const page = location.pathname.split('/').pop().toLowerCase() || 'index.html';

  // ------- BRAND (logo + name) -------
  function renderBrand() {
    const brand = JSON.parse(localStorage.getItem('brand') || 'null') || {
      name: 'Loyalty Console',
      logo: 'images/DataTech.png'
    };
    const titleEl = $$('#appBrandName') || $$('#brandName');
    const logoEl = $$('#appBrandLogo') || $$('#brandLogo');

    if (titleEl) titleEl.textContent = brand.name;
    if (logoEl) {
      logoEl.src = brand.logo || 'images/DataTech.png';
      logoEl.alt = brand.name || 'Loyalty';
    }
    // Also change <title> if present
    if (document.title && brand.name) {
      document.title = `${brand.name} — ${document.title.replace(/.*—\s*/,'') || 'Console'}`;
    }
  }

  // ------- AUTH GUARDS -------
  function guard() {
    const isLogin = ['login.html', 'index.html'].includes(page);
    const authed = global.RBAC && RBAC.isAuthenticated && RBAC.isAuthenticated();

    if (!authed && !isLogin) {
      location.replace('login.html');
      return false;
    }
    if (authed && isLogin) {
      // already signed in -> go to dashboard
      location.replace('dashboard.html');
      return false;
    }
    return true;
  }

  // ------- COMMON UI -------
  function wireCommonUI() {
    const btnLogout = $$('#btnLogout') || $$('#logoutBtn') || $$('#logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (global.API && API.logout) API.logout();
        if (global.RBAC && RBAC.logout) RBAC.logout();
        location.replace('login.html');
      });
    }
  }

  // ------- HELPERS -------
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const setHTML = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };

  // ------- PAGE: LOGIN -------
  async function initLogin() {
    // optional brand on the login page
    renderBrand();

    const form = $('#loginForm') || $('#formLogin') || document.getElementById('loginForm');
    const companyEl = $('#companyId') || $('#tenant') || document.getElementById('companyId');
    const emailEl   = $('#email')     || document.getElementById('email');
    const passEl    = $('#password')  || document.getElementById('password');
    const btn       = $('#loginBtn')  || document.getElementById('loginBtn');

    async function doLogin(e) {
      e && e.preventDefault();
      const tenantId = (companyEl && companyEl.value || '').trim() || 'demo';
      const email    = (emailEl && emailEl.value || '').trim();
      const password = (passEl && passEl.value || '').trim();
      if (!email || !password) { alert('Enter email and password'); return; }

      try {
        const sess = await API.login(email, password, tenantId);
        // persist session + active tenant
        if (global.RBAC && RBAC.setSession) RBAC.setSession(sess);
        if (global.RBAC && RBAC.setActiveTenant) RBAC.setActiveTenant(tenantId);

        // simple brand seed (you can set this after fetching company profile)
        localStorage.setItem('brand', JSON.stringify({
          name: 'Loyalty Console',
          logo: 'images/DataTech.png'
        }));

        location.replace('dashboard.html');
      } catch (err) {
        console.error(err);
        alert('Login failed: ' + (err.message || err));
      }
    }

    if (form) form.addEventListener('submit', doLogin);
    if (btn)  btn.addEventListener('click', doLogin);
  }

  // ------- PAGE: DASHBOARD -------
  async function initDashboard() {
    renderBrand();
    const tenantId = RBAC.activeTenant && RBAC.activeTenant();
    try {
      const rangeSel = $('#rangeSelect') || document.getElementById('rangeSelect');
      const range = (rangeSel && rangeSel.value) || '30d';
      const data = await API.metrics(tenantId, range);

      setText('kpiMembers',      data.members ?? '—');
      setText('kpiRedemptions',  data.redemptions ?? '—');
      setText('kpiCampaigns',    data.campaigns ?? '—');

      const act = (data.activity || [])
        .map(a => `<li><span class="text-muted">${a.ts}</span> — ${a.text}</li>`).join('');
      setHTML('activityList', act || '<li class="text-muted">No recent activity</li>');

      if (rangeSel) {
        rangeSel.addEventListener('change', () => location.reload());
      }
    } catch (err) {
      console.error(err);
      setHTML('activityList', `<li class="text-danger">${err.message || err}</li>`);
    }
  }

  // ------- PAGE: MEMBERS -------
  async function initMembers() {
    renderBrand();
    const tenantId = RBAC.activeTenant && RBAC.activeTenant();

    const tbody = $('#membersTbody') || $('#members tbody') || document.getElementById('membersTbody');
    const search = $('#memberSearch') || document.getElementById('memberSearch');

    async function load(q = '') {
      const res = await API.listMembers(tenantId, q ? { q } : {});
      const rows = (res.items || []).map(m => `
        <tr>
          <td>${m.name || '—'}</td>
          <td>${m.phone || '—'}</td>
          <td>${m.email || '—'}</td>
          <td>${m.points ?? '—'}</td>
          <td>${m.lastVisit || '—'}</td>
        </tr>
      `).join('');
      if (tbody) tbody.innerHTML = rows || '<tr><td colspan="5" class="text-muted">No members</td></tr>';
    }

    if (search) {
      search.addEventListener('input', e => load(e.target.value.trim()));
    }
    await load('');
  }

  // ------- PAGE: USERS -------
  async function initUsers() {
    renderBrand();
    const tenantId = RBAC.activeTenant && RBAC.activeTenant();
    const tbody = $('#usersTbody') || $('#users tbody') || document.getElementById('usersTbody');
    const res = await API.listUsers(tenantId);
    const rows = (res || []).map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role || 'member'}</td>
      </tr>
    `).join('');
    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="3" class="text-muted">No users</td></tr>';
  }

  // ------- PAGE: MESSAGES (campaigns) -------
  async function initMessages() {
    renderBrand();
    const tenantId = RBAC.activeTenant && RBAC.activeTenant();
    const list = $('#campaignList') || document.getElementById('campaignList');
    const items = await API.listCampaigns(tenantId);
    if (list) {
      list.innerHTML = (items || []).map(c =>
        `<li><strong>${c.name}</strong> <span class="text-muted">(${c.channel})</span></li>`
      ).join('') || '<li class="text-muted">No campaigns yet</li>';
    }
  }

  // ------- PAGE: SETTINGS -------
  function initSettings() {
    renderBrand();
    // placeholder – wire specific settings later
  }

  // ------- INIT -------
  function boot() {
    if (!guard()) return;         // redirect if needed
    wireCommonUI();               // hooks like logout
    renderBrand();                // header branding

    switch (page) {
      case 'login.html':      initLogin(); break;
      case 'dashboard.html':  initDashboard(); break;
      case 'members.html':    initMembers(); break;
      case 'users.html':      initUsers(); break;
      case 'messages.html':   initMessages(); break;
      case 'settings.html':   initSettings(); break;
      // index.html will redirect via guard if authenticated
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose for debugging
  global.App = App;
})(window);
