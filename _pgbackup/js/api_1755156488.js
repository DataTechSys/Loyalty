(function(global){
  const isMock = (window.APP_CONFIG?.ENV || 'mock') === 'mock';
  const BASE = window.APP_CONFIG?.API_BASE_URL || '';

  async function http(path, opts={}){
    const headers = {'Content-Type':'application/json'};
    const token = (window.RBAC?.session?.()||{}).token;
    if(token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(BASE + path, { method:'GET', ...opts, headers, body: opts.body?JSON.stringify(opts.body):undefined });
    if(!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.status===204 ? null : res.json();
  }

  // MOCK IMPLEMENTATION
  const mock = {
    async login(email, password, tenantId){
      return { userId:'u1', email, token:'dev-token', tenantId };
    },
    async metrics(tid, range){
      return {
        members: 1240, redemptions: 318, campaigns: 12,
        activity: [
          {ts:'08:31', text:'Ahmed redeemed 2 KD'},
          {ts:'07:40', text:'New member: Mustafa'},
          {ts:'06:15', text:'Push sent: Weekend Promo'}
        ]
      };
    },
    async listMembers(tid, {page=1,q=''}={}){
      const base=[
        {id:'m1', name:'Mustafa', phone:'97820454', email:'-', points:120, lastVisit:'Aug 12, 07:40'},
        {id:'m2', name:'AzwA', phone:'99189684', email:'-', points:30, lastVisit:'Aug 11, 20:10'},
        {id:'m3', name:'Ali', phone:'94414403', email:'-', points:55, lastVisit:'Aug 11, 09:15'}
      ];
      const items = base.filter(x=> (x.name+x.phone).toLowerCase().includes(q.toLowerCase()));
      return { items, total: items.length };
    },
    async getMember(tid,id){ return {id, name:'Member', phone:'50000000'}; },
    async updateMember(tid,id,p){ return {ok:true}; },
    async exportMembers(tid){ alert('Export started (mock)'); },
    async listCampaigns(tid){ return [{name:'Welcome',channel:'push'},{name:'Weekend Promo',channel:'push'}]; },
    async saveCampaign(tid,p){ return {id:'c1',...p}; },
    async sendPush(tid,p){ return {ok:true}; },
    async listUsers(tid){ return [{id:'u1',name:'Owner',email:'owner@example.com',role:'owner'}]; },
    async inviteUser(tid,p){ return {ok:true}; },
    async updateUser(tid, uid, p){ return {ok:true}; }
  };

  const api = isMock ? mock : {
    login: (email,password,tenantId)=> http('/v1/auth/login',{method:'POST',body:{email,password,tenantId}}),
    metrics: (tid,range)=> http(`/v1/tenants/${tid}/metrics?range=${encodeURIComponent(range)}`),
    listMembers: (tid,q={})=> { const qs=new URLSearchParams(q).toString(); return http(`/v1/tenants/${tid}/members${qs?`?${qs}`:''}`); },
    getMember: (tid,id)=> http(`/v1/tenants/${tid}/members/${id}`),
    updateMember: (tid,id,p)=> http(`/v1/tenants/${tid}/members/${id}`,{method:'PATCH',body:p}),
    exportMembers: (tid)=> http(`/v1/tenants/${tid}/members/export`),
    listCampaigns: (tid)=> http(`/v1/tenants/${tid}/campaigns`),
    saveCampaign: (tid,p)=> http(`/v1/tenants/${tid}/campaigns`,{method:'POST',body:p}),
    sendPush: (tid,p)=> http(`/v1/tenants/${tid}/push`,{method:'POST',body:p}),
    listUsers: (tid)=> http(`/v1/tenants/${tid}/users`),
    inviteUser: (tid,p)=> http(`/v1/tenants/${tid}/invites`,{method:'POST',body:p}),
    updateUser: (tid,uid,p)=> http(`/v1/tenants/${tid}/users/${uid}`,{method:'PATCH',body:p})
  };

  global.API = api;
})(window);
