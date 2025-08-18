// js/admin.js
(function () {
  // guard (optional)
  try {
    if (window.UserSession && !window.UserSession.isAuthenticated()) {
      sessionStorage.setItem('redirectAfterLogin', 'admin.html');
      location.replace('login.html');
      return;
    }
  } catch (_) {}

  // Sidebar toggles
  const sidebar = document.getElementById('sidebar');
  document.getElementById('burger')?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('collapseBtn')?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  sidebar.querySelectorAll('a.sb-link').forEach(a =>
    a.addEventListener('click', () => sidebar.classList.remove('open'))
  );

  // ---------------- Demo data ----------------
  const ROLES = [
    { name: 'Admin' },
    { name: 'Cashier' },
    { name: 'Accountant' },
    { name: 'Warehouse' },
    { name: 'GM' }
  ];

  const USERS = [
    { name: '304 | Rohit Varghese', email: 'rohit@nebulas.holdings', console: 'Active', app: 'Inactive', roles: ['Accountant'] },
    { name: '298 | Jay Dumes', email: 'jaynvadum@gmail.com', console: 'Active', app: 'Active', roles: ['Cashier'] },
    { name: '285 | Mark Christopher', email: 'deleontopher899@gmail.com', console: 'Active', app: 'Active', roles: ['Cashier'] },
  ];

  const TIERS = [
    { name: 'Green', min: 0,    max: 500,    collect: '5 points / KWD 10',  redeem: 'KWD 1 / 1000 points', customers: 2798 },
    { name: 'Silver', min: 501, max: 1500,   collect: '10 points / KWD 10', redeem: 'KWD 1 / 1000 points', customers: 0 },
    { name: 'Gold',   min: 1501,max: 5000,   collect: '15 points / KWD 10', redeem: 'KWD 1 / 1000 points', customers: 1 },
    { name: 'Diamond',min: 5001,max: 100000, collect: '20 points / KWD 10', redeem: 'KWD 1 / 1000 points', customers: 0 },
  ];

  // --------------- USERS ---------------------
  function renderUsers() {
    const body = document.getElementById('usersBody');
    body.innerHTML = USERS.map(u => `
      <tr>
        <td><input class="form-check-input" type="checkbox"></td>
        <td>
          <div class="fw-semibold">${u.name}</div>
          <div class="text-muted small">${u.email || '—'}</div>
        </td>
        <td>${u.console}</td>
        <td>${u.app}</td>
        <td>${u.roles.map(r => `<span class="badge text-bg-secondary me-1">${r}</span>`).join('')}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary">Edit</button>
            <button class="btn btn-outline-secondary">Deactivate</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // --------------- ROLES ---------------------
  function renderRoles() {
    const grid = document.getElementById('rolesGrid');
    grid.innerHTML = ROLES.map(r => `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="dt-card p-card d-flex align-items-center justify-content-between">
          <div class="fw-semibold">${r.name}</div>
          <button class="btn btn-outline-secondary btn-sm">Manage</button>
        </div>
      </div>
    `).join('');
    // fill roles select in invite modal
    document.getElementById('invRole').innerHTML = ROLES.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  }

  // --------------- TIERS ---------------------
  function renderTiers() {
    const body = document.getElementById('tiersBody');
    body.innerHTML = TIERS.map(t => `
      <tr>
        <td class="fw-semibold">${t.name}</td>
        <td>${t.min.toLocaleString()}</td>
        <td>${t.max.toLocaleString()}</td>
        <td>${t.collect}</td>
        <td>${t.redeem}</td>
        <td class="text-end">${t.customers.toLocaleString()}</td>
      </tr>
    `).join('');
  }

  // Invite user
  document.getElementById('inviteForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('invEmail').value.trim();
    const first = document.getElementById('invFirst').value.trim();
    const last  = document.getElementById('invLast').value.trim();
    const role  = document.getElementById('invRole').value;

    const name = (first || 'New') + (last ? (' ' + last) : '');
    USERS.unshift({ name, email, console:'Active', app:'Inactive', roles:[role] });
    renderUsers();

    const ok = document.getElementById('inviteSuccess');
    ok.classList.remove('d-none');
    setTimeout(() => {
      ok.classList.add('d-none');
      bootstrap.Modal.getInstance(document.getElementById('inviteModal'))?.hide();
      e.target.reset();
    }, 1000);
  });

  // Create role
  document.getElementById('roleForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('roleName').value.trim();
    if (!name) return;
    ROLES.unshift({ name });
    renderRoles();
    const ok = document.getElementById('roleSuccess');
    ok.classList.remove('d-none');
    setTimeout(() => {
      ok.classList.add('d-none');
      bootstrap.Modal.getInstance(document.getElementById('roleModal'))?.hide();
      e.target.reset();
    }, 900);
  });

  // Create tier
  document.getElementById('tierForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = {
      name: document.getElementById('tierName').value.trim(),
      min:  parseInt(document.getElementById('tierMin').value||'0',10),
      max:  parseInt(document.getElementById('tierMax').value||'0',10),
      collect: document.getElementById('tierCollect').value || '5 points / KWD 10',
      redeem:  document.getElementById('tierRedeem').value  || 'KWD 1 / 1000 points',
      customers: 0
    };
    TIERS.push(t);
    renderTiers();
    const ok = document.getElementById('tierSuccess');
    ok.classList.remove('d-none');
    setTimeout(() => {
      ok.classList.add('d-none');
      bootstrap.Modal.getInstance(document.getElementById('tierModal'))?.hide();
      e.target.reset();
    }, 900);
  });

  // Initial paint
  renderUsers();
  renderRoles();
  renderTiers();
})();