/* js/include.js
   Tiny partials loader:
   - Looks for elements with data-include="partials/xxx.html"
   - Fetches and injects the HTML
   - Dispatches 'partials:ready' when sidebar & topbar are in place
   - Adds a helper to mark the active sidebar link
*/
(function(){
  function $(sel){ return document.querySelector(sel); }
  function getDir(){ return location.pathname.replace(/[^/]+$/,''); }

  async function inject(el){
    var file = el.getAttribute('data-include');
    if(!file){ return; }

    // Try a few path variants in case the page moves
    var base = getDir();
    var tries = [
      file,                 // as written (usually 'partials/x.html')
      base + file,          // same dir as page
      '/' + file.replace(/^\/+/, '') // site root
    ];
    for (var i=0;i<tries.length;i++){
      try{
        var res = await fetch(tries[i], { cache: 'no-cache' });
        if(res.ok){
          el.innerHTML = await res.text();
          return true;
        }
      }catch(e){}
    }
    el.innerHTML = '<div class="p-2 small text-danger">Failed to load <code>'+file+'</code></div>';
    return false;
  }

  function markActive(hrefOrFile){
    var here = (hrefOrFile || location.pathname.split('/').pop() || '').toLowerCase();
    var links = document.querySelectorAll('.sidebar a[href]');
    for (var i=0;i<links.length;i++){
      var href = (links[i].getAttribute('href')||'').split('/').pop().toLowerCase();
      if (href && href === here){ links[i].classList.add('active'); }
    }
  }
  window.__markActive = markActive;

  async function run(){
    var hosts = document.querySelectorAll('[data-include]');
    if(!hosts.length){ return; }

    // Inject all partials
    await Promise.all(Array.prototype.map.call(hosts, inject));

    // Optional: wire basic sidebar toggles if your sidebar has these IDs/classes
    var sidebar = document.querySelector('.sidebar');
    var burger  = document.getElementById('burger');
    var collapse= document.getElementById('collapseBtn');
    if(burger && sidebar){ burger.addEventListener('click', function(){ sidebar.classList.toggle('open'); }); }
    if(collapse && sidebar){ collapse.addEventListener('click', function(){ sidebar.classList.toggle('collapsed'); }); }

    // Notify pages they can mark active links, etc.
    document.dispatchEvent(new Event('partials:ready'));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();