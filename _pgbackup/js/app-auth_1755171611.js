// js/app-auth.js
;(function (global) {
  'use strict';

  var w = global || window;

  // Read config with safe fallbacks
  var CFG = w.APP_CONFIG || {};
  var ENV = (CFG.ENV || 'mock').toLowerCase();          // 'mock' or 'live'
  var API_BASE = (CFG.API_BASE_URL || '').replace(/\/+$/,''); // e.g. 'https://api.example.com'

  // --- Tiny fetch helper (handles BASE + JSON) ---
  async function apiFetch(path, opts){
    var url = API_BASE ? (API_BASE + path) : path;
    var o = Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {});
    // add token if we have one
    try {
      var s = w.RBAC && w.RBAC.getSession();
      if (s && s.token) { o.headers.Authorization = 'Bearer ' + s.token; }
    } catch(e){}
    var res = await fetch(url, o);
    var text = await res.text();
    var data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      var err = new Error((data && data.message) || res.statusText || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // --- Auth API (mock + live) ---
  async function login(tenantId, email, password){
    if (ENV === 'mock') {
      // fake delay
      await new Promise(r => setTimeout(r, 300));
      var mockUser = { id: 'u1', name: 'Demo User', email: email || 'demo@datatech.local', tenantId: tenantId || 'demo' };
      return { token: 'mock-' + Math.random().toString(36).slice(2), user: mockUser };
    }
    // LIVE
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ tenantId: tenantId, email: email, password: password })
    });
  }

  async function me(){
    if (ENV === 'mock') {
      var s = w.RBAC.getSession();
      return s && s.user ? s.user : null;
    }
    return apiFetch('/auth/me', { method: 'GET' });
  }

  function logout(){
    w.RBAC.clearSession();
    // If you have a revoke endpoint, call it here.
  }

  // --- High-level helpers used by pages ---
  async function signInAndRedirect(tenantId, email, password){
    var auth = await login(tenantId, email, password);
    w.RBAC.setSession({ token: auth.token, user: auth.user });
    var redirect = null;
    try { redirect = sessionStorage.getItem('redirectAfterLogin'); } catch(e){}
    if (!redirect || redirect === 'login.html') redirect = 'dashboard.html';
    location.replace(redirect);
  }

  // Expose
  w.API = {
    login, me, logout, signInAndRedirect,
    cfg: { ENV: ENV, API_BASE: API_BASE }
  };

})(window);
