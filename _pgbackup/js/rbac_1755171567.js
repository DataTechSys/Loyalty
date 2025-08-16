// js/rbac.js
;(function (global) {
  'use strict';

  // Safe global
  var w = global || window;

  // Session storage key
  var KEY = 'rbac.session';

  // Utilities
  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch(e){ return null; }
  }
  function writeSession(s) {
    try { sessionStorage.setItem(KEY, JSON.stringify(s || null)); } catch(e){}
  }
  function clearSession() {
    try { sessionStorage.removeItem(KEY); } catch(e){}
  }

  // API
  var RBAC = {
    getSession: function(){ return readSession(); },
    setSession: function(session){ writeSession(session); return session; },
    clearSession: function(){ clearSession(); },
    isAuthenticated: function(){
      var s = readSession();
      return !!(s && s.token);
    },
    requireAuthOrRedirect: function(opts){
      opts = opts || {};
      var to = opts.to || 'login.html';
      if (!RBAC.isAuthenticated()) {
        // Remember where we wanted to go
        try { sessionStorage.setItem('redirectAfterLogin', location.pathname.replace(/\/+([^\/]*)$/, '$1')); } catch(e){}
        location.replace(to);
        return false;
      }
      return true;
    },
    logout: function(redirectTo){
      clearSession();
      location.replace(redirectTo || 'login.html');
    }
  };

  // Expose
  w.RBAC = RBAC;

})(window);
