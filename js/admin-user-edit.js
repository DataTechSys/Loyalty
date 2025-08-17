/* js/admin-user-edit.js
   Lightweight editor that plugs into admin.js data (USERS, ROLES) and UI (renderUsers()).
   No changes to admin.js required.
*/
(function () {
  // Wait until the page has its Users table rendered at least once.
  const usersBody = document.getElementById('usersBody');
  if (!usersBody) return;

  // Fill the Roles multiselect from global ROLES (provided by js/admin.js)
  function fillRolesSelect() {
    const sel = document.getElementById('euRoles');
    if (!sel) return;
    sel.innerHTML = (window.ROLES || []).map(r =>
      `<option value="${r.name}">${r.name}</option>`
    ).join('');
  }

  // Open modal and hydrate form with USERS[idx]
  function openEditor(idx) {
    if (!window.USERS || !window.USERS[idx]) return;

    const u = window.USERS[idx];
    document.getElementById('euIndex').value = String(idx);
    document.getElementById('euName').value = u.name || '';
    document.getElementById('euEmail').value = u.email || '';
    document.getElementById('euConsole').value = (u.console || 'Inactive');
    document.getElementById('euApp').value = (u.app || 'Inactive');

    // Preselect roles
    const sel = document.getElementById('euRoles');
    [...sel.options].forEach(opt => {
      opt.selected = (u.roles || []).includes(opt.value);
    });

    document.getElementById('euSaved').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('editUserModal')).show();
  }

  // Save handler -> updates USERS[idx] then calls renderUsers() (from js/admin.js)
  document.getElementById('editUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const idx = parseInt(document.getElementById('euIndex').value, 10);
    if (!window.USERS || !window.USERS[idx]) return;

    const name = document.getElementById('euName').value.trim();
    const email = document.getElementById('euEmail').value.trim();
    const consoleAccess = document.getElementById('euConsole').value;
    const appAccess = document.getElementById('euApp').value;

    const roles = [...document.getElementById('euRoles').options]
      .filter(o => o.selected)
      .map(o => o.value);

    // Update the in-memory record
    window.USERS[idx] = {
      ...window.USERS[idx],
      name,
      email,
      console: consoleAccess,
      app: appAccess,
      roles
    };

    // Re-render the table using the function provided by js/admin.js
    if (typeof window.renderUsers === 'function') {
      window.renderUsers();
    }

    const ok = document.getElementById('euSaved');
    ok.classList.remove('d-none');
    setTimeout(() => {
      ok.classList.add('d-none');
      bootstrap.Modal.getInstance(document.getElementById('editUserModal'))?.hide();
    }, 800);
  });

  // Delegate clicks on "Edit" buttons inside the existing #usersBody table
  usersBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // Be forgiving: accept either data-action="edit" OR a button labeled "Edit"
    const isEdit = btn.getAttribute('data-action') === 'edit' ||
                   btn.textContent.trim().toLowerCase() === 'edit';
    if (!isEdit) return;

    // Find the row index in the <tbody> to map back to USERS[]
    const tr = btn.closest('tr');
    if (!tr) return;
    const idx = [...tr.parentNode.children].indexOf(tr);
    openEditor(idx);
  });

  // After the page first loads and whenever you re-render users, we want roles select ready.
  // Fill once now:
  fillRolesSelect();

  // Optional: If your admin.js exposes a hook after renderUsers, you could call fillRolesSelect() there too.
})();