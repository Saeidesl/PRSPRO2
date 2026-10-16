
(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const Api = window.PMS.Api;
  const Cache = window.PMS.Cache;

  const state = {
    roles: [],
    search: '',
    editingRoleId: null
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function errorText(error, fallback) {
    return error && error.message ? error.message : fallback;
  }

  function normalize(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.permissions)) return data.permissions;
    if (data && Array.isArray(data.roles)) return data.roles;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }

  function pid(item) {
    return String(
      item && (
        item.PermissionID ??
        item.permissionId ??
        item.permissionID ??
        item.ID ??
        item.id
      ) || ''
    ).trim();
  }

  function pname(item) {
    return item.Name || item.name ||
      item.PermissionName || item.permissionName || '-';
  }

  function pcode(item) {
    return item.Code || item.code ||
      item.PermissionCode || item.permissionCode || '-';
  }

  function pmodule(item) {
    return item.Module || item.module ||
      item.ModuleName || item.moduleName || '-';
  }

  function dateText(value) {
    if (!value) return '-';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString('fa-IR');
  }

  function statusText(value) {
    if (value === 'ACTIVE') return 'فعال';
    if (value === 'INACTIVE') return 'غیرفعال';
    return value || '-';
  }

  function notify(message) {
    if (window.PMS.Alert && window.PMS.Alert.info) {
      window.PMS.Alert.info(message);
    }
  }

  function invalidateRolePermissions(roleId) {
    if (Api.invalidate) {
      Api.invalidate('/roles/' + roleId + '/permissions');
    }
  }

  function render() {
    const loading = document.getElementById('roles-loading');
    const error = document.getElementById('roles-error');
    const container = document.getElementById('roles-table-container');
    const empty = document.getElementById('roles-empty');

    if (loading) loading.hidden = true;
    if (error) error.hidden = true;
    if (!container) return;

    const search = state.search.trim().toLowerCase();

    const roles = state.roles.filter(function (role) {
      return [
        role.ID, role.Name, role.Code, role.Status
      ].join(' ').toLowerCase().includes(search);
    });

    if (!roles.length) {
      container.hidden = true;

      if (empty) {
        empty.hidden = false;
        empty.textContent = search
          ? 'نقشی مطابق جست‌وجو پیدا نشد.'
          : 'هنوز نقشی ثبت نشده است.';
      }
      return;
    }

    if (empty) empty.hidden = true;
    container.hidden = false;

    let html = '<table class="data-table"><thead><tr>' +
      '<th>نام نقش</th><th>کد</th><th>وضعیت</th>' +
      '<th>تاریخ ایجاد</th><th>آخرین تغییر</th><th>عملیات</th>' +
      '</tr></thead><tbody>';

    roles.forEach(function (role) {
      html += '<tr>' +
        '<td>' + esc(role.Name) + '</td>' +
        '<td>' + esc(role.Code) + '</td>' +
        '<td>' + esc(statusText(role.Status)) + '</td>' +
        '<td>' + esc(dateText(role.CreatedAt)) + '</td>' +
        '<td>' + esc(dateText(role.UpdatedAt)) + '</td>' +
        '<td>' +
        '<button type="button" class="btn btn-sm btn-secondary ' +
        'role-permissions-button" data-role-id="' + esc(role.ID) +
        '">مدیریت دسترسی</button> ' +
        '<button type="button" class="btn btn-sm btn-primary ' +
        'role-edit-button" data-role-id="' + esc(role.ID) +
        '">ویرایش</button>' +
        '</td></tr>';
    });

    container.innerHTML = html + '</tbody></table>';

    container.querySelectorAll('.role-permissions-button').forEach(
      function (button) {
        button.addEventListener('click', function () {
          openPermissions(button.dataset.roleId);
        });
      }
    );

    container.querySelectorAll('.role-edit-button').forEach(
      function (button) {
        button.addEventListener('click', function () {
          openEditRole(button.dataset.roleId);
        });
      }
    );
  }

  function showError(message) {
    const loading = document.getElementById('roles-loading');
    const error = document.getElementById('roles-error');

    if (loading) loading.hidden = true;

    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  async function load() {
    const loading = document.getElementById('roles-loading');
    if (loading) loading.hidden = false;

    const cached = Cache ? Cache.get('roles') : null;

    if (cached) {
      state.roles = normalize(cached);
      render();
    }

    try {
      const response = await Api.get('/roles');
      const data = Api.extractData(response);

      state.roles = normalize(data);

      if (Cache) Cache.set('roles', data);
      render();
    } catch (error) {
      if (!cached) {
        showError(errorText(error, 'دریافت نقش‌ها ناموفق بود.'));
      }
    }
  }

  // ---------------- مدیریت دسترسی‌ها ----------------

  const styles = `
    #pms-role-modal .rp-layout {
      color:var(--text-color, #222);
      font-size:14px;
    }
    #pms-role-modal .rp-tabs {
      display:flex;
      gap:8px;
      border-bottom:1px solid #ddd;
      margin-bottom:18px;
    }
    #pms-role-modal .rp-tab {
      border:0;
      border-bottom:3px solid transparent;
      background:transparent;
      padding:12px 16px;
      cursor:pointer;
      font-weight:600;
      color:#555;
    }
    #pms-role-modal .rp-tab.active {
      color:#1769aa;
      border-bottom-color:#1769aa;
    }
    #pms-role-modal .rp-panel[hidden] {
      display:none !important;
    }
    #pms-role-modal .rp-toolbar {
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      align-items:center;
      margin-bottom:12px;
    }
    #pms-role-modal .rp-search {
      width:100%;
      max-width:360px;
      padding:10px 12px;
      border:1px solid #ccc;
      border-radius:8px;
      box-sizing:border-box;
    }
    #pms-role-modal .rp-summary {
      color:#666;
      font-size:13px;
      margin-right:auto;
    }
    #pms-role-modal .rp-list {
      border:1px solid #e1e5e9;
      border-radius:9px;
      overflow:auto;
      max-height:390px;
    }
    #pms-role-modal .rp-item {
      display:flex;
      align-items:flex-start;
      gap:10px;
      padding:12px;
      border-bottom:1px solid #edf0f2;
      cursor:pointer;
      margin:0;
    }
    #pms-role-modal .rp-item:last-child {
      border-bottom:0;
    }
    #pms-role-modal .rp-item:hover {
      background:#f7f9fb;
    }
    #pms-role-modal .rp-item input {
      margin-top:4px;
      flex-shrink:0;
    }
    #pms-role-modal .rp-item-main {
      min-width:0;
      flex:1;
    }
    #pms-role-modal .rp-item-name {
      font-weight:600;
      overflow-wrap:anywhere;
    }
    #pms-role-modal .rp-item-meta {
      color:#777;
      font-size:12px;
      margin-top:4px;
      overflow-wrap:anywhere;
    }
    #pms-role-modal .rp-actions {
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      padding-top:14px;
    }
    #pms-role-modal .rp-message {
      padding:10px 12px;
      border-radius:7px;
      margin-bottom:14px;
      background:#f1f5f9;
      color:#334155;
    }
    #pms-role-modal .rp-empty {
      padding:28px 14px;
      text-align:center;
      color:#777;
    }
    #pms-role-modal .rp-close-row {
      display:flex;
      justify-content:flex-end;
      margin-top:18px;
    }
    @media(max-width:600px) {
      #pms-role-modal {
        padding:6px !important;
      }
      #pms-role-modal .modal-content {
        max-height:96vh !important;
        padding:12px !important;
      }
      #pms-role-modal .rp-tab {
        padding:10px 8px;
        flex:1;
      }
      #pms-role-modal .rp-search {
        max-width:none;
      }
      #pms-role-modal .rp-actions .btn {
        flex:1;
      }
    }
  `;

  function injectStyles() {
    if (document.getElementById('pms-role-permission-styles')) return;

    const style = document.createElement('style');
    style.id = 'pms-role-permission-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function openPermissions(roleId) {
    if (!roleId) return;

    injectStyles();

    const old = document.getElementById('pms-role-modal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'pms-role-modal';
    modal.dataset.roleId = String(roleId);
    modal.className = 'modal-overlay';

    modal.style.cssText =
      'position:fixed;inset:0;z-index:99999;display:flex;' +
      'align-items:center;justify-content:center;padding:16px;' +
      'box-sizing:border-box;overflow-y:auto;';

    modal.innerHTML = `
      <div class="modal-content" style="
        width:100%;max-width:820px;max-height:92vh;overflow:auto;
        box-sizing:border-box;padding:22px;border-radius:12px;">

        <div class="modal-header" style="
          display:flex;align-items:center;justify-content:space-between;
          gap:12px;margin-bottom:8px;">
          <div>
            <h3 style="margin:0 0 5px;">مدیریت دسترسی‌های نقش</h3>
            <div style="font-size:13px;color:#777;">
              دسترسی‌های موردنیاز این نقش را انتخاب و مدیریت کن.
            </div>
          </div>
          <button type="button" class="modal-close"
            aria-label="بستن" style="font-size:24px;">×</button>
        </div>

        <div id="rp-message" class="rp-message" hidden
          role="status" aria-live="polite"></div>

        <div class="rp-layout">
          <div class="rp-tabs" role="tablist">
            <button type="button" class="rp-tab active"
              data-tab="assigned" role="tab" aria-selected="true">
              دسترسی‌های فعلی
            </button>
            <button type="button" class="rp-tab"
              data-tab="available" role="tab" aria-selected="false">
              افزودن دسترسی
            </button>
          </div>

          <section class="rp-panel" data-panel="assigned">
            <div class="rp-toolbar">
              <input type="search" id="rp-assigned-search"
                class="rp-search" placeholder="جستجو در دسترسی‌های فعلی...">
              <span id="rp-assigned-count" class="rp-summary"></span>
            </div>

            <div class="rp-toolbar">
              <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="rp-assigned-all">
                انتخاب همه نتایج
              </label>
            </div>

            <div id="rp-assigned-list" class="rp-list">
              <div class="rp-empty">در حال دریافت دسترسی‌ها...</div>
            </div>

            <div class="rp-actions">
              <button type="button" id="rp-delete"
                class="btn btn-danger" disabled>
                حذف انتخاب‌شده‌ها (۰)
              </button>
            </div>
          </section>

          <section class="rp-panel" data-panel="available" hidden>
            <div class="rp-toolbar">
              <input type="search" id="rp-available-search"
                class="rp-search" placeholder="جستجو در دسترسی‌های قابل افزودن...">
              <span id="rp-available-count" class="rp-summary"></span>
            </div>

            <div class="rp-toolbar">
              <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="rp-available-all">
                انتخاب همه نتایج
              </label>
            </div>

            <div id="rp-available-list" class="rp-list">
              <div class="rp-empty">در حال دریافت فهرست دسترسی‌ها...</div>
            </div>

            <div class="rp-actions">
              <button type="button" id="rp-add"
                class="btn btn-primary" disabled>
                افزودن انتخاب‌شده‌ها (۰)
              </button>
            </div>
          </section>
        </div>

        <div class="rp-close-row">
          <button type="button" class="btn btn-secondary rp-close">
            بستن
          </button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    modal.querySelectorAll('.modal-close, .rp-close').forEach(
      function (button) {
        button.addEventListener('click', function () {
          modal.remove();
        });
      }
    );

    modal.addEventListener('click', function (event) {
      if (event.target === modal) modal.remove();
    });

    modal.querySelectorAll('.rp-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        setTab(modal, tab.dataset.tab);
      });
    });

    modal.querySelector('#rp-assigned-search').addEventListener(
      'input',
      function () {
        filterList(modal, 'assigned');
      }
    );

    modal.querySelector('#rp-available-search').addEventListener(
      'input',
      function () {
        filterList(modal, 'available');
      }
    );

    modal.querySelector('#rp-assigned-all').addEventListener(
      'change',
      function () {
        selectVisible(modal, 'assigned', this.checked);
      }
    );

    modal.querySelector('#rp-available-all').addEventListener(
      'change',
      function () {
        selectVisible(modal, 'available', this.checked);
      }
    );

    modal.querySelector('#rp-add').addEventListener('click', function () {
      changePermissions(modal, 'add');
    });

    modal.querySelector('#rp-delete').addEventListener('click', function () {
      changePermissions(modal, 'delete');
    });

    loadPermissionData(modal);
  }

  function setTab(modal, name) {
    modal.querySelectorAll('.rp-tab').forEach(function (tab) {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    modal.querySelectorAll('.rp-panel').forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== name;
    });
  }

  async function loadPermissionData(modal) {
    const roleId = modal.dataset.roleId;

    try {
      const responses = await Promise.all([
        Api.get('/roles/' + encodeURIComponent(roleId) + '/permissions'),
        Api.get('/roles/available-permissions')
      ]);

      if (!modal.isConnected) return;

      const assignedRows = normalize(Api.extractData(responses[0]));
      const allPermissions = normalize(Api.extractData(responses[1]));

      const allById = new Map();
      allPermissions.forEach(function (item) {
        const id = pid(item);
        if (id) allById.set(id, item);
      });

      const assigned = assignedRows.map(function (row) {
        const id = String(
          row.PermissionID || row.permissionId ||
          row.permissionID || row.ID || row.id || ''
        ).trim();

        const details = allById.get(id);

        return details
          ? Object.assign({}, details, { ID: id, PermissionID: id })
          : {
              ID: id,
              PermissionID: id,
              Name: 'اطلاعات دسترسی پیدا نشد',
              Code: id,
              Module: '-',
              Status: 'UNKNOWN'
            };
      });

      const assignedIds = new Set(assigned.map(pid).filter(Boolean));

      const available = allPermissions.filter(function (item) {
        const id = pid(item);
        const status = String(item.Status || item.status || 'ACTIVE')
          .toUpperCase();

        return id && !assignedIds.has(id) && status === 'ACTIVE';
      });

      modal._assignedPermissions = assigned;
      modal._availablePermissions = available;

      renderPermissionList(modal, 'assigned', assigned);
      renderPermissionList(modal, 'available', available);

    } catch (error) {
      if (modal.isConnected) {
        showMessage(
          modal,
          errorText(error, 'دریافت اطلاعات دسترسی‌ها ناموفق بود.'),
          true
        );
      }
    }
  }

  function renderPermissionList(modal, type, permissions) {
    const list = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-list' : '#rp-available-list'
    );

    if (!permissions.length) {
      list.innerHTML = '<div class="rp-empty">' +
        (type === 'assigned'
          ? 'این نقش هنوز دسترسی‌ای ندارد.'
          : 'دسترسی جدیدی برای افزودن وجود ندارد.') +
        '</div>';

      updateListControls(modal, type);
      return;
    }

    list.innerHTML = permissions.map(function (item) {
      const id = pid(item);

      return `
        <label class="rp-item" data-search-text="${esc(
          [pcode(item), pname(item), pmodule(item)].join(' ').toLowerCase()
        )}">
          <input type="checkbox" class="rp-check"
            value="${esc(id)}" aria-label="انتخاب ${esc(pname(item))}">
          <span class="rp-item-main">
            <span class="rp-item-name">${esc(pname(item))}</span>
            <span class="rp-item-meta">
              کد: ${esc(pcode(item))} · ماژول: ${esc(pmodule(item))}
              ${type === 'assigned'
                ? ' · وضعیت: ' + esc(statusText(item.Status || item.status))
                : ''}
            </span>
          </span>
        </label>`;
    }).join('');

    list.querySelectorAll('.rp-check').forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
        updateListControls(modal, type);
      });
    });

    filterList(modal, type);
    updateListControls(modal, type);
  }

  function filterList(modal, type) {
    const search = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-search' : '#rp-available-search'
    ).value.trim().toLowerCase();

    const list = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-list' : '#rp-available-list'
    );

    list.querySelectorAll('.rp-item').forEach(function (label) {
      label.hidden = !!search &&
        !label.dataset.searchText.includes(search);
    });

    updateListControls(modal, type);
  }

  function selectVisible(modal, type, checked) {
    const list = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-list' : '#rp-available-list'
    );

    list.querySelectorAll('.rp-item').forEach(function (label) {
      if (label.hidden) return;

      const checkbox = label.querySelector('.rp-check');
      if (checkbox) checkbox.checked = checked;
    });

    updateListControls(modal, type);
  }

  function updateListControls(modal, type) {
    const list = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-list' : '#rp-available-list'
    );

    const labels = Array.from(list.querySelectorAll('.rp-item')).filter(
      function (label) {
        return !label.hidden;
      }
    );

    const selected = labels.filter(function (label) {
      const checkbox = label.querySelector('.rp-check');
      return checkbox && checkbox.checked;
    }).length;

    const total = type === 'assigned'
      ? (modal._assignedPermissions || []).length
      : (modal._availablePermissions || []).length;

    const count = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-count' : '#rp-available-count'
    );

    if (count) {
      count.textContent = selected
        ? total + ' مورد · ' + selected + ' انتخاب‌شده'
        : total + ' دسترسی';
    }

    const selectAll = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-all' : '#rp-available-all'
    );

    if (selectAll) {
      selectAll.checked = labels.length > 0 && selected === labels.length;
      selectAll.indeterminate = selected > 0 && selected < labels.length;
      selectAll.disabled = labels.length === 0;
    }

    const action = modal.querySelector(
      type === 'assigned' ? '#rp-delete' : '#rp-add'
    );

    if (action) {
      action.disabled = selected === 0 || modal._busy === true;
      action.textContent = type === 'assigned'
        ? 'حذف انتخاب‌شده‌ها (' + selected + ')'
        : 'افزودن انتخاب‌شده‌ها (' + selected + ')';
    }
  }

  function showMessage(modal, message, isError) {
    const box = modal.querySelector('#rp-message');
    if (!box) return;

    box.textContent = message;
    box.hidden = false;
    box.classList.add('alert');
    box.classList.toggle('alert-danger', Boolean(isError));
    box.classList.toggle('alert-success', !isError);
  }

  function setBusy(modal, busy) {
    modal._busy = busy;

    modal.querySelectorAll(
      '.rp-tab, .rp-search, .rp-panel input, .rp-actions button'
    ).forEach(function (element) {
      element.disabled = busy;
    });

    if (!busy) {
      updateListControls(modal, 'assigned');
      updateListControls(modal, 'available');
    }
  }

  async function changePermissions(modal, operation) {
    if (!modal || !modal.isConnected || modal._busy) return;

    const roleId = modal.dataset.roleId;
    const type = operation === 'add' ? 'available' : 'assigned';

    const list = modal.querySelector(
      type === 'assigned' ? '#rp-assigned-list' : '#rp-available-list'
    );

    const ids = Array.from(list.querySelectorAll('.rp-check:checked'))
      .map(function (checkbox) {
        return checkbox.value;
      })
      .filter(Boolean);

    if (!ids.length) return;

    const actionName = operation === 'add' ? 'افزودن' : 'حذف';

    if (!window.confirm(
      'آیا از ' + actionName + ' ' + ids.length +
      ' دسترسی انتخاب‌شده مطمئن هستی؟'
    )) {
      return;
    }

    setBusy(modal, true);
    showMessage(modal, 'در حال ' + actionName + ' دسترسی‌ها...', false);

    try {
      let response;

      if (operation === 'add') {
        response = await Api.post(
          '/roles/' + encodeURIComponent(roleId) + '/permissions/bulk',
          { permissionIds: ids }
        );
      } else {
        response = await Api.post(
          '/roles/' + encodeURIComponent(roleId) +
          '/permissions/bulk-remove',
          { permissionIds: ids }
        );
      }

      invalidateRolePermissions(roleId);

      const result = Api.extractData(response) || {};

      const successCount = Number(
        operation === 'add'
          ? (result.createdCount ?? result.addedCount ?? result.successCount ?? ids.length)
          : (result.deletedCount ?? result.removedCount ?? result.successCount ?? ids.length)
      );

      const skipped = Number(result.skippedCount || 0);
      const invalid = Number(
        result.invalidCount ?? result.failedCount ?? 0
      );

      await loadPermissionData(modal);

      if (!modal.isConnected) return;

      let summary = actionName + ' انجام شد: ' + successCount + ' مورد موفق.';

      if (skipped) summary += ' تکراری یا ردشده: ' + skipped + ' مورد.';
      if (invalid) summary += ' ناموفق یا نامعتبر: ' + invalid + ' مورد.';

      showMessage(modal, summary, invalid > 0);
      setBusy(modal, false);

    } catch (error) {
      showMessage(
        modal,
        errorText(error, actionName + ' دسترسی‌ها ناموفق بود.'),
        true
      );

      setBusy(modal, false);
    }
  }

  // ---------------- ایجاد و ویرایش نقش ----------------

  function openCreateRole() {
    state.editingRoleId = null;

    openRoleForm({
      Name: '',
      Code: '',
      Status: 'ACTIVE'
    }, false);
  }

  function openEditRole(roleId) {
    const role = state.roles.find(function (item) {
      return String(item.ID) === String(roleId);
    });

    if (!role) {
      showError('اطلاعات نقش موردنظر پیدا نشد.');
      return;
    }

    state.editingRoleId = role.ID;
    openRoleForm(role, true);
  }

  function openRoleForm(role, isEdit) {
    const content = `
      <form id="role-form">
        <div class="form-group">
          <label for="role-name">نام نقش *</label>
          <input class="form-control" id="role-name" name="Name"
            type="text" required maxlength="150"
            value="${esc(role.Name || '')}">
        </div>

        <div class="form-group">
          <label for="role-code">کد نقش *</label>
          <input class="form-control" id="role-code" name="Code"
            type="text" required maxlength="50"
            value="${esc(role.Code || '')}">
        </div>

        <div class="form-group">
          <label for="role-status">وضعیت</label>
          <select class="form-control" id="role-status" name="Status">
            <option value="ACTIVE" ${role.Status === 'ACTIVE' ? 'selected' : ''}>
              فعال
            </option>
            <option value="INACTIVE" ${role.Status === 'INACTIVE' ? 'selected' : ''}>
              غیرفعال
            </option>
          </select>
        </div>

        <div id="role-form-error" class="form-error" hidden></div>
      </form>`;

    window.PMS.Modal.open({
      id: 'role-form-modal',
      title: isEdit ? 'ویرایش نقش' : 'ایجاد نقش جدید',
      content: content,
      footer: `
        <button type="button" class="btn btn-secondary"
          id="role-cancel-button">انصراف</button>
        <button type="button" class="btn btn-primary"
          id="role-save-button">${isEdit ? 'ذخیره تغییرات' : 'ثبت نقش'}</button>
      `,
      onOpen: function () {
        const modal = document.getElementById('role-form-modal');
        if (!modal) return;

        modal.querySelector('#role-cancel-button').addEventListener(
          'click',
          function () {
            state.editingRoleId = null;
            window.PMS.Modal.close('role-form-modal');
          }
        );

        modal.querySelector('#role-save-button').addEventListener(
          'click',
          saveRole
        );
      }
    });
  }

  async function saveRole() {
    const form = document.getElementById('role-form');
    const errorBox = document.getElementById('role-form-error');
    const saveButton = document.getElementById('role-save-button');

    if (!form || !form.reportValidity()) return;

    const data = {
      Name: form.elements.Name.value.trim(),
      Code: form.elements.Code.value.trim().toUpperCase(),
      Status: form.elements.Status.value
    };

    if (!data.Name || !data.Code) {
      errorBox.textContent = 'نام و کد نقش الزامی هستند.';
      errorBox.hidden = false;
      return;
    }

    const isEdit = state.editingRoleId !== null;
    const roleId = state.editingRoleId;

    saveButton.disabled = true;
    saveButton.textContent = 'در حال ذخیره...';

    try {
      if (isEdit) {
        await Api.put('/roles/' + encodeURIComponent(roleId), data);
      } else {
        await Api.post('/roles', data);
      }

      if (Api.invalidate) {
        Api.invalidate('roles');
        Api.invalidate('/roles');
      }

      state.editingRoleId = null;
      window.PMS.Modal.close('role-form-modal');

      notify(isEdit ? 'نقش ویرایش شد.' : 'نقش جدید ثبت شد.');
      await load();

    } catch (error) {
      errorBox.textContent = errorText(error, 'ذخیره نقش ناموفق بود.');
      errorBox.hidden = false;

    } finally {
      if (saveButton.isConnected) {
        saveButton.disabled = false;
        saveButton.textContent = isEdit ? 'ذخیره تغییرات' : 'ثبت نقش';
      }
    }
  }

  function init() {
    const search = document.getElementById('role-search');

    if (search) {
      search.addEventListener('input', function () {
        state.search = search.value || '';
        render();
      });
    }

    const createButton = document.getElementById('role-create-button');

    if (createButton) {
      createButton.addEventListener('click', openCreateRole);
    }

    load();
  }

  window.PMS.Roles = {
    init: init,
    load: load,
    render: render
  };

  window.PMS.Modules.Roles = window.PMS.Roles;

})();
