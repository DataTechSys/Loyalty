/* app-auth.js
   Tiny facade around RBAC used by UI pages.
   In “mock” mode we accept any non-empty inputs.
   For live mode, swap the `mockLogin` with real API calls.
*/
(function (w) {
  const API = (w.API = w.API || {});

  function mockLogin({ tenantId, email, password }) {
    // basic client-side check
    if (!tenantId || !email || !password) {
      const err = new Error('All fields are required');
      err.code = 'VALIDATION';
      throw err;
    }
    // fake server result
    const session = {
      token: 'mock-' + Math.random().toString(36).slice(2),
      user: { id: 'u1', email },
      tenantId,
      roles: ['admin'] // or ['viewer'] etc.
    };
    return session;
  }

  API.login = async function login({ tenantId, email, password }) {
    // TODO: if you have a backend, call it here and return its result
    const session = mockLogin({ tenantId, email, password });
    // Persist into RBAC
    window.RBAC.setSession(session);
    return session;
  };

  API.logout = function logout() {
    window.RBAC.signOut();
  };

  API.getSession = function getSession() {
    return window.RBAC.getSession();
  };

  API.clearSession = function clearSession() {
    window.RBAC.signOut();
  };
})(window);
