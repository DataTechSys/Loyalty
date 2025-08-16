// js/app.js
;(function (global) {
  'use strict';

  var w = global || window;

  function $(sel){ return document.querySelector(sel); }
  function showError(msg){
    var el = document.getElementById('err');
    if (el){ el.textContent = msg; el.hidden = false; }
    var m = document.getElementById('msg');
    if (m){ m.textContent = 'Something went wrong.'; }
  }

  // Entry used by index.html
  function bootstrapIndex(){
    try {
      // Safety timeout: if nothing happened after 2s, fallback to login
      var timer = setTimeout(function(){
        if (!w.RBAC || !w.RBAC.isAuthenticated()){
          location.replace('login.html');
        }
      }, 2000);

      if (w.RBAC && w.RBAC.isAuthenticated()) {
        clearTimeout(timer);
        location.replace('dashboard.html');
      } else {
        clearTimeout(timer);
        location.replace('login.html');
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to redirect.');
      // Last resort
      try { location.replace('login.html'); } catch(e){}
    }
  }

  // Helper for login.html to attach the sign-in behavior
  function initLoginForm(opts){
    opts = opts || {};
    var form = document.getElementById('loginForm');
    var alertBox = document.getElementById('loginAlert');

    function setAlert(text){
      if (!alertBox) return;
      if (text) { alertBox.textContent = text; alertBox.hidden = false; }
      else { alertBox.textContent = ''; alertBox.hidden = true; }
    }

    if (!form) return;

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      setAlert('');
      var btn = form.querySelector('button[type="submit"]');
      if (btn){ btn.disabled = true; btn.textContent = 'Signing in…'; }
      var tenantId = (form.querySelector('[name="tenantId"]') || {}).value || '';
      var email    = (form.querySelector('[name="email"]') || {}).value || '';
      var password = (form.querySelector('[name="password"]') || {}).value || '';

      try {
        await w.API.signInAndRedirect(tenantId, email, password);
      } catch (err) {
        console.error(err);
        setAlert(err.message || 'Unable to sign in.');
      } finally {
        if (btn){ btn.disabled = false; btn.textContent = 'Sign in'; }
      }
    });
  }

  // Auto-run only on index.html
  if (document.currentScript && /app\.js$/.test(document.currentScript.src)) {
    // crude check: if we are on index.html, boot
    if (/(^|\/)index\.html?(\?|#|$)/i.test(location.pathname)) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapIndex);
      } else {
        bootstrapIndex();
      }
    }
  }

  // Expose helpers for other pages
  w.App = { initLoginForm: initLoginForm };

})(window);
