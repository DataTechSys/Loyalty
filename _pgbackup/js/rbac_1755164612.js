// js/rbac.js
window.RBAC = {
  _s: null,
  _tenant: null,

  isAuthenticated() {
    return !!this._s || !!localStorage.getItem('session');
  },
  setSession(s) {
    this._s = s;
    localStorage.setItem('session', JSON.stringify(s));
  },
  session() {
    return this._s || JSON.parse(localStorage.getItem('session') || 'null');
  },
  logout() {
    this._s = null;
    localStorage.removeItem('session');
    localStorage.removeItem('tenant');
  },
  setActiveTenant(t) {
    this._tenant = t;
    localStorage.setItem('tenant', t);
  },
  activeTenant() {
    return this._tenant || localStorage.getItem('tenant');
  }
};
