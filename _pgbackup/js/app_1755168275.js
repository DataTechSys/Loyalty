/* ============== app.js ==============
 * Page bootstrap:
 *  - Guards / redirects
 *  - Brand rendering (name + logo)
 *  - Hook up forms & lists
 *  - Use window.API (mock or live)
 * ====================================
*/
(function (w, d) {
  const $ = sel => d.querySelector(sel);
  const $$ = sel => d.querySelectorAll(sel);

  // ------- Brand -------
  async function renderBrand() {
    const brandEl = $('#appBrandName');
    const logoEl  = $('#appBrandLogo');

    // read from storage first
    let brand = null;
    try { brand = JSON.parse(localStorage.getItem('brand') || 'null'); } catch {}

    // if missing, try API (silently ignore if fails)
    if (!brand) {
      try {
        const tenant = w.RBAC.activeTenant();
        brand = await w.API.companyBrand(tenant);
        if (brand) localStorage.setItem('brand', JSON.stringify(brand));
      } catch {}
    }

    // fallback
    if (!brand) brand = w.APP_CONFIG.BRAND_FALLBACK || { name: 'Loyalty Console' };

    if (brandEl) brandEl.textContent = brand.name || 'Loyalty Console';
    if (logoEl && brand.logo) {
      logoEl.src = brand.logo;
      logoEl.alt = brand.name || 'Logo';
    }
    const title = d.querySelector('title');
    if (title && brand.name) title.textContent = brand.name;
  }

  // ------- Guards -------
  function guardPublicPage() {
    // For login / index: if already logged in, go dashboard
    if (w.RBAC.isAuthenticated() && w.RBAC.activeTenant()) {
      safeRedirect('dashboard.html');
      return true;
    }
    return false;
  }

  function guardPrivatePage() {
    if (!w.RBAC.isAuthenticated() || !w.RBAC.activeTenant()) {
      safeRedirect('login.html');
      return false;
    }
    return true;
  }

  function safeRedirect(to) {
    try { location.replace(to); }
    catch {
      const root = to.includes('.html') ? to : (to + '.html');
      d.body.innerHTML = `Could not redirect. Open <a href="login.html">login.html</a> or <a href="${root}">${root}</a>.`;
    }
  }

  // ------- Login -------
  function initLogin() {
    if (guardPublicPage()) return;

    const form = $('#loginForm');
    const btn  = $('#loginBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      btn && (btn.disabled = true);

      const tenantId = $('#companyId')?.value?.trim();
      const email    = $('#email')?.value?.trim();
      const password = $('#password')?.value || '';

      try {
        const sess = await w.API.login(email, password, tenantId);
        w.RBAC.setSession(sess);
        w.RBAC.setActiveTenant(sess.tenantId || tenantId || 'tenant');
        localStorage.removeItem('brand'); // next page will fetch brand
        safeRedirect('dashboard.html');
      } catch (err) {
        alert(err.message || 'Sign-in failed');
      } finally {
        btn && (btn.disabled = false);
      }
    });
  }

  // ------- Header -------
  function initHeader() {
    renderBrand();
    const btnLogout = $('#btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        try { await w.API.logout(); } catch {}
        w.RBAC.logout();
        safeRedirect('login.html');
      });
    }
  }

  // ------- Dashboard -------
  async function initDashboard() {
    if (!guardPrivatePage()) return;
    initHeader();

    const sel = $('#rangeSelect');
    const kMembers = $('#kpiMembers');
    const kRedeem  = $('#kpiRedemptions');
    const kCamp    = $('#kpiCampaigns');
    const list     = $('#activityList');

    async function load() {
      try {
        const range = parseInt(sel?.value || '30', 10);
        const data  = await w.API.metrics(w.RBAC.activeTenant(), range);
        if (kMembers) kMembers.textContent = data.members ?? '-';
        if (kRedeem)  kRedeem.textContent  = data.redemptions ?? '-';
        if (kCamp)    kCamp.textContent    = data.campaigns ?? '-';
        if (list) {
          list.innerHTML = '';
          (data.activity || []).forEach(a => {
            const li = d.createElement('li');
            li.textContent = `${a.ts} · ${a.text}`;
            list.appendChild(li);
          });
        }
      } catch (e) {
        console.error(e);
        alert('Failed to load metrics');
      }
    }

    sel && sel.addEventListener('change', load);
    await load();
  }

  // ------- Members -------
  async function initMembers() {
    if (!guardPrivatePage()) return;
    initHeader();

    const search = $('#memberSearch');
    const tbody  = $('#membersTbody');

    async function load() {
      try {
        const q = search?.value?.trim() || '';
        const rows = await w.API.listMembers(w.RBAC.activeTenant(), { q });
        if (!tbody) return;
        tbody.innerHTML = '';
        rows.forEach(r => {
          const tr = d.createElement('tr');
          tr.innerHTML = `
            <td>${r.name}</td>
            <td>${r.phone || '-'}</td>
            <td>${r.email || '-'}</td>
            <td>${r.points ?? '-'}</td>
            <td>${r.lastVisit || '-'}</td>
          `;
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error(e);
        alert('Failed to load members');
      }
    }

    search && search.addEventListener('input', () => {
      clearTimeout(search._t);
      search._t = setTimeout(load, 300);
    });

    await load();
  }

  // ------- Users -------
  async function initUsers() {
    if (!guardPrivatePage()) return;
    initHeader();

    const tbody  = $('#usersTbody');
    try {
      const rows = await w.API.listUsers(w.RBAC.activeTenant());
      if (!tbody) return;
      tbody.innerHTML = '';
      rows.forEach(r => {
        const tr = d.createElement('tr');
        tr.innerHTML = `
          <td>${r.name}</td>
          <td>${r.email}</td>
          <td><span class="badge bg-secondary">${r.role}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error(e);
      alert('Failed to load users');
    }
  }

  // ------- Messages (campaigns) -------
  async function initMessages() {
    if (!guardPrivatePage()) return;
    initHeader();

    const list = $('#campaignList');
    try {
      const rows = await w.API.listCampaigns(w.RBAC.activeTenant());
      if (!list) return;
      list.innerHTML = '';
      rows.forEach(c => {
        const li = d.createElement('li');
        li.innerHTML = `<strong>${c.name}</strong> — ${c.status} <small>${c.sentAt || ''}</small>`;
        list.appendChild(li);
      });
    } catch (e) {
      console.error(e);
      alert('Failed to load campaigns');
    }
  }

  // ------- Router by data-page -------
  d.addEventListener('DOMContentLoaded', () => {
    const page = d.body?.dataset?.page || ''; // set data-page on <body>
    try {
      if (page === 'login')       return initLogin();
      if (page === 'dashboard')   return initDashboard();
      if (page === 'members')     return initMembers();
      if (page === 'users')       return initUsers();
      if (page === 'messages')    return initMessages();

      // Index: decide where to go
      if (w.RBAC.isAuthenticated() && w.RBAC.activeTenant()) {
        safeRedirect('dashboard.html');
      } else {
        safeRedirect('login.html');
      }
    } catch (err) {
      console.error(err);
      d.body.innerHTML = `Could not redirect. Open <a href="login.html">login.html</a> or <a href="dashboard.html">dashboard.html</a>.`;
    }
  });
})(window, document);
