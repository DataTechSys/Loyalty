/* ================================================
   DataTech Console – App Bootstrap & Auth (Standalone)
   ------------------------------------------------
   - Works in MOCK mode by default (no backend)
   - To go LIVE: set ENV:'live' and set BASE_URL below
   - Saves session in sessionStorage under DT_SESSION
   - Redirects to dashboard.html on success
   ================================================ */

/* ---------- Config (edit for LIVE) ---------- */
window.APP_CONFIG = window.APP_CONFIG || {
  ENV: 'mock',            // 'mock' | 'live'
  BASE_URL: '',           // e.g. 'https://api.yourdomain.com'
  REDIRECT_AFTER_LOGIN: 'dashboard.html',
  SESSION_KEY: 'DT_SESSION'
};

/* ---------- Tiny helpers ---------- */
const Session = {
  get() {
    try { return JSON.parse(sessionStorage.getItem(APP_CONFIG.SESSION_KEY) || 'null'); }
    catch { return null; }
  },
  set(payload) {
    try { sessionStorage.setItem(APP_CONFIG.SESSION_KEY, JSON.stringify(payload)); } catch {}
  },
  clear() {
    try { sessionStorage.removeItem(APP_CONFIG.SESSION_KEY); } catch {}
  }
};

function $(sel) { return document.querySelector(sel); }
function showError(msg) {
  const box = $('#errorBox');
  box.textContent = msg;
  box.classList.remove('d-none');
}
function hideError() {
  const box = $('#errorBox');
  box.classList.add('d-none');
  box.textContent = '';
}

/* ---------- API (mock + live) ---------- */
async function apiLogin({ tenantId, email, password }) {
  if (APP_CONFIG.ENV === 'mock') {
    // Simulate latency
    await new Promise(r => setTimeout(r, 600));

    if (!tenantId || !email || !password) {
      const e = new Error('All fields are required.'); e.status = 400; throw e;
    }
    // Very simple fake check
    if (password.length < 4) {
      const e = new Error('Invalid credentials.'); e.status = 401; throw e;
    }
    // Return mock token + user
    return {
      token: 'mock-' + Math.random().toString(36).slice(2),
      user: { id: 'u1', name: 'Demo User', email },
      company: { id: tenantId, name: tenantId.toUpperCase() }
    };
  }

  // LIVE
  const url = (APP_CONFIG.BASE_URL || '').replace(/\/+$/,'') + '/auth/login';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ tenantId, email, password })
  });
  if (!res.ok) {
    let msg = 'Unable to sign in.';
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    const e = new Error(msg); e.status = res.status; throw e;
  }
  return res.json();
}

/* ---------- Guard: redirect if already logged in ---------- */
(function autoRedirectIfLoggedIn() {
  // Only run on login.html
  const isLogin = /\/login\.html(\?|#|$)/i.test(location.pathname) || location.pathname.endsWith('/login.html');
  if (!isLogin) return;

  const s = Session.get();
  if (s && s.token) {
    location.replace(APP_CONFIG.REDIRECT_AFTER_LOGIN);
  }
})();

/* ---------- Wire up the login form ---------- */
(function initLogin() {
  const form = $('#loginForm');
  if (!form) return; // Not on login page

  const btn = $('#submitBtn');
  const tenantEl = $('#tenantId');
  const emailEl = $('#email');
  const passEl = $('#password');

  // Optional: prefill in mock mode
  if (APP_CONFIG.ENV === 'mock') {
    tenantEl.value = tenantEl.value || 'koobs';
    emailEl.value  = emailEl.value  || 'you@example.com';
    passEl.value   = passEl.value   || 'demo1234';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const tenantId = tenantEl.value.trim();
    const email    = emailEl.value.trim();
    const password = passEl.value;

    if (!tenantId || !email || !password) {
      showError('Please fill in all fields.');
      return;
    }

    btn.disabled = true;
    btn.innerText = 'Signing in…';
    try {
      const session = await apiLogin({ tenantId, email, password });
      Session.set(session);
      location.replace(APP_CONFIG.REDIRECT_AFTER_LOGIN);
    } catch (err) {
      showError(err.message || 'Unable to sign in.');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Sign in';
    }
  });
})();

/* ---------- (Optional) global logout helper ---------- */
window.DT = window.DT || {};
window.DT.logout = function () {
  Session.clear();
  location.replace('login.html');
};
