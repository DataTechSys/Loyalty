/* ============== app-auth.js (API) ==============
 * A tiny API client that exposes a uniform surface whether we
 * run in mock mode or live mode. UI code calls window.API.*
 * ===========================================================
*/
(function (w) {
  const { ENV, API_BASE_URL } = w.APP_CONFIG || { ENV: 'mock' };

  // ----- helpers -----
  async function request(path, opts = {}) {
    const sess = w.RBAC.session();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (sess?.token) headers.Authorization = `Bearer ${sess.token}`;

    const res = await fetch(API_BASE_URL.replace(/\/$/, '') + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if (!res.ok) {
      let text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }
    // Try json; fallback to text
    try { return await res.json(); } catch { return await res.text(); }
  }

  // ----- MOCK DATA -----
  const Mock = {
    async login(email, password, tenantId) {
      await new Promise(r => setTimeout(r, 400));
      if (!email || !password) throw new Error('Missing credentials');
      return { userId: 'u1', token: 'dev-token', tenantId: tenantId || 'dev-tenant' };
    },
    async logout() { await new Promise(r => setTimeout(r, 120)); return true; },
    async metrics(tenantId, range = 30) {
      await new Promise(r => setTimeout(r, 200));
      return {
        members: 1248, redemptions: 318, campaigns: 12,
        activity: [
          { ts: '08:10', text: 'Ahmed redeemed 2 KD' },
          { ts: '07:42', text: 'New Member: Mustafa' },
          { ts: '06:15', text: 'Push sent: Weekend Promo' }
        ]
      };
    },
    async listMembers(tenantId, { q = '', page = 1 } = {}) {
      await new Promise(r => setTimeout(r, 200));
      const rows = [
        { id: 'm1', name: 'Mustafa', phone: '97824544', email: '-', points: 320, lastVisit: 'Aug 12, 07:40' },
        { id: 'm2', name: 'Azwa',     phone: '99108864', email: '-', points:  80, lastVisit: 'Aug 12, 20:10' },
        { id: 'm3', name: 'ALL',      phone: '94414843', email: '-', points: 555, lastVisit: 'Aug 11, 09:15' }
      ];
      return rows.filter(r => (q ? (r.name + r.phone).toLowerCase().includes(q.toLowerCase()) : true));
    },
    async listUsers(tenantId) {
      return [
        { id: 'u1', name: 'Owner',   email: 'owner@example.com',   role: 'admin' },
        { id: 'u2', name: 'Cashier', email: 'cashier@example.com', role: 'staff' }
      ];
    },
    async listCampaigns(tenantId) {
      return [
        { id: 'c1', name: 'Weekend Promo', status: 'Sent',  sentAt: 'Aug 10 10:00' },
        { id: 'c2', name: 'Loyalty Boost', status: 'Draft', sentAt: '-' }
      ];
    },
    async companyBrand(tenantId) {
      return { name: 'Loyalty Console', logo: 'images/DataTech.png' };
    }
  };

  // ----- LIVE (real backend) -----
  const Live = {
    async login(email, password, tenantId) {
      return request('/auth/login', { method: 'POST', body: { email, password, tenantId } });
    },
    async logout() { try { await request('/auth/logout', { method: 'POST' }); } catch {} return true; },
    async metrics(tenantId, range) {
      return request(`/tenants/${encodeURIComponent(tenantId)}/metrics?range=${encodeURIComponent(range)}`);
    },
    async listMembers(tenantId, { q = '', page = 1 } = {}) {
      const qs = new URLSearchParams({ q, page }).toString();
      return request(`/tenants/${encodeURIComponent(tenantId)}/members?${qs}`);
    },
    async listUsers(tenantId) {
      return request(`/tenants/${encodeURIComponent(tenantId)}/users`);
    },
    async listCampaigns(tenantId) {
      return request(`/tenants/${encodeURIComponent(tenantId)}/campaigns`);
    },
    async companyBrand(tenantId) {
      return request(`/tenants/${encodeURIComponent(tenantId)}/brand`);
    }
  };

  // ----- public surface -----
  w.API = (ENV === 'live' ? Live : Mock);
})(window);
