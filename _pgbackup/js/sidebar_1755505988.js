function wireSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const burger = document.getElementById('burger');
  const collapseBtn = document.getElementById('collapseBtn');

  burger?.addEventListener('click', () => sidebar.classList.toggle('open'));
  collapseBtn?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  // Close mobile sidebar on any nav click
  sidebar.querySelectorAll('a.sb-link')
    .forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));

  // Expand/collapse grouped parents (the ones with a chevron)
  sidebar.addEventListener('click', (e) => {
    const t = e.target.closest('.sb-toggle');
    if (!t) return;

    const parent = t.closest('.sb-parent');

    // close all siblings first
    sidebar.querySelectorAll('.sb-parent.open').forEach(el => {
      if (el !== parent) el.classList.remove('open');
    });

    // then toggle the clicked one
    parent?.classList.toggle('open');
    e.preventDefault();
  });
}