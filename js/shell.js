<script>
(function(){
  // Utility: get filename (e.g., 'admin.html')
  function fileName(pathname){ return pathname.split('/').pop() || 'index.html'; }

  async function mountShell(){
    const host = document.getElementById('app-shell');
    if(!host) return;

    // Fetch shared shell
    const res = await fetch('partials/shell.html', {cache: 'no-cache'});
    const html = await res.text();

    // Inject shell markup
    host.innerHTML = html;

    // Find the slot inside the injected shell
    const slot = host.querySelector('.page-slot');
    if(!slot){ console.warn('Shell: .page-slot not found'); return; }

    // Move the page content (the element marked with [data-page]) into the slot
    const page = document.querySelector('[data-page]');
    if(page){ slot.appendChild(page); }

    // Wire sidebar interactions
    const sidebar = host.querySelector('#sidebar');
    host.querySelector('#burger')?.addEventListener('click', ()=> sidebar.classList.toggle('open'));
    host.querySelector('#collapseBtn')?.addEventListener('click', ()=> sidebar.classList.toggle('collapsed'));

    // Close mobile sidebar when a link is clicked
    sidebar.querySelectorAll('a.sb-link').forEach(a=>{
      a.addEventListener('click', ()=> sidebar.classList.remove('open'));
    });

    // Highlight active link based on current file name
    const current = fileName(location.pathname).toLowerCase();
    sidebar.querySelectorAll('a.sb-link').forEach(a=>{
      try{
        const href = (a.getAttribute('href') || '').split('?')[0].toLowerCase();
        if(href === current){ a.classList.add('active'); }
      }catch(_){}
    });
  }

  document.addEventListener('DOMContentLoaded', mountShell);
})();
</script>