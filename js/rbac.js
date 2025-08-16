/* rbac.js
   Minimal, robust RBAC shim used by the console.
   Stores session in sessionStorage so it survives page reloads.
*/
(function (w) {
  // Avoid reinitializing if it already exists
  if (w.RBAC && typeof w.RBAC.isAuthenticated === 'function') return;

  const KEY = 'rbac_session';

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch (_) { return null; }
  }
  function write(s) {
    try { sessionStorage.setItem(KEY, JSON.stringify(s || null)); }
    catch (_) {}
  }
  function clear() {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
  }

  const RBAC = {
    /** Get current session object or null */
    getSession: () => read(),
    /** Set/replace the session object; pass null to clear */
    setSession: (s) => write(s),
    /** Remove session and sign out */
    signOut: () => { clear(); },
    /** Boolean: is a user signed in? */
    isAuthenticated: () => !!read(),
    /** Roles: simple array helper (optional) */
    hasRole: (role) => {
      const s = read();
      return !!(s && Array.isArray(s.roles) && s.roles.includes(role));
    }
  };

  w.RBAC = RBAC;
})(window);
