
(function () {
  'use strict';

  const PMS = window.PMS = window.PMS || {};
  const state = {
    items: [],
    search: '',
    saving: false,
    requestId: 0
  };

  function init() {
    const search = document.getElementById('project-status-search');
    const create = document.getElementById('project-status-create');

    if (!search || search.dataset.bound) return;
    search.dataset.bound = 'true';

    search.addEventListener('input', function () {
      state.search = this.value.trim().toLowerCase();
      render();
    });

    if (create && !create.dataset.bound) {
      create.dataset.bound = 'true';
      create.addEventListener('click', function () {
        showEditor();
      });
    }

    load();
  }

  function normalize(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.statuses)) return data.statuses;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }

  function val(item, upper, lower) {
    return item && (item[upper] != null ? item[upper] : item[lower]);
  }

  function id(item) {
    return String(val(item, 'ID', 'id') || '');
  }

  function name(item) {
    return String(val(item, 'Name', 'name') || '');
  }

  function status(item) {
    return String(val(item, 'Status', 'status') || 'ACTIVE').toUpperCase();
  }

  async function load() {
    const requestId = ++state.requestId;
    visible('project-status-loading', true);
    visible('project-status-error', false);

    try {
      const response = await PMS.Api.get('/project-statuses');
      const data = PMS.Api.extractData
        ? PMS.Api.extractData(response)
        : response;

      if (requestId !== state.requestId) return;

      state.items = normalize(data);
      render();
    } catch (error) {
      message('project-status-error',
        error.message || 'دریافت وضعیت‌ها ناموفق بود.', 'danger');
      visible('project-status-error', true);
    } finally {
      if (requestId === state.requestId) {
        visible('project-status-loading', false);
      }
    }
  }

  function render() {
    const tbody = document.getElementById('project-status-table');
    const wrap = document.getElementById('project-status-table-wrap');
    const empty = document.getElementById('project-status-empty');
    if (!tbody || !wrap) return;

    const items = state.items.filter(function (item) {
      return [name(item), val(item, 'Code', 'code'), status(item)]
        .join(' ').toLowerCase().includes(state.search);
    });

    tbody.innerHTML = items.map(function (item) {
      const active = status(item) === 'ACTIVE';
      return `
        <tr>
          <td>${escapeHtml(name(item))}</td>
          <td>${escapeHtml(val(item, 'Code', 'code') || '-')}</td>
          <td>
            <span class="alert ${active ? 'alert-success' : 'alert-warning'}"
                  style="display:inline-block;margin:0;padding:3px 8px">
              ${active ? 'فعال' : 'غیرفعال'}
            </span>
          </td>
          <td>
            <button type="button" class="btn btn-light btn-sm"
                    data-edit="${escapeHtml(id(item))}">ویرایش</button>
            <button type="button" class="btn btn-sm ${active ? 'btn-light' : 'btn-primary'}"
                    data-toggle="${escapeHtml(id(item))}">
              ${active ? 'غیرفعال کردن' : 'فعال کردن'}
            </button>
          </td>
        </tr>`;
    }).join('');

    wrap.hidden = items.length === 0;
    if (empty) {
      empty.hidden = items.length !== 0;
      empty.textContent = state.search
        ? 'وضعیتی مطابق جستجو پیدا نشد.'
        : 'هنوز وضعیتی ثبت نشده است.';
    }

    tbody.querySelectorAll('[data-edit]').forEach(function (button) {
      button.addEventListener('click', function () {
        const item = state.items.find(x => id(x) === this.dataset.edit);
        if (item) showEditor(item);
      });
    });

    tbody.querySelectorAll('[data-toggle]').forEach(function (button) {
      button.addEventListener('click', async function () {
        const item = state.items.find(x => id(x) === this.dataset.toggle);
        if (!item || state.saving) return;

        const nextStatus = status(item) === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
          await save(id(item), { Name: name(item), Status: nextStatus });
        } catch (error) {
          message(
            'project-status-message',
            error && error.message ? error.message : 'تغییر وضعیت ناموفق بود. دوباره تلاش کنید.',
            'danger'
          );
        }
      });
    });
  }

  function showEditor(item) {
    const editing = !!item;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay project-status-modal';
    const previousFocus = document.activeElement;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'project-status-dialog-title');
    modal.style.maxWidth = '520px';
    modal.innerHTML = `
      <div class="modal-header">
        <h3 id="project-status-dialog-title">${editing ? 'ویرایش وضعیت' : 'ایجاد وضعیت جدید'}</h3>
        <button type="button" class="btn btn-light btn-sm" data-close-modal>✕</button>
      </div>
      <div class="modal-body">
        <form id="project-status-form">
          <div class="form-group">
            <label for="project-status-name">نام وضعیت *</label>
            <input id="project-status-name" name="Name" class="form-control"
                   maxlength="150" required value="${escapeHtml(editing ? name(item) : '')}"
                   placeholder="مثلاً در حال تولید">
          </div>
          <div id="project-status-form-error" class="alert alert-danger" hidden></div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">ذخیره</button>
            <button type="button" class="btn btn-light" data-close-modal>انصراف</button>
          </div>
        </form>
      </div>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');

    const onKeyDown = function (event) {
      if (event.key === 'Escape') close();
    };

    function close() {
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
      if (!document.querySelector('.modal-overlay')) {
        document.body.classList.remove('modal-open');
      }
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const firstFocusable = modal.querySelector('input, select, textarea, button');
    if (firstFocusable) firstFocusable.focus();

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay || event.target.closest('[data-close-modal]')) {
        close();
      }
    });

    modal.querySelector('form').addEventListener('submit', async function (event) {
      event.preventDefault();
      const input = this.elements.Name;
      const value = input.value.trim();

      if (!value) {
        message('project-status-form-error', 'نام وضعیت را وارد کنید.', 'danger', overlay);
        return;
      }

      const submit = this.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'در حال ذخیره...';

      try {
        await save(editing ? id(item) : null, {
          Name: value,
          Status: editing ? status(item) : 'ACTIVE'
        });
        close();
      } catch (error) {
        message('project-status-form-error',
          error.message || 'ذخیره وضعیت ناموفق بود.', 'danger', overlay);
      } finally {
        submit.disabled = false;
        submit.textContent = 'ذخیره';
      }
    });

    modal.querySelector('input').focus();
  }

  async function save(itemId, data) {
    if (state.saving) return;
    state.saving = true;

    try {
      if (itemId) {
        await PMS.Api.put('/project-statuses/' + encodeURIComponent(itemId), data);
      } else {
        await PMS.Api.post('/project-statuses', data);
      }

      if (PMS.Api.invalidate) {
        PMS.Api.invalidate('project-statuses');
        // Shared by the project list, project details and project forms.
        PMS.Api.invalidate('dashboard_project_lookups_v1');
      }
      await load();
      message('project-status-message', 'وضعیت با موفقیت ذخیره شد.', 'success');
    } finally {
      state.saving = false;
    }
  }

  function message(elementId, text, type, root) {
    const element = (root || document).querySelector('#' + elementId);
    if (!element) return;
    element.className = 'alert alert-' + type;
    element.textContent = text;
    element.hidden = false;
  }

  function visible(id, show) {
    const element = document.getElementById(id);
    if (element) element.hidden = !show;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  PMS.ProjectStatuses = { init: init, load: load, render: render };
  PMS.Modules = PMS.Modules || {};
  PMS.Modules.ProjectStatuses = PMS.ProjectStatuses;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
