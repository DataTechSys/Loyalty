/* app.js */
(function (w) {
  const app = (w.app = w.app || {});

  function getBase() { return location.pathname.replace(/[^/]+$/, ''); }
  function hasRBAC() { return !!(w.RBAC && typeof w.RBAC.isAuthenticated === 'function'); }
  function isAuthed() { return hasRBAC() && !!w.RBAC.isAuthenticated(); }

  app.redirectFromIndex = function redirectFromIndex(opts) {
    const base = (opts && opts.base) || getBase();
    const timeoutMs = (opts && opts.timeoutMs) || 1200;
    const onError = (opts && opts.onError) || function () {};
    let done = false;

    function go() {
      const target = isAuthed() ? 'dashboard.html' : 'login.html';
      done = true;
      location.replace(base + target);
    }

    try { go(); } catch (_) {}
    setTimeout(function () { if (!done) { try { go(); } catch (_) {} } }, 60);
    setTimeout(function () { if (!done) onError('Could not redirect (RBAC not ready).'); }, timeoutMs);
  };

  app.requireAuth = function requireAuth() {
    if (!isAuthed()) {
      location.replace(getBase() + 'login.html');
      return false;
    }
    return true;
  };

  app.signOut = function signOut() {
    try { w.API && w.API.clearSession && w.API.clearSession(); } catch (_) {}
    try { w.RBAC && w.RBAC.signOut && w.RBAC.signOut(); } catch (_) {}
    location.replace(getBase() + 'login.html');
  };
})(window);
