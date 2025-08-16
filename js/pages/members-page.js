// js/pages/members-page.js
(function () {
  // --- Guard: require login (same behavior as dashboard) -------------------
  try {
    if (!window.RBAC || !RBAC.isAuthenticated()) {
      sessionStorage.setItem('redirectAfterLogin', 'members.html');
      location.replace('login.html');
      return;
    }
  } catch (e) { console.error(e); }

  // --- Data source: API (or mock) ------------------------------------------
  const API = (function () {
    if (window.API && typeof window.API.listMembers === 'function') {
      return { listMembers: window.API.listMembers };
    }
    // local mock
    const mock = [
      { id:'m1', name:'Mustafa - 994406', phone:'9782 0454', email:'—', orders:1, last:'Today 07:40am', balance:'KWD 0' },
      { id:'m2', name:'Azwa - 835789', phone:'9918 9684', email:'—', orders:0, last:'—', balance:'KWD 0' },
      { id:'m3', name:'Masuod Alajmi - 576489', phone:'9415 8581', email:'—', orders:1, last:'Today 05:46am', balance:'KWD 0' },
      { id:'m4', name:'Ali Abdolsamad - 590639', phone:'9441 4403', email:'—', orders:0, last:'—', balance:'KWD 0' },
      { id:'m5', name:'عبدالله عبدالله', phone:'552 59278', email:'—', orders:1, last:'Today 12:54am', balance:'KWD 0' },
      { id:'m6', name:'Waleed Damra - 267305', phone:'9987 2093', email:'—', orders:0, last:'—', balance:'KWD 0' },
      { id:'m7', name:'mariam albachary - 301196', phone:'515 15204', email:'—', orders:0, last:'—', balance:'KWD 0' },
      { id:'m8', name:'Nidaa Kullab - 698208', phone:'9097 4651', email:'—', orders:0, last:'—', balance:'KWD 0' },
      { id:'m9', name:'Mayyar - 367981', phone:'9678 6887', email:'—', orders:0, last:'—', balance:'KWD 0' },
      { id:'m10', name:'901150 - لطوفه', phone:'6573 6507', email:'—', orders:0, last:'—', balance:'KWD 0' },
    ];
    return {
      listMembers: async ({ page=1, pageSize=10, q='', filter='all' }={}) => {
        let data = mock.slice();
        // filters
        if (filter==='hasOrders') data = data.filter(x=>x.orders>0);
        if (filter==='negative') data = data.filter(x=>x.balance && /-/.test(x.balance));
        if (filter==='blacklisted') data = data.filter(()=>false); // none in mock
        if (filter==='deleted') data = data.filter(()=>false);
        // search
        if (q) {
          const needle = q.toLowerCase();
          data = data.filter(x =>
            (x.name||'').toLowerCase().includes(needle) ||
            (x.phone||'').toLowerCase().includes(needle) ||
            (x.email||'').toLowerCase().includes(needle)
          );
        }
        const total = data.length;
        const start = (page-1)*pageSize;
        const items = data.slice(start, start+pageSize);
        return { items, total, page, pageSize };
      }
    };
  })();

  // --- DOM refs -------------------------------------------------------------
  const $rows = document.getElementById('rows');
  const $loading = document.getElementById('loadingRow');
  const $q = document.getElementById('q');
  const $checkAll = document.getElementById('checkAll');
  const $showing = document.getElementById('showingText');
  const $prev = document.getElementById('btnPrev');
  const $next = document.getElementById('btnNext');
  const $tabs = document.getElementById('filterTabs');

  // --- State ----------------------------------------------------------------
  let state = {
    page: 1,
    pageSize: 10,
    q: '',
    filter: 'all',
    total: 0
  };

  // --- Helpers --------------------------------------------------------------
  function fmt(val){ return val==null || val==='-' ? '—' : val; }

  function rowHtml(m) {
    return `
      <tr>
        <td><input class="form-check-input row-check" type="checkbox" data-id="${m.id}"></td>
        <td class="name-col">
          <div class="fw-semibold">${fmt(m.name)}</div>
          <div class="sub">${fmt(m.id)}</div>
        </td>
        <td class="hide-md">${fmt(m.phone)}</td>
        <td class="hide-md">${fmt(m.email)}</td>
        <td>${fmt(m.orders)}</td>
        <td class="hide-md">${fmt(m.last)}</td>
        <td>${fmt(m.balance)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary">⋯</button>
        </td>
      </tr>
    `;
  }

  async function load() {
    $loading && ($loading.style.display = '');
    const res = await API.listMembers({
      page: state.page,
      pageSize: state.pageSize,
      q: state.q,
      filter: state.filter
    });
    state.total = res.total;

    // render
    $rows.innerHTML = res.items.map(rowHtml).join('') ||
      `<tr><td colspan="8" class="text-center text-muted py-5">No customers found</td></tr>`;

    $loading && ($loading.style.display = 'none');
    const from = res.total ? ( (state.page-1)*state.pageSize + 1 ) : 0;
    const to = Math
