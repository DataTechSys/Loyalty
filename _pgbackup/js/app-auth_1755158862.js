/* js/app-auth.js
   RBAC/session helper. Exposes window.RBAC
*/
(function (global) {
  const LS_KEYS = {
    session: 'rbac.session.v1',
    tenant:  'rbac.tenant.v1'
  };

  function nowSec() { return Math.floor(Date.now() / 1000); }

  function loadSession() {
    try {
      const raw = localStorage.getItem(LS_KEYS.session);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Optional expiry check
      if (s && s.exp && s.exp < nowSec()) { clearSession(); return null; }
      return s;
    } catch { return null; }
  }

  function saveSession(s) {
    if (!s || typeof s !== 'object') return clearSession();
    localStorage.setItem(LS_KEYS.session, JSON.stringify(s));
  }

  function clearSession() {
    localStorage.removeItem(LS_KEYS.session);
  }

  function getTenant() {
    try { return localStorage.getItem(LS_KEYS.tenant) || null; } catch { return null; }
  }

  function setTenant(tenantId) {
    if (tenantId == null) localStorage.removeItem(LS_KEYS.tenant);
    else localStorage.setItem(LS_KEYS.tenant, String(tenantId));
  }

  const RBAC = {
    /** Return the current session or null */
    session() { return loadSession(); },

    /** Set the session object { userId, token, tenantId, exp } */
    setSession(s) { saveSession(s); },

    /** Clear session */
    clearSession() { clearSession(); },

    /** Tenant helpers */
    activeTenant() { return getTenant(); },
    setActiveTenant(tid) { setTenant(tid); },

    /** True if logged in */
    isAuthenticated() { return !!loadSession(); },

    /** Compose Authorization header or return {} */
    authHeader() {
      const s = loadSession();
      return (s && s.token) ? { 'Authorization': 'Bearer ' + s.token } : {};
    }
  };

  global.RBAC = RBAC;
})(window);
