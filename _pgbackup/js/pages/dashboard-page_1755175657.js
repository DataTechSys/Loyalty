/* js/pages/dashboard-page.js
   Dashboard-specific code. Assumes guards already ran.
*/
(function () {
  // Example: populate quick stats in a very simple way
  const el = (id) => document.getElementById(id);

  function renderStats() {
    // In mock, show static counts; replace with fetch to your API later
    const stats = { members: 12482, redemptions: 318, campaigns: 12 };
    if (el('stat-members'))     el('stat-members').textContent     = stats.members.toLocaleString();
    if (el('stat-redemptions')) el('stat-redemptions').textContent = stats.redemptions.toLocaleString();
    if (el('stat-campaigns'))   el('stat-campaigns').textContent   = stats.campaigns.toLocaleString();
  }

  document.addEventListener('DOMContentLoaded', renderStats);
})();
