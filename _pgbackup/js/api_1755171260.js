/* js/api.js
   window.API with login + dashboard & member endpoints.
   Uses APP_CONFIG.ENV === 'mock' to return fake data.
*/
(function (global) {
  const cfg   = global.APP_CONFIG || { ENV: 'mock', API_BASE_URL: '' };
  const isMock = (cfg.ENV === 'mock');
  const BASE  = cfg.API_BASE_URL || '';

  async function http(path, { method = 'GET', headers = {}, body } = {}) {
    // Attach auth header from RBAC
    const auth = (global.RBAC && RBAC.authHeader) ? RBAC.authHeader() : {};
    const res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...auth,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || res.statusText || 'Request failed');
    }
    // Try JSON, fallback to text
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  }

  // -----------------------------
  // MOCKS
  // -----------------------------
  function mockToken() {
    // exp claim ~ now + SESSION_TTL
    const exp = Math.floor(Date.now()/1000) + (cfg.SESSION_TTL_SEC || 28800);
    return { userId: 'u1', token: 'dev-token', tenantId: RBAC.activeTenant() || 'tenant-demo', exp };
  }

  const MOCK = {
    async login(email, password, tenantId) {
      // simple check; in real life you'd verify server side
      if (!email || !password || !tenantId) throw new Error('Missing credentials');
      // set tenant so subsequent mocks can read it
      RBAC.setActiveTenant(tenantId);
      return mockToken();
    },

    async metrics(range='30d') {
      // tiny deterministic fake set
      return {
        range,
        members: 1284,
        redemptions: 318,
        campaigns: 12,
        activity: [
          { ts:'09:10', text:'Ahmed redeemed 2 KD' },
          { ts:'07:40', text:'New member: Mustafa' },
          { ts:'07:05', text:'Push sent: Weekend Promo' },
        ]
      };
    },

    async listMembers(q = {}, page = 1) {
      const items = [
        { id:'m1', name:'Mustafa',  phone:'97828454', email:'-', points:120, lastVisit:'Aug 12, 07:40' },
        { id:'m2', name:'Azwa',     phone:'99108984', email:'-', points:380, lastVisit:'Aug 12, 20:18' },
        { id:'m3', name:'ALL',      phone:'94414843', email:'-', points:55,  lastVisit:'Aug 11, 09:15' }
      ];
      return { page, pageSize: items.length, total: 3, items };
    },

    async recentActivity() {
      return [
        { id:1, when:'2m',  text:'Issued pass for 99108984' },
        { id:2, when:'6m',  text:'Redeemed offer at AHB | Abu Halifa' },
        { id:3, when:'10m', text:'Push “Weekend Promo” sent (412 targets)'}
      ];
    }
  };

  // -----------------------------
  // LIVE BACKEND
  // -----------------------------
  const LIVE = {
    async login(email, password, tenantId) {
      const data = await http('/auth/login', { method:'POST', body:{ email, password, tenantId }});
      // expected: { userId, token, tenantId, exp } from server
      if (!data || !data.token) throw new Error('Invalid login response');
      return data;
    },

    async metrics(range='30d') {
      return http(`/metrics?range=${encodeURIComponent(range)}`);
    },

    async listMembers(q={}, page=1) {
      const qs = new URLSearchParams({ page, ...q }).toString();
      return http(`/members?${qs}`);
    },

    async recentActivity() {
      return http('/activity/recent');
    }
  };

  // Facade chooses MOCK or LIVE
  const IMPL = isMock ? MOCK : LIVE;

  const API = {
    // Auth
    async login(email, password, tenantId) {
      const session = await IMPL.login(email, password, tenantId);
      // Caller (login.html) will RBAC.setSession(session)
      return session;
    },
    // Data
    metrics:       (...a)=>IMPL.metrics(...a),
    listMembers:   (...a)=>IMPL.listMembers(...a),
    recentActivity:(...a)=>IMPL.recentActivity(...a),

    // Convenience: logout
    logout() {
      if (global.RBAC) RBAC.clearSession();
    }
  };

  global.API = API;
})(window);
