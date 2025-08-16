// Very small RBAC/session helper stored in localStorage for demo.
// Replace with your JWT/session integration later.
(function(global){
  const KEY = 'loyalty_session';
  const TENANT_KEY = 'loyalty_active_tenant';
  const TENANTS_KEY = 'loyalty_tenants';

  function session(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch{ return null; } }
  function setSession(s){ localStorage.setItem(KEY, JSON.stringify(s||{})); }
  function logout(){ localStorage.removeItem(KEY); }

  function getTenants(){ try{ return JSON.parse(localStorage.getItem(TENANTS_KEY)||'[]'); }catch{ return []; } }
  function setTenants(arr){ localStorage.setItem(TENANTS_KEY, JSON.stringify(arr||[])); }
  function getActiveTenantId(){ return localStorage.getItem(TENANT_KEY) || (getTenants()[0]?.id || null); }
  function setActiveTenant(id){ localStorage.setItem(TENANT_KEY, id); }

  // for first run demo
  if(getTenants().length===0){
    setTenants([{id:'koobs', name:'Koobs Cafe', accountId:'K-0001'},{id:'demo', name:'Demo Bistro', accountId:'D-0002'}]);
  }

  global.RBAC = { session, setSession, logout, getTenants, setTenants, getActiveTenantId, setActiveTenant };
})(window);
