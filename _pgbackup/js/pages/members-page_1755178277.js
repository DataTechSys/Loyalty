// js/pages/members-page.js
// All logic for Customers page: tabs, search, pagination, rendering
(function () {
  // ===== Guards / auth redirect =====
  try {
    if (!window.RBAC || !RBAC.isAuthenticated()) {
      // remember where to come back after login
      sessionStorage.setItem('redirectAfterLogin', 'members.html');
      location.replace('login.html');
      return;
    }
  } catch { /* ignore */ }

  // ===== Elements =====
  const $rows = document.getElementById('rows');
  const $loading = document.getElementById('loadingRow');
  const $q = document.getElementById('q');
  const $tabs = document.getElementById('filterTabs');
  const $prev = document.getElementById('btnPrev');
  const $next = document.getElementById('btnNext');
  const $showing = document.getElementById('showingText');
  const $checkAll = document.getElementById('checkAll');

  // ===== State =====
  const state = {
    page: 1,
    perPage: 50,
    q: '',
    filter: 'all',
    total: 0,
    items: []
  };

  // ===== Helpers =====
  const fmt = {
    phone: v => v || '—',
    email: v => v || '—',
    num: v => typeof v === 'number' ? v.toLocaleString() : '—',
    date: v => v ? v : '—',
    money: v => (v == null ? '—' : `KWD ${v}`)
  };

  function showLoading(yes = true) {
    $loading.style.display = yes ? '' : 'none';
  }

  function emptyRows() {
    $rows.innerHTML = '';
  }

  function renderRows(items) {
    emptyRows();
    if (!items.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="8" class="py-5 text-center text-muted">No customers found.</td>`;
      $rows.appendChild(tr);
      return;
    }

    for (const c of items) {
      const tr = document.createElement('tr');

      const name = c.name || '—';
      const phone = fmt.phone(c.phone);
      const email = fmt.email(c.email);
      const totalOrders = fmt.num(c.totalOrders);
      const lastOrder = fmt.date(c.lastOrderAt);
      const bal = fmt.money(c.balance);

      tr.innerHTML = `
        <td>
          <input class="form-check-input row-check" type="checkbox" data-id="${c.id}"/>
        </td>
        <td>
          <div class="fw-semibold">${name}</div>
          <div class="small text-muted">${c.code || ''}</div>
        </td>
        <td class="text-nowrap">${phone}</td>
        <td class="text-nowrap">${email}</td>
        <td>${totalOrders}</td>
        <td class="text-nowrap">${lastOrder}</td>
        <td>${bal}</td>
        <td class="text-end sticky-actions">
          <div class="dropdown">
            <button class="btn btn-sm btn-light" data-bs-toggle="dropdown" aria-expanded="false">⋮</button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" data-act="view" data-id="${c.id}">View</a></li>
              <li><a class="dropdown-item" href="#" data-act="edit" data-id="${c.id}">Edit</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" data-act="delete" data-id="${c.id}">Delete</a></li>
            </ul>
          </div>
        </td>
      `;
      $rows.appendChild(tr);
    }

    // check-all behavior
    $checkAll.checked = false;
    $checkAll.addEventListener('change', () => {
      document.querySelectorAll('.row-check').forEach(cb => cb.checked = $checkAll.checked);
    }, { once: true });
  }

  function updateFooter(total, page, perPage) {
    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    $showing.textContent = `Showing ${start} to ${end} of ${total}`;
    $prev.disabled = page <= 1;
    $next.disabled = end >= total;
  }

  // ===== Data (uses your window.API; falls back to generated mock) =====
  async function fetchMembers() {
    showLoading(true);
    try {
      const api = window.API && window.API.listMembers
        ? window.API
        : createLocalMock(); // safety fallback if app.js isn’t present

      const res = await api.listMembers({
        page: state.page,
        perPage: state.perPage,
        q: state.q,
        filter: state.filter
      });

      state.items = res.items || [];
      state.total = res.total || state.items.length;

      renderRows(state.items);
      updateFooter(state.total, state.page, state.perPage);
    } catch (err) {
      console.error(err);
      emptyRows();
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="8" class="py-5 text-center text-danger">Failed to load customers.</td>`;
      $rows.appendChild(tr);
    } finally {
      showLoading(false);
    }
  }

  // ===== Events =====
  $tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    $tabs.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    state.page = 1;
    fetchMembers();
  });

  let qTimer;
  $q.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      state.q = $q.value.trim();
      state.page = 1;
      fetchMembers();
    }, 250);
  });

  $prev.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      fetchMembers();
    }
  });
  $next.addEventListener('click', () => {
    const maxPage = Math.ceil(state.total / state.perPage);
    if (state.page < maxPage) {
      state.page++;
      fetchMembers();
    }
  });

  // Import/Export placeholders
  const imp = document.getElementById('btnImport');
  const exp = document.getElementById('btnExport');
  imp && imp.addEventListener('click', e => { e.preventDefault(); alert('Import CSV (to be wired)'); });
  exp && exp.addEventListener('click', e => { e.preventDefault(); alert('Export CSV (to be wired)'); });

  // ===== Init =====
  fetchMembers();

  // ===== Local mock (only used if window.API.listMembers is missing) =====
  function createLocalMock() {
    const names = [
      'Mustafa - 994406', 'Azwa - 835789', 'Masuod Alajmi - 576489', 'Ali Abdolsamad - 590639',
      'عبدالله عبدالله', 'Waleed Damra - 267305', 'mariam albachary - 301196', 'Nidaa Kullab - 698208',
      'Mayyar - 367981', '901150 - لطوفه', 'Reem - 990647'
    ];
    const dataset = Array.from({ length: 300 }).map((_, i) => {
      const nm = names[i % names.length];
      const phone = String(50000000 + Math.floor(Math.random() * 49999999));
      const orders = Math.floor(Math.random() * 12);
      const last = orders === 0 ? null : new Date(Date.now() - Math.random() * 45 * 864e5)
        .toLocaleString('en-GB', { month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const bal = Math.random() < .15 ? `-${(Math.random()*10).toFixed(2)}` : `${(Math.random()*2).toFixed(2)}`;
      return {
        id: String(i + 1),
        name: nm,
        code: `${100000 + i}`,
        phone, email: Math.random() < .5 ? '—' : `${nm.split(' ')[0].toLowerCase()}@example.com`,
        totalOrders: orders,
        lastOrderAt: last,
        balance: bal,
        blacklisted: Math.random() < .05,
        deleted: Math.random() < .02
      };
    });

    function applyFilter(arr, filter) {
      switch (filter) {
        case 'hasOrders': return arr.filter(x => (x.totalOrders || 0) > 0);
        case 'negative': return arr.filter(x => parseFloat(x.balance) < 0);
        case 'blacklisted': return arr.filter(x => x.blacklisted);
        case 'deleted': return arr.filter(x => x.deleted);
        default: return arr;
      }
    }

    return {
      async listMembers({ page = 1, perPage = 50, q = '', filter = 'all' }) {
        let arr = dataset;
        if (q) {
          const qq = q.toLowerCase();
          arr = arr.filter(x =>
            (x.name || '').toLowerCase().includes(qq) ||
            (x.phone || '').includes(qq) ||
            (x.email || '').toLowerCase().includes(qq)
          );
        }
        arr = applyFilter(arr, filter);
        const total = arr.length;
        const start = (page - 1) * perPage;
        const items = arr.slice(start, start + perPage);
        await new Promise(r => setTimeout(r, 150)); // small delay, feel real
        return { items, total, page, perPage };
      }
    };
  }
})();
