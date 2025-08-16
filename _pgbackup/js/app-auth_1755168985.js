/* global window, fetch */
(function (w) {
  'use strict';

  // Expose RBAC safe wrapper even if rbac.js hasn’t loaded for some reason
  w.RBAC = w.RBAC || { session: null, isAuthenticated: () => false };

  const { ENV, API_BASE_URL } = (w.APP_CONFIG || { ENV: 'mock', API_BASE_URL: '' });

  async function request(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = w.RBAC.session && w.RBAC.session.token;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(API_BASE_URL + path, { method: 'GET', ...opts, headers });
    if (!res.ok) throw new Error(await res.text() || res.statusText);
    return res.json();
  }

  // ---------- Mock data for local demo ----------
  const mock = {
    async login(email, password, tenantId) {
      // Accept any non-empty values in mock mode
      if (!tenantId || !email || !password) throw new Error('Missing credentials');
      return { userId: 'u1', email, token: 'dev-token', tenantId };
    },
    async metrics(range) {
      return {
        range,
        members: 1284,
        redemptions: 318,
        campaigns: 12
      };
    },
    async listMembers(term, page) {
      return {
        items: [
          { name: 'Mustafa', phone: '97828454', lastVisit: 'Aug 12, 07:40' },
          { name: 'Azwa',    phone: '99180864', lastVisit: 'Aug 10, 20:10' },
          { name: 'ALL',     phone: '94414343', lastVisit: 'Aug 11, 09:15' }
        ],
        page: page || 1
      };
    }
  };
  // ---------------------------------------------

  const API = (ENV === 'mock') ? {
    login: mock.login,
    metrics: mock.metrics,
    listMembers: mock.listMembers
  } : {
    async login(email, password, tenantId) {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, tenantId })
      });
    },
    async metrics(range) {
      return request(`/metrics?range=${encodeURIComponent(range)}`);
    },
    async listMembers(term = '', page = 1) {
      return request(`/members?term=${encodeURIComponent(term)}&page=${page}`);
    }
  };

  w.API = API;
}(window));
