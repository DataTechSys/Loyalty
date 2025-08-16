(function () {
  RBAC.requireAuth();

  const el = (id) => document.getElementById(id);
  const fmt = (n) => new Intl.NumberFormat().format(n);

  async function load() {
    try {
      // quick counts (mocked inside app.js)
      const metrics = await API.metrics('30');
      el('kpMembers').textContent = fmt(metrics.members);
      el('kpRedemptions').textContent = fmt(metrics.redemptions);
      el('kpCampaigns').textContent = fmt(metrics.campaigns);

      // recent activity (use the mocked listMembers as a stand-in feed)
      const list = await API.listMembers('', 1);
      const ul = el('activityList');
      ul.innerHTML = '';
      (list.items || []).slice(0, 6).forEach((m) => {
        const li = document.createElement('li');
        li.className = 'py-1 border-bottom';
        li.textContent = `${m.name} • last visit ${m.lastVisit}`;
        ul.appendChild(li);
      });
    } catch (err) {
      showError(err.message || 'Failed to load dashboard');
    }
  }

  document.addEventListener('DOMContentLoaded', load);
}());
