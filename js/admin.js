// js/admin.js
(function () {
  // ---- Auth guard (optional) ----------------------------------------------
  try {
    if (window.UserSession && !window.UserSession.isAuthenticated()) {
      sessionStorage.setItem('redirectAfterLogin', 'admin.html');
      location.replace('login.html');
      return;
    }
  } catch (_) {}

  // ---- Sidebar toggles -----------------------------------------------------
  const sidebar = document.getElementById('sidebar');
  document.getElementById('burger')?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('collapseBtn')?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  sidebar?.querySelectorAll('a.sb-link')?.forEach(a =>
    a.addEventListener('click', () => sidebar.classList.remove('open'))
  );

  // ---------------- Demo Data ----------------------------------------------
  const ROLES = [
    { name: 'Admin' }, { name: 'Cashier' }, { name: 'Accountant' }, { name: 'Warehouse' }, { name: 'GM' }
  ];

  const USERS = [
    { name: '304 | Rohit Varghese', email: 'rohit@nebulas.holdings', console: 'Active', app: 'Inactive', roles: ['Accountant'] },
    { name: '298 | Jay Dumes',      email: 'jaynvadum@gmail.com',     console: 'Active', app: 'Active',   roles: ['Cashier'] },
    { name: '285 | Mark Christopher', email: 'deleontopher899@gmail.com', console: 'Active', app: 'Active', roles: ['Cashier'] },
  ];

  // NEW: image field for each tier (use placeholder if you don’t have designs yet)
  const TIERS = [
    { name:'Green',   min:0,    max:500,    collect:'5 points / KWD 10',  redeem:'KWD 1 / 1000 points', customers:2798, img:'images/tiers/green.png' },
    { name:'Silver',  min:501,  max:1500,   collect:'10 points / KWD 10', redeem:'KWD 1 / 1000 points', customers:0,    img:'images/tiers/silver.png' },
    { name:'Gold',    min:1501, max:5000,   collect:'15 points / KWD 10', redeem:'KWD 1 / 1000 points', customers:1,    img:'images/tiers/gold.png' },
    { name:'Diamond', min:5001, max:100000, collect:'20 points / KWD 10', redeem:'KWD 1 / 1000 points', customers:0,    img:'images/tiers/diamond.png' },
  ];

  const PLACEHOLDER = 'images/tiers/placeholder.png';

  // ---------------- Users ---------------------------------------------------
  function renderUsers() {
    const body = document.getElementById('usersBody');
    if (!body) return;
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

  // ---------------- Roles ---------------------------------------------------
  function renderRoles() {
    const grid = document.getElementById('rolesGrid');
    if (!grid) return;
    grid.innerHTML = ROLES.map(r => `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="dt-card p-card d-flex align-items-center justify-content-between">
          <div class="fw-semibold">${r.name}</div>
          <button class="btn btn-outline-secondary btn-sm">Manage</button>
        </div>
      </div>
    `).join('');
    const select = document.getElementById('invRole');
    if (select) select.innerHTML = ROLES.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  }

  // ---------------- Tiers (list + edit) ------------------------------------
  function renderTiers() {
    const body = document.getElementById('tiersBody');
    if (!body) return;

    body.innerHTML = TIERS.map((t, i) => `
      <tr class="tier-row" data-index="${i}">
        <td><img class="tier-thumb" src="${t.img || PLACEHOLDER}" onerror="this.src='${PLACEHOLDER}'" alt=""></td>
        <td class="fw-semibold">${t.name}</td>
        <td>${t.min.toLocaleString()}</td>
        <td>${t.max.toLocaleString()}</td>
        <td>${t.collect}</td>
        <td>${t.redeem}</td>
        <td class="text-end">${t.customers.toLocaleString()}</td>
        <td class="text-end">
          <button class="btn btn-outline-secondary btn-sm" data-action="edit" data-index="${i}">Edit</button>
        </td>
      </tr>
    `).join('');

    // row click opens edit (excluding direct button clicks)
    body.querySelectorAll('tr.tier-row').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="edit"]')) return;
        openTierModal(Number(tr.getAttribute('data-index')));
      });
    });
    // edit buttons
    body.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTierModal(Number(btn.getAttribute('data-index')));
      });
    });
  }

  function openTierModal(index = -1) {
    const isNew = index === -1;
    const m = new bootstrap.Modal(document.getElementById('tierModal'));
    const t = isNew ? {
      name:'', min:0, max:100, collect:'', redeem:'', img: PLACEHOLDER, customers:0
    } : { ...TIERS[index] };

    document.getElementById('tierModalTitle').textContent = isNew ? 'New Tier' : 'Edit Tier';
    document.getElementById('tierName').value    = t.name || '';
    document.getElementById('tierMin').value     = t.min ?? 0;
    document.getElementById('tierMax').value     = t.max ?? 0;
    document.getElementById('tierCollect').value = t.collect || '';
    document.getElementById('tierRedeem').value  = t.redeem || '';
    document.getElementById('tierIndex').value   = index;

    const prev = document.getElementById('tierCardPreview');
    prev.style.backgroundImage = `url('${(t.img || PLACEHOLDER)}')`;

    // reset file input & preview change handler
    const file = document.getElementById('tierImg');
    file.value = '';
    file.onchange = () => {
      const f = file.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        prev.style.backgroundImage = `url('${reader.result}')`;
        prev.dataset.pendingImg = reader.result; // store data URL to save
      };
      reader.readAsDataURL(f);
    };

    document.getElementById('tierSaved').classList.add('d-none');
    m.show();
  }

  // Save tier
  document.getElementById('tierForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idx = Number(document.getElementById('tierIndex').value);
    const obj = {
      name:    document.getElementById('tierName').value.trim(),
      min:     Math.max(0, Number(document.getElementById('tierMin').value || 0)),
      max:     Math.max(0, Number(document.getElementById('tierMax').value || 0)),
      collect: document.getElementById('tierCollect').value.trim(),
      redeem:  document.getElementById('tierRedeem').value.trim(),
      img:     (document.getElementById('tierCardPreview').dataset.pendingImg || null)
    };

    // Ensure image stays as previous if no new file chosen
    if (idx >= 0 && !obj.img) obj.img = TIERS[idx].img;
    if (!obj.img) obj.img = PLACEHOLDER;

    if (idx === -1) {
      TIERS.unshift({ ...obj, customers: 0 });
    } else {
      TIERS[idx] = { ...TIERS[idx], ...obj };
    }

    renderTiers();

    const ok = document.getElementById('tierSaved');
    ok.classList.remove('d-none');
    setTimeout(() => {
      bootstrap.Modal.getInstance(document.getElementById('tierModal'))?.hide();
      // clean preview temp state
      const prev = document.getElementById('tierCardPreview');
      delete prev.dataset.pendingImg;
    }, 800);
  });

  // New tier
  document.getElementById('btnNewTier')?.addEventListener('click', () => openTierModal(-1));

  // ---------------- Invite user (unchanged demo) ---------------------------
  document.getElementById('inviteForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('invEmail').value.trim();
    const first = document.getElementById('invFirst').value.trim();
    const last  = document.getElementById('invLast').value.trim();
    const role  = document.getElementById('invRole').value;
    const name  = (first || 'New') + (last ? (' ' + last) : '');
    USERS.unshift({ name, email, console:'Active', app:'Inactive', roles:[role] });
    renderUsers();
    const ok = document.getElementById('inviteSuccess');
    ok.classList.remove('d-none');
    setTimeout(() => {
      ok.classList.add('d-none');
      bootstrap.Modal.getInstance(document.getElementById('inviteModal'))?.hide();
      e.target.reset();
    }, 900);
  });

  // ---------------- Roles create (unchanged demo) --------------------------
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

  // Initial render
  renderUsers();
  renderRoles();
  renderTiers();
})();