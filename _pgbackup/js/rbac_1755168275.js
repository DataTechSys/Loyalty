/* ============== rbac.js ==============
 * Ultra-light auth/session shim used by all pages.
 * Persists session and active tenant in localStorage.
 * =====================================
*/
(function (w) {
  const LS_SESSION = 'session';
  const LS_TENANT  = 'tenant';
  const RBAC = {
    _s: null,
    _tenant: null,

    isAuthenticated() {
      return !!this._s || !!localStorage.getItem(LS_SESSION);
    },

    setSession(s) {
      this._s = s;
      localStorage.setItem(LS_SESSION, JSON.stringify(s));
    },

    session() {
      if (this._s) return this._s;
      const raw = localStorage.getItem(LS_SESSION);
      return raw ? (this._s = JSON.parse(raw)) : null;
    },

    logout() {
      this._s = null;
      localStorage.removeItem(LS_SESSION);
      localStorage.removeItem(LS_TENANT);
    },

    setActiveTenant(t) {
      this._tenant = t;
      localStorage.setItem(LS_TENANT, t);
    },

    activeTenant() {
      if (this._tenant) return this._tenant;
      const t = localStorage.getItem(LS_TENANT);
      this._tenant = t || null;
      return this._tenant;
    }
  };

  w.RBAC = RBAC;
})(window);
