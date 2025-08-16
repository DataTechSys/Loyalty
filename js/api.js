/* app.js
   App bootstrap + safe redirect helpers.
   This file does NOT call any backend; it only decides where to send the user.
*/
(function (w) {
  const app = (w.app = w.app || {});

  // Small helpers
  function getBase() {
    return location.pathname.replace(/[^/]+$/, '');
  }
  function safe(fn, onError) {
    try { return fn(); } catch (e) { console.error(e); onError && onError(e); }
  }

  // ---- RBAC helpers (tolerant if rbac.js/app-auth.js didn’t load) ----
  function hasRBAC() {
    return !!(w.RBAC && typeof w.RBAC.isAuthenticated === 'function');
  }
  function isAuthed() {
    return hasRBAC() && !!w.RBAC.isAuthenticated();
  }

  // Decide landing target
  function targetAfterIndex() {
    return isAuthed() ? 'dashboard.html' : 'login.html';
  }

  // Public: used by index.html
  app.redirectFromIndex = function redirectFromIndex(opts) {
    const base = (opts && opts.base) || getBase();
    const timeoutMs = (opts && opts.timeoutMs) || 1200;
    const onError = (opts && opts.onError) || function () {};

    // Try immediately; if RBAC hasn’t finished loading, try again shortly.
    let done = false;

    function tryGo(stage) {
      if (done) return;
      safe(function () {
        const t = targetAfterIndex(); // this calls RBAC.isAuthenticated when available
        if (t) {
          done = true;
          location.replace(base + t);
        } else {
          throw new Error('No target determined');
        }
      }, function (err) {
        console.debug('[index redirect]', stage, err && err.message);
      });
    }

    // First attempt
    tryGo('first');

    // Second attempt after micro wait (RBAC/script race conditions)
    setTimeout(function () { tryGo('retry'); }, 60);

    // Final timeout -> show manual links via onError()
    setTimeout(function () {
      if (!done) onError('Could not redirect (RBAC not ready).');
    }, timeoutMs);
  };

  // Convenience APIs other pages may use
  app.requireAuth = function requireAuth() {
    // Redirect to login if not authenticated
    if (!isAuthed()) {
      // Remember page to return to after login if you want:
      // sessionStorage.setItem('redirectAfterLogin', location.pathname);
      location.replace(getBase() + 'login.html');
      return false;
    }
    return true;
  };

  app.signOut = function signOut() {
    if (w.API && typeof w.API.clearSession === 'function') {
      try { w.API.clearSession(); } catch (_) {}
    }
    if (w.RBAC && typeof w.RBAC.signOut === 'function') {
      try { w.RBAC.signOut(); } catch (_) {}
    }
    location.replace(getBase() + 'login.html');
  };

})(window);
