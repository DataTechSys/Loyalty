/* global window, sessionStorage */
(function (w) {
  'use strict';

  const KEY = 'rbac_session';

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch { return null; }
  }
  function setSession(s) {
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); }
    catch {}
  }
  function clearSession() {
    try { sessionStorage.removeItem(KEY); }
    catch {}
  }

  const RBAC = {
    session: getSession(),
    isAuthenticated() {
      return !!(this.session && this.session.token);
    },
    requireAuth() {
      if (!this.isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', location.pathname.replace(/^\//, ''));
        location.replace('login.html');
        throw new Error('Not authenticated');
      }
    },
    login(sessionObj) {
      setSession(sessionObj);
      RBAC.session = sessionObj;
    },
    logout() {
      clearSession();
      RBAC.session = null;
      location.replace('login.html');
    }
  };

  w.RBAC = RBAC;
}(window));
