/* js/logging.js
   Action-focused logger: no page-view noise. Persists to localStorage.
   If /api/logs exists (your Node server), it POSTs there too (best-effort). */
(function () {
  const LS_KEY = 'dt_logs';
  const MAX = 5000; // cap local history

  function nowISO() { return new Date().toISOString(); }
  function read() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  }
  function write(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(-MAX))); }

  // Attach a small API
  window.Log = {
    track(evt) {
      // Require an action to avoid “page opened”
      if (!evt || !evt.action) return;

      const session = (window.UserSession && window.UserSession.get && window.UserSession.get()) || {};
      const user = (session.user || {});
      const entry = {
        ts: nowISO(),
        action: evt.action,            // e.g. "export_orders", "create_campaign"
        target: evt.target || "",      // e.g. "orders.csv", "customers:tag=Gold"
        level:  evt.level  || "info",  // "info" | "warn" | "error" | "system"
        meta:   evt.meta   || {},      // any JSON payload (ids, counts, etc.)
        actor:  user.email || user.name || "anonymous",
        page:   (location.pathname.split('/').pop() || 'index.html')
      };

      // save locally
      const all = read(); all.push(entry); write(all);

      // best-effort ship to server (no crash if it fails)
      try {
        fetch('/api/logs', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(entry)
        }).catch(()=>{});
      } catch (_){}

      // Optional: dev hook
      if (window.__LOG_DEBUG__) console.debug('Log:', entry);
    },

    list({ from, to, q, level } = {}) {
      let arr = read();
      if (from) arr = arr.filter(r => r.ts >= from);
      if (to)   arr = arr.filter(r => r.ts <= to);
      if (level) arr = arr.filter(r => r.level === level);
      if (q) {
        const s = q.toLowerCase();
        arr = arr.filter(r =>
          (r.action||'').toLowerCase().includes(s) ||
          (r.target||'').toLowerCase().includes(s) ||
          (r.actor||'').toLowerCase().includes(s) ||
          (r.page||'').toLowerCase().includes(s)
        );
      }
      // newest first
      return arr.sort((a,b) => (a.ts < b.ts ? 1 : -1));
    },

    clear() { write([]); }
  };

  // Generic helper: log any element with data-log="action" on click/submit
  function hookAttrLogging() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-log]');
      if (!t) return;
      const action = t.getAttribute('data-log');
      const target = t.getAttribute('data-log-target') || t.textContent.trim();
      Log.track({ action, target });
    });

    document.addEventListener('submit', (e) => {
      const t = e.target.closest('[data-log]');
      if (!t) return;
      const action = t.getAttribute('data-log');
      const target = t.getAttribute('data-log-target') || (t.getAttribute('id') || 'form');
      Log.track({ action, target });
    });
  }
  document.addEventListener('DOMContentLoaded', hookAttrLogging);
})();