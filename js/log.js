/* js/log.js
   Lightweight client-side logger with localStorage persistence, error hooks,
   CSV export helpers, and simple filtering for the logs page. */

(function () {
  const KEY = 'dt_logs';
  const MAX = 5000; // keep last N logs

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function write(rows) {
    try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-MAX))); } catch {}
    // notify other tabs / the logs page
    try { window.dispatchEvent(new CustomEvent('dt:logs:updated')); } catch {}
  }
  function nowISO() {
    const d = new Date();
    return d.toISOString();
  }
  function ctxToMeta(ctx) {
    if (!ctx) return '';
    try { return JSON.stringify(ctx); } catch { return String(ctx); }
  }

  function base(level, message, ctx) {
    const row = {
      ts: nowISO(),
      level: String(level || 'INFO').toUpperCase(),
      msg: String(message || ''),
      page: (ctx && ctx.page) || (document.title || ''),
      meta: ctx && ctx.meta ? ctx.meta : ctx // free-form
    };
    const rows = read();
    rows.push(row);
    write(rows);
    return row;
  }

  // Public API
  const Log = {
    log:   (message, ctx) => base('INFO',  message, ctx),
    info:  (message, ctx) => base('INFO',  message, ctx),
    warn:  (message, ctx) => base('WARN',  message, ctx),
    error: (message, ctx) => base('ERROR', message, ctx),
    debug: (message, ctx) => base('DEBUG', message, ctx),

    all() { return read(); },

    filter({ q='', level='', from='', to='', page='' } = {}) {
      const qx = q.trim().toLowerCase();
      const lv = level.trim().toUpperCase();
      const f  = from ? new Date(from) : null;
      const t  = to   ? new Date(to)   : null;
      const pg = page.trim().toLowerCase();

      return read().filter(r => {
        if (lv && r.level !== lv) return false;
        if (pg && String(r.page||'').toLowerCase().indexOf(pg) === -1) return false;

        const dt = new Date(r.ts);
        if (f && dt < f) return false;
        if (t && dt > t) return false;

        if (qx) {
          const hay =
            (r.msg||'') + ' ' +
            (r.level||'') + ' ' +
            (r.page||'') + ' ' +
            (typeof r.meta === 'string' ? r.meta : JSON.stringify(r.meta||''));
          if (hay.toLowerCase().indexOf(qx) === -1) return false;
        }
        return true;
      });
    },

    clear() { write([]); },

    exportCSV(rows = read()) {
      const header = ['timestamp','level','page','message','meta'];
      const lines = [header.join(',')].concat(
        rows.map(r => [
          r.ts,
          r.level,
          (r.page||''),
          (r.msg||''),
          typeof r.meta === 'string' ? r.meta : JSON.stringify(r.meta||'')
        ].map(x => `"${String(x).replace(/"/g,'""')}"`).join(','))
      );
      const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'system-logs.csv';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
  };

  // Capture runtime errors automatically
  window.addEventListener('error', (e) => {
    try {
      Log.error(e.message || 'Unhandled error', {
        page: document.title,
        meta: { file: e.filename, line: e.lineno, col: e.colno, stack: e.error?.stack }
      });
    } catch {}
  });

  window.addEventListener('unhandledrejection', (e) => {
    try {
      Log.error('Unhandled promise rejection', {
        page: document.title,
        meta: { reason: e.reason && (e.reason.message||e.reason), stack: e.reason?.stack }
      });
    } catch {}
  });

  // Expose
  window.Log = Log;

  // Optional: mark page open (comment out if not desired)
  Log.info('Page opened', { page: document.title, meta: location.pathname });
})();