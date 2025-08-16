// js/pages/dashboard-page.js
(function () {
  // Guard: must be signed in
  try {
    if (!window.RBAC || !RBAC.isAuthenticated()) {
      sessionStorage.setItem('redirectAfterLogin', 'dashboard.html');
      location.replace('login.html');
      return;
    }
  } catch {
    location.replace('login.html'); return;
  }

  const $ = (s) => document.querySelector(s);
  const rangeSel = $('#range');
  const outMembers = $('#kpiMembers');
  const outMembersHint = $('#kpiMembersHint');
  const outRedemptions = $('#kpiRedemptions');
  const outCampaigns = $('#kpiCampaigns');
  const tbody = $('#activityTbody');
  const btnLogout = $('#btnLogout');

  // Populate UI with data
  async function load(rangeDays) {
    try {
      // Fallback to mock if API.* not wired to backend yet (app-auth.js provides mock)
      const metrics = await (window.API?.metrics ? API.metrics(rangeDays) : Promise.resolve({
        members: 12482, redemptions: 318, campaigns: 12
      }));
      const activity = await (window.API?.activity ? API.activity(rangeDays) : Promise.resolve([
        { when: 'Today 09:45', type: 'Redeemed', detail: 'Order #1765956, 200 pts' },
        { when: 'Today 08:33', type: 'Member', detail: 'New signup: Mustafa' },
        { when: 'Yesterday',   type: 'Campaign', detail: 'Weekend Promo sent (3,140 recipients)' },
      ]));

      outMembers.textContent = Number(metrics.members).toLocaleString();
      outMembersHint.textContent = 'Total enrolled';
      outRedemptions.textContent = Number(metrics.redemptions).toLocaleString();
      outCampaigns.textContent = Number(metrics.campaigns).toLocaleString();

      if (!Array.isArray(activity) || activity.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center muted py-4">No recent activity</td></tr>`;
      } else {
        tbody.innerHTML = activity.map(row => `
          <tr>
            <td class="text-nowrap">${row.when}</td>
            <td class="text-nowrap"><span class="badge text-bg-light">${row.type}</span></td>
            <td>${row.detail}</td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="3" class="text-danger py-4">Failed to load data.</td></tr>`;
    }
  }

  // Range change
  rangeSel?.addEventListener('change', () => load(Number(rangeSel.value || 30)));

  // Logout
  btnLogout?.addEventListener('click', () => {
    try { window.RBAC?.clear(); } catch {}
    location.replace('login.html');
  });

  // Initial load
  load(Number(rangeSel?.value || 30));
})();
