(function () {
  'use strict';
  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};
  const STORAGE_KEY = 'pms_default_project_workflow_v1';

  function unwrap(value) {
    let data = value;
    for (let i = 0; i < 4 && data && data.data !== undefined; i += 1) data = data.data;
    return data;
  }
  function getId(item) { return item && (item.ID || item.Id || item.id || item.WorkflowID || item.WorkflowId); }
  function getName(item) { return item && (item.Name || item.Title || item.WorkflowName || item.Code || getId(item)); }
  function getWorkflows(data) {
    data = unwrap(data);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.workflows)) return data.workflows;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.Workflows)) return data.Workflows;
    return [];
  }
  function ensureWorkflowSettingsUI() {
    let select = document.getElementById('settings-default-workflow');
    let saveButton = document.getElementById('settings-save-workflow');
    if (select && saveButton) return { select: select, saveButton: saveButton };

    const container = document.querySelector('.page-container') || document.getElementById('page-content');
    if (!container) return null;
    let card = container.querySelector('[data-default-workflow-settings]');
    if (!card) {
      card = document.createElement('section');
      card.className = 'card';
      card.setAttribute('data-default-workflow-settings', 'true');
      card.innerHTML =
        '<div class="card-body">' +
          '<h3>تنظیمات گردش کار پروژه‌ها</h3>' +
          '<p>گردش کار پیش‌فرض برای پروژه‌های جدید را از این قسمت انتخاب کنید.</p>' +
          '<div class="form-group">' +
            '<label for="settings-default-workflow">گردش کار پیش‌فرض</label>' +
            '<select id="settings-default-workflow" class="form-control" style="width:100%;min-height:42px;"><option value="">در حال دریافت گردش کارها...</option></select>' +
          '</div>' +
          '<button type="button" id="settings-save-workflow" class="btn btn-primary">ذخیره گردش کار پیش‌فرض</button>' +
        '</div>';
      const heading = container.querySelector('.page-header');
      if (heading && heading.parentNode === container) heading.insertAdjacentElement('afterend', card);
      else container.insertBefore(card, container.firstChild);
    }
    select = document.getElementById('settings-default-workflow');
    saveButton = document.getElementById('settings-save-workflow');
    return select && saveButton ? { select: select, saveButton: saveButton } : null;
  }

  const Settings = {
    init: async function () {
      const controls = ensureWorkflowSettingsUI();
      if (!controls) return;
      const select = controls.select;
      const saveButton = controls.saveButton;
      let message = document.getElementById('settings-message');
      if (!message) {
        message = document.createElement('div');
        message.id = 'settings-message';
        message.setAttribute('role', 'status');
        message.setAttribute('aria-live', 'polite');
        select.closest('[data-default-workflow-settings], .card')?.insertAdjacentElement('beforebegin', message);
      }
      if (message) message.textContent = 'در حال دریافت فهرست گردش کارها...';

      let workflows = [];
      try {
        const response = await window.PMS.Api.get('/workflows');
        workflows = getWorkflows(response).filter(function (item) {
          const status = String(item.Status || item.status || 'ACTIVE').toUpperCase();
          return status !== 'INACTIVE' && status !== 'ARCHIVED' && status !== 'DELETED';
        });
      } catch (error) {
        select.innerHTML = '<option value="">دریافت گردش کارها ناموفق بود</option>';
        if (message) message.textContent = 'بخش تنظیمات نمایش داده شد، اما دریافت فهرست گردش کارها ناموفق بود. دسترسی یا اتصال سرور را بررسی کنید.';
        saveButton.disabled = true;
        console.error('Settings workflow list could not be loaded:', error);
        return;
      }

      const options = workflows.map(function (workflow) {
        return { id: String(getId(workflow) || ''), name: String(getName(workflow) || '') };
      }).filter(function (workflow) { return workflow.id; });
      let saved = '';
      try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch (error) {}
      select.innerHTML = options.length
        ? options.map(function (workflow) {
            const id = workflow.id.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const name = workflow.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return '<option value="' + id + '">' + name + '</option>';
          }).join('')
        : '<option value="">گردش کار فعالی تعریف نشده است</option>';
      select.value = options.some(function (workflow) { return workflow.id === saved; })
        ? saved
        : (options.length ? options[0].id : '');
      saveButton.disabled = !options.length;
      if (message) message.textContent = options.length
        ? 'گردش کار پیش‌فرض پروژه‌های جدید را انتخاب و ذخیره کنید.'
        : 'گردش کار فعالی برای انتخاب وجود ندارد. ابتدا یک گردش کار فعال تعریف کنید.';

      saveButton.onclick = function () {
        const value = String(select.value || '');
        if (!value) {
          if (message) message.textContent = 'ابتدا یک گردش کار انتخاب کنید.';
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, value);
          if (message) message.textContent = 'گردش کار پیش‌فرض ذخیره شد.';
          window.dispatchEvent(new CustomEvent('pms:default-workflow-changed', { detail: { workflowId: value } }));
        } catch (error) {
          if (message) message.textContent = 'ذخیره تنظیمات در این مرورگر ممکن نشد.';
        }
      };
    }
  };
  window.PMS.Settings = Settings;
  window.PMS.Modules.Settings = Settings;
})();