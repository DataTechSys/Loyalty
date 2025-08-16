// Loads HTML partials into elements that have data-include="path"
// Emits a 'partials:loaded' event when done.
document.addEventListener('DOMContentLoaded', async () => {
  const slots = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(slots.map(async el => {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path, { cache: 'no-store' });
      el.innerHTML = await res.text();
    } catch (e) {
      console.error('Failed to load partial:', path, e);
      el.innerHTML = '<div class="text-danger small">Failed to load ' + path + '</div>';
    }
  }));

  // signal that partials exist in the DOM
  window.dispatchEvent(new Event('partials:loaded'));
});