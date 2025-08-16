/* global window, document, API, RBAC, showError */
(function () {
  'use strict';

  if (!window.RBAC) {
    console.error('RBAC missing (rbac.js not loaded?)');
    location.replace('login.html');
    return;
  }

  RBAC.requireAuth();

  const el = (id) => document.getElementById(id);
  const fmt = (n) => new Intl.NumberFormat().format(n);

  async function load(range) {
    try {
      const metrics = await API.metrics(range);
      el('kpMembers').textContent = fmt(metrics.members);
      el('kpRedemptions').textContent = fmt(metrics.redemptions);
      el('kpCampaigns').textContent = fmt(metrics.campaigns);

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

  document.addEventListener('DOMContentLoaded', () => {
    const range = (el('rangeSelect') && el('rangeSelect').value) || '30';
    load(range);

    const rs = el('rangeSelect');
    if (rs) {
      rs.addEventListener('change', () => load(rs.value));
    }
  });
}());
