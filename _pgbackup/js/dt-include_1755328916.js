// Loads HTML partials into any element with data-include="path"
document.addEventListener('DOMContentLoaded', async () => {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(slots).map(async el => {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path, { cache: 'no-store' });
      el.innerHTML = await res.text();
    } catch {
      el.innerHTML = '<div class="text-danger small">Failed to load ' + path + '</div>';
    }
  }));
});